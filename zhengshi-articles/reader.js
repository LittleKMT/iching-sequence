const volumeNames = [
  ...Array.from({ length: 12 }, (_, index) => `${String(index + 1).padStart(2, '0')}｜上經第${['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'][index]}冊`),
  ...Array.from({ length: 8 }, (_, index) => `${String(index + 13).padStart(2, '0')}｜下經第${['一', '二', '三', '四', '五', '六', '七', '八'][index]}冊`),
];
const figurePatterns = new Map([
  ['陽爻圖', ['1']], ['陰爻圖', ['0']], ['二陽爻圖', ['11']], ['陰三爻圖', ['000']],
  ['乾爻圖', ['1']], ['乾三爻圖', ['111']], ['乾卦三爻圖', ['111']], ['乾卦圖', ['111']],
  ['坤三爻圖', ['000']], ['坤卦三爻圖', ['000']], ['離三爻圖', ['101']], ['坎三爻圖', ['010']],
  ['震三爻圖', ['001']], ['艮三爻圖', ['100']], ['巽三爻圖', ['110']], ['兌三爻圖', ['011']],
  ['乾六爻圖', ['111111']], ['坤六爻圖', ['000000']], ['泰卦六爻圖', ['000111']],
  ['否卦六爻圖', ['111000']], ['復卦六爻圖', ['000001']], ['姤卦六爻圖', ['111110']],
  ['震六爻圖', ['001001']], ['觀六爻圖', ['110000']],
  ['四象圖共四', ['11', '10', '01', '00']],
  ['八卦圖共八', ['111', '011', '101', '001', '110', '010', '100', '000']],
]);
const svgNamespace = 'http://www.w3.org/2000/svg';
const volumeSelect = document.getElementById('volume');
const chapterSelect = document.getElementById('chapter');
const content = document.getElementById('content');
const status = document.getElementById('status');
const previousButton = document.getElementById('previous');
const nextButton = document.getElementById('next');
const cache = new Map();
let sourceFigureLabels = new Set();
let articles = [];
let currentVolume = 0;
let currentArticle = 0;
let textSize = Number(localStorage.getItem('zhengshi-articles-text-size-v1')) || 1.25;
let requestNumber = 0;

volumeNames.forEach((name, index) => volumeSelect.add(new Option(name, index)));
document.documentElement.style.setProperty('--size', `${textSize}rem`);

function appendText(tag, value, parent = content, className = '') {
  const element = document.createElement(tag);
  element.textContent = value;
  if (className) element.className = className;
  parent.append(element);
  return element;
}

function appendFigure(parent, label, patterns) {
  const svg = document.createElementNS(svgNamespace, 'svg');
  const width = patterns.length * 32;
  const height = Math.max(...patterns.map(pattern => pattern.length)) * 8 + 2;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', label);
  svg.setAttribute('class', 'figure-symbol');
  svg.style.width = patterns.length === 1 ? '1.6em' : `${patterns.length * 1.6}em`;
  const title = document.createElementNS(svgNamespace, 'title');
  title.textContent = label;
  svg.append(title);
  patterns.forEach((pattern, column) => {
    [...pattern].forEach((line, row) => {
      const pieces = line === '1' ? [[2, 28]] : [[2, 12], [18, 12]];
      pieces.forEach(([offset, pieceWidth]) => {
        const bar = document.createElementNS(svgNamespace, 'rect');
        bar.setAttribute('x', String(column * 32 + offset));
        bar.setAttribute('y', String(row * 8 + 2));
        bar.setAttribute('width', String(pieceWidth));
        bar.setAttribute('height', '4');
        svg.append(bar);
      });
    });
  });
  parent.append(svg);
}

function appendRichText(parent, value) {
  const tokenPattern = /\[([^\]\r\n]+)\]|〔([^〕\r\n]+)〕/g;
  let last = 0;
  for (const match of value.matchAll(tokenPattern)) {
    const squareLabel = match[1];
    const sourceLabel = match[2];
    const patterns = squareLabel && figurePatterns.get(squareLabel);
    const isSpecial = squareLabel === '特殊圖';
    const hasSourceFigure = sourceLabel && sourceFigureLabels.has(sourceLabel);
    if (!patterns && !isSpecial && !hasSourceFigure) continue;
    parent.append(document.createTextNode(value.slice(last, match.index)));
    if (patterns) {
      appendFigure(parent, squareLabel, patterns);
    } else if (isSpecial) {
      appendText('span', '特殊圖（原稿未辨識）', parent, 'figure-unresolved');
    } else {
      const image = document.createElement('img');
      image.className = 'source-figure';
      image.src = `figures/${encodeURIComponent(sourceLabel)}.png`;
      image.alt = sourceLabel;
      image.loading = 'lazy';
      parent.append(image);
    }
    last = match.index + match[0].length;
  }
  parent.append(document.createTextNode(value.slice(last)));
}

function cleanTitle(title) {
  return title.replace(/^[上下]經第[一二三四五六七八九十]+冊[｜|]/, '');
}

function savePosition() {
  localStorage.setItem('zhengshi-articles-position-v1', JSON.stringify({ volume: currentVolume, article: currentArticle }));
  const params = new URLSearchParams({ volume: String(currentVolume + 1), article: String(articles[currentArticle]?.id || 1) });
  history.replaceState(null, '', `#${params}`);
}

function renderArticle() {
  const article = articles[currentArticle];
  content.replaceChildren();
  appendText('h2', cleanTitle(article.title));
  let paragraph = null;
  let paragraphLength = 0;

  for (const row of article.rows) {
    if (row.heading) {
      paragraph = null;
      paragraphLength = 0;
      appendText('h3', row.heading);
    }
    if (!paragraph) {
      paragraph = appendText('p', '', content, 'paragraph');
      paragraphLength = 0;
    }
    appendRichText(paragraph, row.text);
    paragraphLength += row.text.length;

    if (row.note) {
      const note = document.createElement('details');
      note.className = 'note';
      appendText('summary', row.note.kind, note);
      appendRichText(appendText('p', '', note), row.note.text);
      content.append(note);
      paragraph = null;
      paragraphLength = 0;
    } else if (!row.continues || (paragraphLength > 650 && /[。！？]$/.test(row.text.trim()))) {
      paragraph = null;
      paragraphLength = 0;
    }
  }

  chapterSelect.value = String(currentArticle);
  previousButton.disabled = currentVolume === 0 && currentArticle === 0;
  nextButton.disabled = currentVolume === volumeNames.length - 1 && currentArticle === articles.length - 1;
  status.textContent = `${volumeNames[currentVolume]}｜第 ${currentArticle + 1} / ${articles.length} 篇｜全書第 ${article.id} 篇`;
  savePosition();
  window.scrollTo(0, 0);
}

async function loadSourceFigureLabels() {
  if (sourceFigureLabels.size) return;
  const response = await fetch('data/figures.json');
  if (!response.ok) throw new Error(`圖形資料 HTTP ${response.status}`);
  sourceFigureLabels = new Set(await response.json());
}

async function openVolume(index, articleIndex = 0) {
  const request = ++requestNumber;
  currentVolume = index;
  volumeSelect.value = String(index);
  content.replaceChildren();
  status.textContent = '正在載入本冊…';
  try {
    await loadSourceFigureLabels();
    if (!cache.has(index)) {
      const file = `data/volume-${String(index + 1).padStart(2, '0')}.json`;
      const response = await fetch(file);
      if (!response.ok) throw new Error(`正文資料 HTTP ${response.status}`);
      const book = await response.json();
      if (!Array.isArray(book.articles) || !book.articles.length) throw new Error('本冊沒有文章資料');
      cache.set(index, book.articles);
    }
    if (request !== requestNumber) return;
    articles = cache.get(index);
    chapterSelect.replaceChildren();
    articles.forEach((article, articleNumber) => {
      chapterSelect.add(new Option(`${articleNumber + 1}. ${cleanTitle(article.title)}`, articleNumber));
    });
    currentArticle = Math.max(0, Math.min(articleIndex, articles.length - 1));
    renderArticle();
  } catch (error) {
    if (request !== requestNumber) return;
    status.textContent = '載入失敗，請確認網路後重新選擇冊別。';
    appendText('p', error.message);
  }
}

function readStartingPosition() {
  const hash = new URLSearchParams(location.hash.slice(1));
  const requestedVolume = Number(hash.get('volume'));
  const requestedArticleId = Number(hash.get('article'));
  if (requestedVolume >= 1 && requestedVolume <= volumeNames.length) {
    return { volume: requestedVolume - 1, articleId: requestedArticleId };
  }
  try {
    const saved = JSON.parse(localStorage.getItem('zhengshi-articles-position-v1'));
    if (Number.isInteger(saved?.volume) && Number.isInteger(saved?.article)) return saved;
  } catch {}
  return { volume: 0, article: 0 };
}

volumeSelect.addEventListener('change', () => openVolume(Number(volumeSelect.value)));
chapterSelect.addEventListener('change', () => {
  currentArticle = Number(chapterSelect.value);
  renderArticle();
});
previousButton.addEventListener('click', () => {
  if (currentArticle > 0) {
    currentArticle--;
    renderArticle();
  } else if (currentVolume > 0) {
    openVolume(currentVolume - 1, Number.MAX_SAFE_INTEGER);
  }
});
nextButton.addEventListener('click', () => {
  if (currentArticle < articles.length - 1) {
    currentArticle++;
    renderArticle();
  } else if (currentVolume < volumeNames.length - 1) {
    openVolume(currentVolume + 1);
  }
});
document.getElementById('decrease').addEventListener('click', () => {
  textSize = Math.max(1.1, Math.round((textSize - .1) * 10) / 10);
  document.documentElement.style.setProperty('--size', `${textSize}rem`);
  localStorage.setItem('zhengshi-articles-text-size-v1', String(textSize));
});
document.getElementById('increase').addEventListener('click', () => {
  textSize = Math.min(2, Math.round((textSize + .1) * 10) / 10);
  document.documentElement.style.setProperty('--size', `${textSize}rem`);
  localStorage.setItem('zhengshi-articles-text-size-v1', String(textSize));
});

const startingPosition = readStartingPosition();
openVolume(startingPosition.volume, startingPosition.article || 0).then(() => {
  if (startingPosition.articleId) {
    const found = articles.findIndex(article => article.id === startingPosition.articleId);
    if (found !== -1) {
      currentArticle = found;
      renderArticle();
    }
  }
});
