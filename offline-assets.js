// Bump this version whenever an offline asset changes.
const ICHING_OFFLINE_VERSION = '2026-10-10-1';
const ICHING_CORE_FILES = [
  './', 'index.html', 'manifest.webmanifest', 'offline.css', 'offline.js', 'offline-assets.js',
  'apple-touch-icon.png', 'favicon.png', 'icons/icon-192.png', 'icons/icon-512.png',
  'heartmind-data.js', 'heartmind-lecture-data.js', 'eightfold-path.md',
];
const ICHING_READING_FILES = [
  'zhengshi/', 'zhengshi/index.html', 'zhengshi/reader.js',
  'zhengshi-articles/', 'zhengshi-articles/index.html', 'zhengshi-articles/reader.js',
  'zhengshi-articles/sw.js', 'zhengshi-articles/data/figures.json',
  ...Array.from({ length: 20 }, (_, index) => {
    const number = String(index + 1).padStart(2, '0');
    return [`zhengshi/volume-${number}.md`, `zhengshi/reviewed-${number}.json`,
      `zhengshi-articles/data/volume-${number}.json`];
  }).flat(),
];
