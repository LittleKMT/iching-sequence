# 納甲 App・Codex 專案交接

> 給下一個 Codex 對話窗：請先閱讀本檔，再開始處理使用者的新需求。不要重做專案；先檢查目前 Git 狀態與實際程式，再做最小、精確的修改。

## 專案位置與網站

| 項目 | 內容 |
|---|---|
| GitHub repository | `https://github.com/LittleKMT/iching-sequence` |
| GitHub Pages 根網站 | `https://littlekmt.github.io/iching-sequence/` |
| 納甲 App 公開網址 | `https://littlekmt.github.io/iching-sequence/najia/` |
| 本機專案根目錄 | `E:\OneDrive\OD-2018 US\2026 vibe coding web design\8.唯心宗海外推廣\4.2遊戲APP 納甲\iching-sequence` |
| 納甲 App 主檔 | `E:\OneDrive\OD-2018 US\2026 vibe coding web design\8.唯心宗海外推廣\4.2遊戲APP 納甲\iching-sequence\najia\index.html` |
| Web App manifest | `E:\OneDrive\OD-2018 US\2026 vibe coding web design\8.唯心宗海外推廣\4.2遊戲APP 納甲\iching-sequence\najia\manifest.webmanifest` |
| iPhone 主畫面圖示 | `E:\OneDrive\OD-2018 US\2026 vibe coding web design\8.唯心宗海外推廣\4.2遊戲APP 納甲\iching-sequence\najia\apple-touch-icon.png` |

## 重要邊界

此 repository 內有兩個獨立 App，絕不可混改：

1. 根目錄 `index.html`
   - 《序卦傳・六十四卦記憶》App。
   - 除非使用者明確要求，請勿修改。

2. `najia/index.html`
   - 「六十四卦・六親持世」納甲記憶 App。
   - 接續納甲相關工作時，通常只改這個檔案。

## 每次開始前必做

```powershell
$repo='E:\OneDrive\OD-2018 US\2026 vibe coding web design\8.唯心宗海外推廣\4.2遊戲APP 納甲\iching-sequence'
git -C $repo -c safe.directory=$repo status -sb
git -C $repo -c safe.directory=$repo log -1 --oneline
```

- 先確認是否有使用者未提交的修改。
- 只 add 本次真正修改的檔案；不要使用 `git add -A`。
- Windows Git 若出現 `detected dubious ownership`，永遠用單次 `-c safe.directory=$repo`，不要改全域設定。

## 使用者偏好與 UI 原則

- 預設以繁體中文回覆，先說完成結果，再說最少必要細節。
- 使用者主要在 iPhone mini 直式使用：以 375px 寬度為最低設計基準。
- 字體、卦象、按鈕都要大、粗、清楚，不能橫向溢出。
- 閃卡正面／背面的卦象高度應一致；翻面不可突然展開、跳動或擠壓。
- 「世」必須在正確那一爻的下方，絕不可壓在線上。
- 新功能要最小化增量，不可順便刪除或重新設計其他既有功能。
- 對 iPhone mini 的按鈕可見範圍、翻卡、滑動、固定工具列遮擋都要實際驗證。

## 納甲 App 現有功能

### 1. 選卦學習

- 64 卦索引。
- 可依「卦序」、「BY 宮」、「BY 幾世卦」排列。
- 點卦看大字六爻裝卦、納甲、六親、世應。
- 左右滑動可看上一卦／下一卦。

### 2. 四階段答題訓練

1. 八宮
2. 幾世卦
3. 世爻五行
4. 六親持世

- 有答對／答錯、加強記憶、學習統計與錯題 drill-down。
- 統計保存在該 iPhone Safari 的 `localStorage`，不會同步到其他裝置。

### 3. 六親持世分組練習（不計分翻卡）

- 上方可選：父母、兄弟、子孫、妻財、官鬼、全部、加強訓練。
- 五種六親可多選；「全部」代表全部混合。
- 正面：卦象＋簡短卦名。
- 點一下翻面：卦象保持相同尺寸，在正確世爻下方顯示紅色「世」，並顯示例如「父母持世」。
- 再點一下進下一張。
- 記錄每張卡已看幾次。
- 重開網站時會接續上次的分類、牌組和卡片位置。
- 主動點分類按鈕會重新洗牌，而且第一張不會和前一輪同一張。
- 有「加入加強」與「加強訓練」。

相關函式：

```text
showHoldingFlash()
shuffleHoldingFlash()
saveHoldingFlashProgress()
restoreHoldingFlashProgress()
showHoldingFlashBoosted()
renderHoldingFlash()
```

### 4. 世爻五行分組練習（不計分翻卡）

- 入口按鈕：`世爻五行分組練習`。
- 上方可選：木、火、土、金、水、全部；可多選。
- 正面：卦象＋簡短卦名。
- 翻面：維持相同卦象，紅色「世」在正確世爻下方。
- 背面目前**只**顯示：
  - 世在第幾爻
  - 世爻納甲，例如「亥水」
- 不要在此翻卡背面加回「世爻五行／木行、水行」等文字；使用者已明確要求移除。
- 這不影響第三關「世爻五行」答題訓練；答題關卡仍保留。

相關函式：

```text
showWorldFlash()
shuffleWorldFlash()
saveWorldFlashProgress()
restoreWorldFlashProgress()
renderWorldFlash()
```

### 5. 八卦與六十四卦速度遊戲

- 八卦快速辨識。
- 八卦獵人。
- 六十四卦「看卦象選卦名」及「看卦名選卦象」。
- 會保存最佳紀錄與部分歷史表現。
- 無明確要求時，不要修改這些遊戲。

## localStorage 重要鍵值

```text
najia-memory-stats-v1
najia-memory-progress-v1
najia-holding-flash-seen-v1
najia-holding-flash-progress-v1
najia-world-element-flash-seen-v1
najia-world-element-flash-progress-v1
```

清除 Safari 網站資料會重置這些紀錄；它們不會在裝置間同步。

## 最新已上線狀態

- 最新交接 commit：`435655c Simplify world element flashcard answer`
- `286172a`：新增世爻五行分組翻卡。
- `435655c`：世爻五行翻卡背面改為僅保留「世的位置、世在第幾爻、世爻納甲」。

## 修改後的驗證流程

### 1. JavaScript 語法與 diff 檢查

`index.html` 是 HTML，因此要先抽出 `<script>` 再交給 Node 檢查：

```powershell
$repo='E:\OneDrive\OD-2018 US\2026 vibe coding web design\8.唯心宗海外推廣\4.2遊戲APP 納甲\iching-sequence'
$path=Join-Path $repo 'najia\index.html'
$html=[IO.File]::ReadAllText($path,[Text.Encoding]::UTF8)
$script=[regex]::Match($html,'<script>([\s\S]*?)</script>').Groups[1].Value
[IO.File]::WriteAllText('C:\tmp\najia-syntax-check.js',$script,(New-Object Text.UTF8Encoding($false)))
node --check C:\tmp\najia-syntax-check.js
git -C $repo -c safe.directory=$repo diff --check
```

### 2. 發布流程

```powershell
$repo='E:\OneDrive\OD-2018 US\2026 vibe coding web design\8.唯心宗海外推廣\4.2遊戲APP 納甲\iching-sequence'
git -C $repo -c safe.directory=$repo -c http.sslBackend=openssl fetch origin
git -C $repo -c safe.directory=$repo add najia/index.html
git -C $repo -c safe.directory=$repo commit -m "描述本次修改"
git -C $repo -c safe.directory=$repo rebase origin/main
git -C $repo -c safe.directory=$repo push origin main
```

如有其他使用者的遠端變更，先 rebase 並保留它們；絕不可 force push。

### 3. 公開網站驗證

GitHub Pages / CDN 可能延遲 20–60 秒。Push 成功不等於已上線。

使用新的 cache-busting URL 驗證：

```text
https://littlekmt.github.io/iching-sequence/najia/?build=<最新commit>
```

確認：

1. HTTP 200。
2. 公開 HTML 含本次修改的關鍵文字／函式。
3. 互動按鈕和 iPhone mini 版面實際可用後，才向使用者說「已上線」。

## 若使用者尚未提出新需求

先回覆已理解專案，檢查 Git 狀態與公開網站狀態即可；不要自行增加任何新功能。
