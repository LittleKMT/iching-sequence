const volumeNames = ['01｜上經第一冊', '02｜上經第二冊', '03｜上經第三冊'];
const volumeSelect = document.getElementById('volume');
const chapterSelect = document.getElementById('chapter');
const content = document.getElementById('content');
const status = document.getElementById('status');
const cache = new Map();
let chapters = [];
let currentVolume = 0;
let currentChapter = 0;
let textSize = 1.15;
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
  appendText('h2', chapter.title);
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
      cache.set(index, parseVolume(await response.text()));
    }
    if (request !== requestNumber) return;
    chapters = cache.get(index);
    chapterSelect.replaceChildren();
    chapters.forEach((chapter, i) => chapterSelect.add(new Option(`${i + 1}. ${chapter.title}`, i)));
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
  textSize = Math.max(.95, textSize - .1);
  document.documentElement.style.setProperty('--size', `${textSize}rem`);
});
document.getElementById('increase').addEventListener('click', () => {
  textSize = Math.min(1.75, textSize + .1);
  document.documentElement.style.setProperty('--size', `${textSize}rem`);
});
openVolume(0);
