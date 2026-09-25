"""Export the verified continuous Zhengshi articles into the public reader.

Usage: python tools/generate-zhengshi-articles.py <path-to-cjs_DB>
The cjs_DB source is read only. Reading-history and annotation snapshots embedded
in the desktop pages are deliberately excluded from the public export.
"""

import json
import re
import shutil
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "zhengshi-articles"


def load_book(path):
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        if line.startswith("const BOOK=") and line.endswith(";"):
            return json.loads(line[len("const BOOK="):-1])
    raise ValueError(f"BOOK data not found in {path.name}")


def clean_book(book):
    articles = []
    for article in book["articles"]:
        rows = []
        for row in article["rows"]:
            clean = {
                "n": row["n"],
                "text": row["text"],
                "continues": bool(row.get("continues")),
            }
            if row.get("heading"):
                clean["heading"] = row["heading"]
            if row.get("note"):
                clean["note"] = {
                    "kind": row["note"].get("kind", "補充說明"),
                    "text": row["note"].get("text", ""),
                }
            rows.append(clean)
        articles.append({"id": article["id"], "title": article["title"], "rows": rows})
    return {"volume": int(book["volume"]), "articles": articles}


def main(source):
    desktop = source / "1_資料庫【平常看這個】"
    pages = list(desktop.glob("易經證釋白話_*冊_連續閱讀.html"))
    books = sorted((clean_book(load_book(path)) for path in pages), key=lambda book: book["volume"])
    if [book["volume"] for book in books] != list(range(1, 21)):
        raise ValueError("Expected one verified continuous-reading page for each of volumes 1-20")
    data_dir = OUTPUT / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    for book in books:
        target = data_dir / f"volume-{book['volume']:02}.json"
        target.write_text(json.dumps(book, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
        print(f"Volume {book['volume']:02}: {len(book['articles'])} articles -> {target.name}")

    figure_source = source / "3_原始備份【勿刪】" / "易經證釋 白話文" / "字形圖"
    figure_target = OUTPUT / "figures"
    figure_target.mkdir(exist_ok=True)
    labels = []
    for path in sorted(figure_source.glob("*.png")):
        shutil.copyfile(path, figure_target / path.name)
        labels.append(path.stem)
    (data_dir / "figures.json").write_text(json.dumps(labels, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Figures: {len(labels)} verified source images")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main(Path(sys.argv[1]))
