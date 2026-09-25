"""Copy the reviewed third column into all Zhengshi web volumes.

Usage: python tools/generate-zhengshi-reviewed.py <path-to-3_原始備份【勿刪】>
The source directory is read only. Output is one reviewed-*.json per volume.
"""

import difflib
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def pairs_from_markdown(path):
    pairs = []
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        if not (line.startswith("|") and line.endswith("|")):
            continue
        cells = [cell.strip() for cell in re.split(r"(?<!\\)\|", line[1:-1])]
        if len(cells) < 2 or cells[0] == "原文" or re.fullmatch(r":?-+:?", cells[0]):
            continue
        pairs.append((cells[0], " | ".join(cells[1:])))
    return pairs


def main(source):
    raw_dir = source / "唯心逐字稿_JSON_5963集" / "yijing_zhengshi_baihua"
    review_dir = source / "易經證釋 白話文" / "審訂"
    reviews = {}
    articles_by_volume = {}
    for path in raw_dir.glob("*.json"):
        article = json.loads(path.read_text(encoding="utf-8-sig"))
        article_id = int(article["id"].rsplit("-", 1)[1])
        articles_by_volume.setdefault(int(article["volume_no"]), []).append((article_id, article))
    for path in review_dir.glob("*.json"):
        review = json.loads(path.read_text(encoding="utf-8-sig"))
        article_id = review.get("article_id", "")
        if article_id.startswith("yijing_zhengshi_baihua-"):
            reviews[int(article_id.rsplit("-", 1)[1])] = review

    for volume in sorted(articles_by_volume):
        pairs = pairs_from_markdown(ROOT / "zhengshi" / f"volume-{volume:02}.md")
        originals, revised = [], []
        for article_id, article in sorted(articles_by_volume[volume]):
            original_rows = [line[4:] for line in article["content"].splitlines() if line.startswith("【原文】")]
            review = reviews[article_id]["rows"]
            if len(original_rows) != article["pair_count"] or len(review) != len(original_rows):
                raise ValueError(f"Article {article_id}: source/review row count differs")
            originals.extend(original_rows)
            revised.extend(review[str(row)] for row in range(1, len(original_rows) + 1))

        normalize = lambda value: re.sub(r"\s+", "", value)
        alignment = difflib.SequenceMatcher(
            None, [normalize(value) for value in originals],
            [normalize(pair[0]) for pair in pairs], autojunk=False
        )
        output = [None] * len(pairs)
        headings = 0
        for kind, first, last, start, stop in alignment.get_opcodes():
            if kind == "insert":
                for index in range(start, stop):
                    # Markdown-only topic headings have no third-column review row.
                    if pairs[index][0] != pairs[index][1]:
                        raise ValueError(f"Volume {volume}, row {index + 1}: unexpected extra row")
                    output[index] = pairs[index][1]
                    headings += 1
            elif kind in ("equal", "replace") and last - first == stop - start:
                output[start:stop] = revised[first:last]
            else:
                raise ValueError(f"Volume {volume}: uncertain alignment {kind} {first}:{last} {start}:{stop}")
        if any(value is None for value in output):
            raise ValueError(f"Volume {volume}: missing reviewed rows")
        target = ROOT / "zhengshi" / f"reviewed-{volume:02}.json"
        target.write_text(json.dumps(output, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
        print(f"Volume {volume}: {len(revised)} reviewed rows, {headings} title-only rows -> {target.name}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main(Path(sys.argv[1]))
