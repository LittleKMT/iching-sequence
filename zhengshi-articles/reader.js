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
const hexagramSymbols = Object.freeze({
  乾: '䷀', 坤: '䷁', 屯: '䷂', 蒙: '䷃', 需: '䷄', 訟: '䷅', 師: '䷆', 比: '䷇',
  小畜: '䷈', 履: '䷉', 泰: '䷊', 否: '䷋', 同人: '䷌', 大有: '䷍', 謙: '䷎', 豫: '䷏',
  隨: '䷐', 蠱: '䷑', 臨: '䷒', 觀: '䷓', 噬嗑: '䷔', 賁: '䷕', 剝: '䷖', 復: '䷗',
  無妄: '䷘', 无妄: '䷘', 大畜: '䷙', 頤: '䷚', 大過: '䷛', 坎: '䷜', 離: '䷝', 咸: '䷞',
  恆: '䷟', 恒: '䷟', 遯: '䷠', 大壯: '䷡', 晉: '䷢', 明夷: '䷣', 家人: '䷤', 睽: '䷥', 蹇: '䷦',
  解: '䷧', 損: '䷨', 益: '䷩', 夬: '䷪', 姤: '䷫', 萃: '䷬', 升: '䷭', 困: '䷮',
  井: '䷯', 革: '䷰', 鼎: '䷱', 震: '䷲', 艮: '䷳', 漸: '䷴', 歸妹: '䷵', 豐: '䷶',
  旅: '䷷', 巽: '䷸', 兌: '䷹', 渙: '䷺', 節: '䷻', 中孚: '䷼', 小過: '䷽', 既濟: '䷾', 未濟: '䷿',
});
const hexagramNames = Object.keys(hexagramSymbols).sort((a, b) => b.length - a.length);
const singleHexagramNames = new Set(hexagramNames.filter(name => name.length === 1));
const hexagramExplicitPairs = [
  '乾坤', '坎離', '離坎', '震巽', '巽震', '艮兌', '兌艮', '震艮', '艮震', '巽兌', '兌巽',
  '屯蒙', '需訟', '泰否', '咸恆', '恆咸', '咸恒', '恒咸', '損益', '益損', '夬姤', '姤夬', '剝復', '復剝', '鼎革', '革鼎',
];
const hexagramCommonWords = [
  '需要', '需求', '理解', '了解', '解釋', '解決', '解說', '解開', '離開', '分離', '相離', '不離', '偏離',
  '往復', '回復', '恢復', '反復', '上升', '升降', '升起', '隨之', '隨時', '隨著', '比較', '比方', '比例',
  '比類', '相比', '觀察', '觀看', '客觀', '困難', '困境', '困窮', '改革', '變革', '革新', '革故', '豐收',
  '豐歉', '豐富', '節氣', '時節', '季節', '末節', '節制', '收益', '增益', '利益', '損害', '損失', '減損',
  '蒙蔽', '蒙昧', '老師', '教師', '否則', '能否', '是否', '可否', '臨時', '面臨', '逐漸', '履行', '履歷',
  '謙虛', '謙讓', '恆常', '恒常', '恒久', '永恒', '持恒', '恒心', '恒定', '泰然', '鼎新',
  '乾燥', '乾淨', '乾脆', '乾枯', '乾旱', '乾涸', '屯兵', '屯積', '屯田', '屯駐', '童蒙', '啟蒙',
  '必需', '所需', '無需', '急需', '供需', '訴訟', '爭訟', '興訟', '軍師', '法師', '大師', '師長', '師生', '出師',
  '比如', '比喻', '比擬', '比作', '可比', '對比', '類比', '排比', '比重', '比值', '比賽', '比照', '比起',
  '履約', '履職', '步履', '否定', '謙卑', '謙遜', '謙下', '自謙', '跟隨', '相隨', '隨意', '隨同', '隨機',
  '隨身', '隨處', '隨後', '隨即', '隨便', '來臨', '降臨', '臨危', '觀念', '觀點', '觀測', '觀賞', '觀望',
  '主觀', '反觀', '世界觀', '剝落', '剝削', '剝離', '剝奪', '復原', '復興', '復習', '重復', '脫離', '乖離',
  '遠離', '離散', '距離', '隔離', '背離', '晉升', '損傷', '耗損', '受損', '有損', '受益', '有益', '公益',
  '日益', '提升', '升高', '升級', '受困', '窮困', '困住', '水井', '井水', '井口', '井中', '井田', '井泉',
  '革命', '沿革', '震動', '震驚', '地震', '漸漸', '漸進', '豐盛', '豐滿', '豐厚', '旅行', '旅人', '旅途',
  '旅客', '行旅', '軍旅', '商旅', '調節', '禮節', '細節', '關節', '環節', '章節', '節奏',
  '講解', '詳解', '誤解', '解讀', '化解', '難解', '分解', '解析', '註解', '拆解', '瓦解', '調解', '和解',
  '排解', '解答', '解脫', '解放', '解散', '求解', '見解', '曲解', '破解', '解為', '解作', '如此解',
  '可解', '解《易》', '損及', '缺損', '折損', '助益', '補益', '無益', '康復', '照臨', '君臨',
  '隱遯', '退遯', '豐盈', '豐碩', '豐年', '好比', '困在',
];
const hexagramMultiCommonWords = [
  '如同人', '同人們', '同人類', '家人教育', '家人培養', '家人關係', '家人生活', '家人團聚',
  '大有可為', '大有作為', '大有文章', '犯大過', '鑄成大過', '小過失', '小過錯',
];
const svgNamespace = 'http://www.w3.org/2000/svg';
const volumeSelect = document.getElementById('volume');
const chapterSelect = document.getElementById('chapter');
const pageSelect = document.getElementById('page');
const content = document.getElementById('content');
const pages = document.getElementById('pages');
const status = document.getElementById('status');
const pageIndicator = document.getElementById('page-indicator');
const previousButtons = [document.getElementById('previous'), document.getElementById('bottom-previous')];
const nextButtons = [document.getElementById('next'), document.getElementById('bottom-next')];
const historySummary = document.getElementById('history-summary');
const historyList = document.getElementById('history-list');
const readerSettings = document.getElementById('reader-settings');
const offlineButton = document.getElementById('offline-download');
const offlineStatus = document.getElementById('offline-status');
const offlineCacheName = 'zhengshi-articles-offline-2026-09-25-3';
const cache = new Map();
let sourceFigureLabels = new Set();
let articles = [];
let currentVolume = 0;
let currentArticle = 0;
let currentPage = 0;
let pageCount = 1;
let articlePages = [[]];
let textSize = Number(localStorage.getItem('zhengshi-articles-text-size-v1')) || 1.25;
let readingLog = readJson('zhengshi-articles-reading-log-v1', {});
let requestNumber = 0;
let paginationNumber = 0;
let resizeTimer;
let primaryHexagramSymbols = new Set();

volumeNames.forEach((name, index) => volumeSelect.add(new Option(name, index)));
document.documentElement.style.setProperty('--size', `${textSize}rem`);
readerSettings.open = !window.matchMedia('(max-width:600px)').matches;

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function appendText(tag, value, parent = pages, className = '') {
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

function occurrenceInside(text, start, end, phrases) {
  return phrases.some(phrase => {
    let at = text.indexOf(phrase);
    while (at >= 0) {
      if (start >= at && end <= at + phrase.length) return true;
      at = text.indexOf(phrase, at + 1);
    }
    return false;
  });
}

function singleHexagramHasWordBoundary(text, start, end) {
  const before = start > 0 ? text[start - 1] : '';
  const after = end < text.length ? text[end] : '';
  const following = text.slice(end, end + 8);
  const punctuation = /[，。；：、！？（）「」『』《》\n]/;
  const beforeOk = !before || punctuation.test(before) || /[與及和由以為是說稱對本此其將把成從則乃上下]/.test(before);
  const afterOk = !after || punctuation.test(after) || /^(?:是|為|主|與|及|和|之|的|以|由|在|接|承|相|反|互|顛|變|配|居|能|可|不|上|下|先|後|道|義|用|表示|象徵)/.test(following);
  return beforeOk && afterOk;
}

function singleHexagramIsExplicit(text, start, name) {
  const end = start + name.length;
  const before = start > 0 ? text[start - 1] : '';
  const after = end < text.length ? text[end] : '';
  const following = text.slice(end, end + 8);
  const explicitShiFou = after === '卦' && name === '否' && before === '是' && /[這此即乃]/.test(text[start - 2] || '');
  if (explicitShiFou) return true;
  if (occurrenceInside(text, start, end, hexagramCommonWords)) return false;
  if (after === '卦' || after === '宮' || before === '卦') return true;
  if (/^上[乾坤坎離震巽艮兌](?:、|，)?下[乾坤坎離震巽艮兌]/.test(following)) return true;
  if (/^(?:初[六九]|[六九][二三四五]|上[六九])/.test(following)) return true;
  if (occurrenceInside(text, start, end, hexagramExplicitPairs)) return true;
  const hasWordBoundary = singleHexagramHasWordBoundary(text, start, end);
  if (primaryHexagramSymbols.has(hexagramSymbols[name]) && hasWordBoundary) return true;
  const listMarks = (text.match(/、/g) || []).length;
  if (listMarks >= 2 && (before === '、' || after === '、' || before === '' || after === '')) return true;
  const hasHexagramContext = /(?:卦|八宮|六十四|本宮|本卦|卦序|爻)/.test(text);
  if (hasHexagramContext && hasWordBoundary) return true;
  if (/[為是屬取到從世]/.test(before) && /[、，；。：）]|$/.test(after)) return true;
  return false;
}

function multiHexagramIsExplicit(text, start, name) {
  const end = start + name.length;
  const before = start > 0 ? text[start - 1] : '';
  const after = end < text.length ? text[end] : '';
  const nearby = text.slice(Math.max(0, start - 10), Math.min(text.length, end + 10));
  const following = text.slice(end, end + 8);
  if (occurrenceInside(text, start, end, hexagramMultiCommonWords)) return false;
  if (primaryHexagramSymbols.has(hexagramSymbols[name])) return true;
  if (after === '卦' || after === '宮' || before === '卦') return true;
  if (/^上[乾坤坎離震巽艮兌](?:、|，)?下[乾坤坎離震巽艮兌]/.test(following)) return true;
  if (/^(?:初[六九]|[六九][二三四五]|上[六九])/.test(following)) return true;
  if (/(?:卦象|卦辭|卦名|卦序|卦位|本卦|對卦|互卦|變卦|上卦|下卦|之卦|之象|之義|之用|之辭)/.test(nearby)) return true;
  if (occurrenceInside(text, start, end, hexagramExplicitPairs)) return true;
  if (before === '、' || after === '、') return true;
  if (/[天澤火雷風水山地]/.test(text.slice(Math.max(0, start - 2), start))) return true;
  const sentenceStart = Math.max(text.lastIndexOf('。', start), text.lastIndexOf('；', start), text.lastIndexOf('\n', start)) + 1;
  const sentenceEnd = [text.indexOf('。', end), text.indexOf('；', end), text.indexOf('\n', end)]
    .filter(position => position >= 0).sort((a, b) => a - b)[0] || text.length;
  const sentence = text.slice(sentenceStart, sentenceEnd);
  if (/(?:卦|六十四|八宮|爻)/.test(sentence) && (/[與及和]/.test(before + after) || /[，；：（）]/.test(before + after))) return true;
  return false;
}

function findHexagramMatches(text) {
  const matches = [];
  let position = 0;
  while (position < text.length) {
    const name = hexagramNames.find(candidate => text.startsWith(candidate, position));
    if (!name) {
      position++;
      continue;
    }
    const end = position + name.length;
    const explicit = singleHexagramNames.has(name)
      ? singleHexagramIsExplicit(text, position, name)
      : multiHexagramIsExplicit(text, position, name);
    if (explicit) matches.push({ start: position, end, name, symbol: hexagramSymbols[name] });
    position = explicit ? end : position + 1;
  }
  return matches;
}

function appendHexagramText(parent, value) {
  const matches = findHexagramMatches(value);
  let last = 0;
  matches.forEach(match => {
    parent.append(document.createTextNode(value.slice(last, match.start)));
    const wrapper = document.createElement('span');
    wrapper.className = 'hexagram-name';
    wrapper.title = `${match.name}卦 ${match.symbol}`;
    wrapper.append(document.createTextNode(value.slice(match.start, match.end)));
    const glyph = document.createElement('span');
    glyph.className = 'hexagram-glyph';
    glyph.textContent = match.symbol;
    glyph.setAttribute('aria-hidden', 'true');
    wrapper.append(glyph);
    parent.append(wrapper);
    last = match.end;
  });
  parent.append(document.createTextNode(value.slice(last)));
}

function inferPrimaryHexagramSymbols(article) {
  const inferred = new Set();
  const title = cleanTitle(article.title);
  const bodyHead = article.rows.slice(0, 8)
    .map(row => `${row.heading || ''}${row.text || ''}`)
    .join('')
    .slice(0, 520);
  for (const name of hexagramNames) {
    const positionPattern = `${name}(?:卦|初[六九]|[六九][二三四五]|上[六九])`;
    if (title.includes(`${name}卦`) || new RegExp(positionPattern).test(bodyHead)) {
      inferred.add(hexagramSymbols[name]);
      break;
    }
  }
  return inferred;
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
    appendHexagramText(parent, value.slice(last, match.index));
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
  appendHexagramText(parent, value.slice(last));
}

function cleanTitle(title) {
  return title.replace(/^[上下]經第[一二三四五六七八九十]+冊[｜|]/, '');
}

function updateReadingLog() {
  const article = articles[currentArticle];
  if (!article) return;
  const key = String(article.id);
  const progress = (currentPage + 1) / pageCount;
  const old = readingLog[key] || {};
  readingLog[key] = {
    volume: currentVolume,
    article: currentArticle,
    title: cleanTitle(article.title),
    page: currentPage,
    totalPages: pageCount,
    furthest: Math.max(old.furthest || 0, progress),
    completed: Boolean(old.completed) || currentPage === pageCount - 1,
    updatedAt: Date.now(),
  };
  localStorage.setItem('zhengshi-articles-reading-log-v1', JSON.stringify(readingLog));
  renderReadingLog();
}

function renderReadingLog() {
  const entries = Object.values(readingLog).sort((a, b) => b.updatedAt - a.updatedAt);
  const completed = entries.filter(entry => entry.completed).length;
  historySummary.textContent = `閱讀紀錄：已讀 ${entries.length} 篇｜完成 ${completed} 篇`;
  historyList.replaceChildren();
  if (!entries.length) {
    appendText('p', '開始閱讀後，這裡會保存最近讀到的文章和頁碼。', historyList);
    return;
  }
  entries.slice(0, 8).forEach(entry => {
    const button = appendText(
      'button',
      `${volumeNames[entry.volume]}｜${entry.title}｜第 ${entry.page + 1} / ${entry.totalPages} 頁${entry.completed ? '｜已完成' : ''}`,
      historyList,
      'history-item',
    );
    button.type = 'button';
    button.addEventListener('click', () => {
      document.getElementById('history-panel').open = false;
      openVolume(entry.volume, entry.article, entry.page);
    });
  });
}

function savePosition() {
  const article = articles[currentArticle];
  if (!article) return;
  localStorage.setItem('zhengshi-articles-position-v1', JSON.stringify({
    volume: currentVolume,
    article: currentArticle,
    page: currentPage,
  }));
  const params = new URLSearchParams({
    volume: String(currentVolume + 1),
    article: String(article.id),
    page: String(currentPage + 1),
  });
  window.history.replaceState(null, '', `#${params}`);
}

function updatePageControls() {
  const article = articles[currentArticle];
  pageSelect.value = String(currentPage);
  pageIndicator.textContent = `${currentPage + 1} / ${pageCount}`;
  const atStart = currentVolume === 0 && currentArticle === 0 && currentPage === 0;
  const atEnd = currentVolume === volumeNames.length - 1
    && currentArticle === articles.length - 1
    && currentPage === pageCount - 1;
  previousButtons.forEach(button => { button.disabled = atStart; });
  nextButtons.forEach(button => { button.disabled = atEnd; });
  status.textContent = `${volumeNames[currentVolume]}｜第 ${currentArticle + 1} / ${articles.length} 篇｜全書第 ${article.id} 篇｜第 ${currentPage + 1} / ${pageCount} 頁`;
}

function showPage(index, scrollToPage = false) {
  currentPage = Math.max(0, Math.min(index, pageCount - 1));
  renderCurrentPage();
  updatePageControls();
  savePosition();
  updateReadingLog();
  if (scrollToPage) {
    window.scrollTo({ top: Math.max(0, content.offsetTop - 10), behavior: 'smooth' });
  }
}

function paragraphBlocks(article) {
  const blocks = [{ type: 'title', text: cleanTitle(article.title) }];
  let paragraph = '';
  let paragraphLength = 0;
  const flushParagraph = () => {
    if (paragraph) blocks.push({ type: 'paragraph', text: paragraph });
    paragraph = '';
    paragraphLength = 0;
  };
  for (const row of article.rows) {
    if (row.heading) {
      flushParagraph();
      blocks.push({ type: 'heading', text: row.heading });
    }
    paragraph += row.text;
    paragraphLength += row.text.length;
    if (row.note) {
      flushParagraph();
      blocks.push({ type: 'note', kind: row.note.kind, text: row.note.text });
    } else if (!row.continues || (paragraphLength > 650 && /[。！？]$/.test(row.text.trim()))) {
      flushParagraph();
    }
  }
  flushParagraph();
  return blocks;
}

function takeText(value, limit) {
  if (value.length <= limit) return [value, ''];
  let cut = Math.max(1, Math.min(limit, value.length));
  const lowerBound = Math.floor(cut * .58);
  for (let index = cut; index >= lowerBound; index--) {
    if ('。！？；，、'.includes(value[index - 1])) {
      cut = index;
      break;
    }
  }
  for (const [opening, closing] of [['[', ']'], ['〔', '〕']]) {
    const lastOpening = value.lastIndexOf(opening, cut - 1);
    const lastClosing = value.lastIndexOf(closing, cut - 1);
    if (lastOpening > lastClosing) {
      const nextClosing = value.indexOf(closing, cut);
      cut = nextClosing === -1 ? lastOpening : nextClosing + 1;
    }
  }
  return [value.slice(0, cut), value.slice(cut)];
}

function buildArticlePages(article) {
  const fontPixels = textSize * 20;
  const usableWidth = Math.max(180, content.clientWidth - 42);
  const usableHeight = Math.max(420, Math.min(680, window.innerHeight * .7));
  const charactersPerLine = usableWidth / fontPixels;
  const lineCount = usableHeight / (fontPixels * 1.7);
  const paragraphOverhead = Math.ceil(charactersPerLine * .55);
  const minimumBudget = Math.max(90, Math.floor(160 * 1.25 / textSize));
  const budget = Math.max(minimumBudget, Math.floor(charactersPerLine * lineCount * .88));
  const result = [[]];
  let used = 0;
  const newPage = () => {
    if (result.at(-1).length) result.push([]);
    used = 0;
  };
  const add = (block, weight) => {
    if (used && used + weight > budget) newPage();
    result.at(-1).push(block);
    used += weight;
  };

  for (const block of paragraphBlocks(article)) {
    if (block.type === 'title') {
      add(block, Math.min(budget, block.text.length + 52));
    } else if (block.type === 'heading') {
      if (used > budget - 50) newPage();
      add(block, block.text.length + 28);
    } else if (block.type === 'note') {
      add(block, 34);
    } else {
      let remaining = block.text;
      while (remaining) {
        const wholeLineWeight = Math.ceil(remaining.length / charactersPerLine) * charactersPerLine + paragraphOverhead;
        if (used && wholeLineWeight <= budget && wholeLineWeight > budget - used) newPage();
        if (budget - used < 45 + paragraphOverhead) newPage();
        const available = Math.max(45, budget - used - paragraphOverhead - charactersPerLine);
        const [part, rest] = takeText(remaining, available);
        const lineWeight = Math.ceil(part.length / charactersPerLine) * charactersPerLine;
        add({ type: 'paragraph', text: part }, lineWeight + paragraphOverhead);
        remaining = rest;
        if (remaining) newPage();
      }
    }
  }
  return result.filter(page => page.length);
}

function renderCurrentPage() {
  pages.replaceChildren();
  content.scrollTop = 0;
  for (const block of articlePages[currentPage] || []) {
    if (block.type === 'title') {
      appendRichText(appendText('h2', ''), block.text);
    } else if (block.type === 'heading') {
      appendRichText(appendText('h3', ''), block.text);
    } else if (block.type === 'paragraph') {
      appendRichText(appendText('p', '', pages, 'paragraph'), block.text);
    } else if (block.type === 'note') {
      const note = document.createElement('details');
      note.className = 'note';
      appendText('summary', block.kind, note);
      appendRichText(appendText('p', '', note), block.text);
      pages.append(note);
    }
  }
}

function paginate(requestedPage = 0, scrollToPage = false) {
  const pagination = ++paginationNumber;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (pagination !== paginationNumber) return;
    articlePages = buildArticlePages(articles[currentArticle]);
    pageCount = Math.max(1, articlePages.length);
    pageSelect.replaceChildren();
    for (let index = 0; index < pageCount; index++) {
      pageSelect.add(new Option(`第 ${index + 1} / ${pageCount} 頁`, index));
    }
    showPage(requestedPage, scrollToPage);
  }));
}

function renderArticle(requestedPage = 0, scrollToPage = false) {
  pages.replaceChildren();
  chapterSelect.value = String(currentArticle);
  primaryHexagramSymbols = inferPrimaryHexagramSymbols(articles[currentArticle]);
  paginate(requestedPage, scrollToPage);
}

async function loadSourceFigureLabels() {
  if (sourceFigureLabels.size) return;
  const response = await fetch('data/figures.json');
  if (!response.ok) throw new Error(`圖形資料 HTTP ${response.status}`);
  sourceFigureLabels = new Set(await response.json());
}

async function openVolume(index, articleIndex = 0, pageIndex = 0, articleId = null) {
  const request = ++requestNumber;
  currentVolume = index;
  volumeSelect.value = String(index);
  pages.replaceChildren();
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
    const matchedArticle = articleId ? articles.findIndex(article => article.id === articleId) : -1;
    currentArticle = matchedArticle >= 0
      ? matchedArticle
      : Math.max(0, Math.min(articleIndex, articles.length - 1));
    renderArticle(pageIndex, window.matchMedia('(max-width:600px)').matches);
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
  const requestedPage = Number(hash.get('page'));
  if (requestedVolume >= 1 && requestedVolume <= volumeNames.length) {
    return {
      volume: requestedVolume - 1,
      articleId: requestedArticleId,
      page: requestedPage >= 1 ? requestedPage - 1 : 0,
    };
  }
  const saved = readJson('zhengshi-articles-position-v1', {});
  if (Number.isInteger(saved.volume) && Number.isInteger(saved.article)) {
    return { volume: saved.volume, article: saved.article, page: saved.page || 0 };
  }
  return { volume: 0, article: 0, page: 0 };
}

function previousPage() {
  if (currentPage > 0) {
    showPage(currentPage - 1, true);
  } else if (currentArticle > 0) {
    currentArticle--;
    renderArticle(Number.MAX_SAFE_INTEGER, true);
  } else if (currentVolume > 0) {
    openVolume(currentVolume - 1, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
  }
}

function nextPage() {
  if (currentPage < pageCount - 1) {
    showPage(currentPage + 1, true);
  } else if (currentArticle < articles.length - 1) {
    currentArticle++;
    renderArticle(0, true);
  } else if (currentVolume < volumeNames.length - 1) {
    openVolume(currentVolume + 1, 0, 0);
  }
}

async function offlineAssetUrls() {
  const response = await fetch('data/figures.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`圖形清單 HTTP ${response.status}`);
  const figureLabels = await response.json();
  return [
    './',
    'index.html',
    'reader.js',
    'sw.js',
    'data/figures.json',
    ...Array.from({ length: 20 }, (_, index) => `data/volume-${String(index + 1).padStart(2, '0')}.json`),
    ...figureLabels.map(label => `figures/${encodeURIComponent(label)}.png`),
  ];
}

async function downloadForOffline() {
  if (!('serviceWorker' in navigator) || !('caches' in window)) {
    offlineStatus.textContent = '此瀏覽器不支援離線下載。請改用最新版 Safari 或 Chrome。';
    return;
  }
  offlineButton.disabled = true;
  offlineButton.textContent = '正在準備離線下載…';
  offlineStatus.textContent = '請保持此頁開啟，下載完成前不要關閉。';
  try {
    await navigator.serviceWorker.register('sw.js?v=offline-3', { scope: './', updateViaCache: 'none' });
    await navigator.serviceWorker.ready;
    const urls = await offlineAssetUrls();
    const cache = await caches.open(offlineCacheName);
    let completed = 0;
    for (let start = 0; start < urls.length; start += 5) {
      const group = urls.slice(start, start + 5);
      await Promise.all(group.map(async path => {
        const url = new URL(path, location.href);
        url.hash = '';
        const response = await fetch(url, { cache: 'reload' });
        if (!response.ok) throw new Error(`${path} HTTP ${response.status}`);
        await cache.put(url, response);
        completed++;
        offlineStatus.textContent = `正在下載：${completed} / ${urls.length}`;
      }));
    }
    localStorage.setItem('zhengshi-articles-offline-version', offlineCacheName);
    offlineButton.textContent = '✓ 全 20 冊已下載';
    offlineStatus.textContent = '下載完成。關閉網路後仍可從同一網址閱讀。';
  } catch (error) {
    offlineButton.disabled = false;
    offlineButton.textContent = '重新下載全 20 冊・離線閱讀';
    offlineStatus.textContent = `下載未完成：${error.message}`;
  }
}

async function initializeOfflineReading() {
  if (!('serviceWorker' in navigator) || !('caches' in window)) return;
  try {
    if (localStorage.getItem('zhengshi-articles-offline-version') === offlineCacheName
      && await caches.has(offlineCacheName)) {
      offlineButton.textContent = '✓ 全 20 冊已下載';
      offlineStatus.textContent = '已可離線閱讀；按此按鈕可重新下載最新內容。';
      offlineButton.disabled = false;
    }
    const registration = await navigator.serviceWorker.register('sw.js?v=offline-3', { scope: './', updateViaCache: 'none' });
    await registration.update();
  } catch {}
}

volumeSelect.addEventListener('change', () => openVolume(Number(volumeSelect.value)));
chapterSelect.addEventListener('change', () => {
  currentArticle = Number(chapterSelect.value);
  renderArticle(0, true);
});
pageSelect.addEventListener('change', () => showPage(Number(pageSelect.value), true));
offlineButton.addEventListener('click', downloadForOffline);
previousButtons.forEach(button => button.addEventListener('click', previousPage));
nextButtons.forEach(button => button.addEventListener('click', nextPage));
document.getElementById('decrease').addEventListener('click', () => {
  textSize = Math.max(1.1, Math.round((textSize - .1) * 10) / 10);
  document.documentElement.style.setProperty('--size', `${textSize}rem`);
  localStorage.setItem('zhengshi-articles-text-size-v1', String(textSize));
  paginate(currentPage);
});
document.getElementById('increase').addEventListener('click', () => {
  textSize = Math.min(2, Math.round((textSize + .1) * 10) / 10);
  document.documentElement.style.setProperty('--size', `${textSize}rem`);
  localStorage.setItem('zhengshi-articles-text-size-v1', String(textSize));
  paginate(currentPage);
});

let touchStartX = 0;
let touchStartY = 0;
content.addEventListener('touchstart', event => {
  touchStartX = event.changedTouches[0].clientX;
  touchStartY = event.changedTouches[0].clientY;
}, { passive: true });
content.addEventListener('touchend', event => {
  const differenceX = event.changedTouches[0].clientX - touchStartX;
  const differenceY = event.changedTouches[0].clientY - touchStartY;
  if (Math.abs(differenceX) > 55 && Math.abs(differenceX) > Math.abs(differenceY)) {
    if (differenceX < 0) nextPage();
    else previousPage();
  }
}, { passive: true });

window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (articles[currentArticle]) paginate(currentPage);
  }, 180);
});
if (document.fonts?.ready) document.fonts.ready.then(() => {
  if (articles[currentArticle]) paginate(currentPage);
});

renderReadingLog();
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (sessionStorage.getItem('zhengshi-articles-reloaded-for-update')) return;
    sessionStorage.setItem('zhengshi-articles-reloaded-for-update', '1');
    location.reload();
  });
}
initializeOfflineReading();
const startingPosition = readStartingPosition();
openVolume(
  startingPosition.volume,
  startingPosition.article || 0,
  startingPosition.page || 0,
  startingPosition.articleId || null,
);
