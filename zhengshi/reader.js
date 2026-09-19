const volumeNames = ['01｜上經第一冊', '02｜上經第二冊', '03｜上經第三冊'];
const volumeSelect = document.getElementById('volume');
const chapterSelect = document.getElementById('chapter');
const content = document.getElementById('content');
const status = document.getElementById('status');
const cache = new Map();
const firstVolumeLabels = [
  ['本冊導覽', '書名與資料來源'],
  ['列聖名稱', '參與講述的聖賢'],
  ['圖表目錄', '本冊圖表清單'],
  ['例言', '講易宗旨與閱讀方法'],
  ['序', '易道與本書緣起'],
  ['序例', '易經的起源與傳承'],
  ['序例', '講易所用的版本'],
  ['序例', '經傳篇章如何編排'],
  ['全易大旨', '易的源流與卦象'],
  ['全易大旨', '卦象取法天地'],
  ['習易要例', '易道與研習要點'],
  ['習易要例', '先後天圖與卦序'],
  ['習易要例', '學易如何用於教化'],
  ['習易要例', '卦象分合的法則'],
  ['習易要例', '天道人事的感應'],
  ['習易要例', '象例與辭例的運用'],
  ['全易大旨', '聖人傳易與修學宗旨'],
  ['全易大旨', '文字與卦象如何表意'],
  ['圖象', '圖象早於文字'],
  ['圖象', '尋回失傳的古圖'],
  ['圖象', '易內圖與易外圖'],
  ['圖象', '從卦象看氣的變化'],
  ['河圖', '天地氣數與陰陽五行'],
  ['河圖', '九六之數與陰陽'],
  ['河圖', '天道圖數的解說'],
  ['河圖', '萬物生成與修養'],
  ['洛書', '體用與九宮變化'],
  ['洛書', '氣數與後天卦象'],
  ['河洛大旨', '河圖洛書的由來'],
  ['河洛大旨', '道、數與性命'],
  ['河洛大旨', '象數變化與修道'],
  ['河洛大旨', '河洛是易象的根本'],
  ['太極圖', '太極生兩儀四象八卦'],
  ['太極圖', '太極圖的傳承與要義'],
  ['太極圖', '陰陽流行的太極之象'],
];
let chapters = [];
let currentVolume = 0;
let currentChapter = 0;
let textSize = 1.25;
let requestNumber = 0;

volumeNames.forEach((name, index) => volumeSelect.add(new Option(name, index)));

function splitCells(line) {
  return line.slice(1, -1).split(/(?<!\\)\|/).map(cell => cell.trim().replace(/\\\|/g, '|'));
}

function parseVolume(markdown) {
  const result = [];
  let chapter = null;
  let section = '';
  for (const line of markdown.replace(/\r\n/g, '\n').split('\n')) {
    if (line.startsWith('## ')) {
      if (chapter && chapter.lines.some(item => item.trim())) result.push(chapter);
      section = line.slice(3).trim();
      chapter = { title: section, lines: [] };
    } else if (line.startsWith('### ')) {
      if (chapter && chapter.lines.some(item => item.trim())) result.push(chapter);
      chapter = { title: `${section}｜${line.slice(4).trim()}`, lines: [] };
    } else if (chapter) {
      chapter.lines.push(line);
    }
  }
  if (chapter && chapter.lines.some(item => item.trim())) result.push(chapter);
  if (!result.length) throw new Error('找不到篇章');
  return result;
}

function findMarker(chapters, prefix) {
  for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex++) {
    const lineIndex = chapters[chapterIndex].lines.findIndex(line => line.startsWith(prefix));
    if (lineIndex !== -1) return { chapterIndex, lineIndex };
  }
  throw new Error(`第一冊找不到主題起點：${prefix}`);
}

function splitAtMarker(chapters, prefix, title) {
  const { chapterIndex, lineIndex } = findMarker(chapters, prefix);
  if (lineIndex === 0) throw new Error(`第一冊主題分界無法切開：${prefix}`);
  const lines = chapters[chapterIndex].lines.splice(lineIndex);
  chapters.splice(chapterIndex + 1, 0, { title, lines });
}

function moveTopicHeading(chapters, prefix) {
  const { chapterIndex, lineIndex } = findMarker(chapters, prefix);
  if (chapterIndex + 1 >= chapters.length) throw new Error(`第一冊主題缺少正文：${prefix}`);
  const lines = chapters[chapterIndex].lines.splice(lineIndex);
  chapters[chapterIndex + 1].lines.unshift(...lines);
}

function labelFirstVolume(chapters) {
  splitAtMarker(chapters, '| 易道玄微。', '序');
  moveTopicHeading(chapters, '| 河圖歌');
  moveTopicHeading(chapters, '| 洛書歌');
  splitAtMarker(chapters, '| 河圖負于龍馬。洛書呈于元龜。', '宗主附注');
  moveTopicHeading(chapters, '| 太極圖一');
  if (chapters.length !== firstVolumeLabels.length) throw new Error('第一冊篇章數與主題標籤不符');
  chapters.forEach((chapter, index) => {
    [chapter.topic, chapter.summary] = firstVolumeLabels[index];
    chapter.speaker = index > 4 ? chapter.title.split('｜').at(-1) : '';
  });
  return chapters;
}

function appendText(tag, value, parent = content, className = '') {
  const element = document.createElement(tag);
  element.textContent = value;
  if (className) element.className = className;
  parent.append(element);
  return element;
}

function renderChapter() {
  const chapter = chapters[currentChapter];
  content.replaceChildren();
  appendText('h2', chapter.topic || chapter.title);
  if (chapter.summary) appendText('p', `${chapter.summary}${chapter.speaker ? `｜${chapter.speaker}` : ''}`, content, 'chapter-subtitle');
  for (const line of chapter.lines) {
    const trimmed = line.trim();
    if (!trimmed || /^\|\s*:?-+:?\s*\|/.test(trimmed) || /^\|\s*原文\s*\|\s*白話文\s*\|/.test(trimmed)) continue;
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = splitCells(trimmed);
      if (cells.length < 2) continue;
      const card = appendText('div', '', content, 'pair');
      const original = appendText('div', '', card, 'original');
      appendText('span', '原文', original, 'label');
      appendText('p', cells[0], original);
      const plain = appendText('div', '', card);
      appendText('span', '白話', plain, 'label');
      appendText('p', cells.slice(1).join(' | '), plain);
    } else if (!trimmed.startsWith('>')) {
      appendText('p', trimmed, content, 'note');
    }
  }
  chapterSelect.value = String(currentChapter);
  document.getElementById('previous').disabled = currentVolume === 0 && currentChapter === 0;
  document.getElementById('next').disabled = currentVolume === volumeNames.length - 1 && currentChapter === chapters.length - 1;
  status.textContent = `${volumeNames[currentVolume]}｜第 ${currentChapter + 1} / ${chapters.length} 篇`;
  window.scrollTo(0, 0);
}

async function openVolume(index, chapterIndex = 0) {
  const request = ++requestNumber;
  currentVolume = index;
  volumeSelect.value = String(index);
  content.replaceChildren();
  status.textContent = '正在載入本冊…';
  try {
    if (!cache.has(index)) {
      const file = `volume-${String(index + 1).padStart(2, '0')}.md`;
      const response = await fetch(file);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const parsed = parseVolume(await response.text());
      cache.set(index, index === 0 ? labelFirstVolume(parsed) : parsed);
    }
    if (request !== requestNumber) return;
    chapters = cache.get(index);
    chapterSelect.replaceChildren();
    chapters.forEach((chapter, i) => {
      const label = chapter.topic
        ? `${i + 1}. ${chapter.topic}：${chapter.summary}${chapter.speaker ? `｜${chapter.speaker}` : ''}`
        : `${i + 1}. ${chapter.title}`;
      chapterSelect.add(new Option(label, i));
    });
    currentChapter = Math.max(0, Math.min(chapterIndex, chapters.length - 1));
    renderChapter();
  } catch (error) {
    if (request !== requestNumber) return;
    status.textContent = '載入失敗，請確認網路後重新選擇冊別。';
    appendText('p', String(error.message));
  }
}

volumeSelect.addEventListener('change', () => openVolume(Number(volumeSelect.value)));
chapterSelect.addEventListener('change', () => { currentChapter = Number(chapterSelect.value); renderChapter(); });
document.getElementById('previous').addEventListener('click', () => {
  if (currentChapter > 0) { currentChapter--; renderChapter(); }
  else if (currentVolume > 0) openVolume(currentVolume - 1, Number.MAX_SAFE_INTEGER);
});
document.getElementById('next').addEventListener('click', () => {
  if (currentChapter < chapters.length - 1) { currentChapter++; renderChapter(); }
  else if (currentVolume < volumeNames.length - 1) openVolume(currentVolume + 1);
});
document.getElementById('toggle').addEventListener('click', event => {
  const visible = document.body.classList.toggle('plain-only');
  event.currentTarget.textContent = visible ? '顯示原文' : '只看白話';
  event.currentTarget.setAttribute('aria-pressed', String(!visible));
});
document.getElementById('decrease').addEventListener('click', () => {
  textSize = Math.max(1.1, textSize - .1);
  document.documentElement.style.setProperty('--size', `${textSize}rem`);
});
document.getElementById('increase').addEventListener('click', () => {
  textSize = Math.min(2, textSize + .1);
  document.documentElement.style.setProperty('--size', `${textSize}rem`);
});
openVolume(0);
