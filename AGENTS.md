# iching-sequence 專案指引

## 專案與範圍

這是部署在 GitHub Pages 的靜態網站，沒有建置框架。根目錄 `index.html` 是《序卦傳・六十四卦記憶》主 App，內含版面、資料與互動程式。`heartmind-data.js` 是心法基礎資料，`heartmind-lecture-data.js` 供心法查詢使用。`eightfold-path.md` 是八正道閱讀內容。`zhengshi/` 是《易經證釋－白話》手機閱讀頁，收錄上經十二冊、下經八冊的正式逐句對照 Markdown 副本，並使用第三欄「白話審訂」資料。`najia/` 是另一個獨立 App，使用自己的 HTML、manifest 與圖示。

## 修改原則

- 先看 `git status` 與相關程式。保留使用者既有的未提交修改。
- 依需求做最小範圍修改。主 App、`najia/` 與 `zhengshi/` 各有獨立功能；沒有明確需求時，不連帶修改其他 App。
- 主 App 與納甲 App 的學習紀錄保存在瀏覽器 `localStorage`。改鍵名或資料結構時需考慮既有紀錄遷移。
- 主要使用情境是 iPhone mini 直向（約 375px 寬）；按鈕、文字和內容都要可讀且不能橫向溢出。涉及平板版面時也檢查 iPad mini。
- 《易經證釋－白話》正本在相鄰的 `9. cjs_DB/3_原始備份【勿刪】/易經證釋 白話文/`。只從正式檔複製到 `zhengshi/`；不要在來源庫的原始備份上修改、刪除或覆蓋檔案。擴充冊數需依使用者指定範圍，並保持原文與白話逐列對應。

## 驗證與發布

- 修改 HTML/JS 後執行 `node tools/check.mjs`；另以 `node --check zhengshi/reader.js` 檢查閱讀器。
- 執行 `git diff --check`，並實際在手機寬度測試受影響的入口、選擇器和閱讀互動。
- `.github/workflows/pages.yml` 在 `main` push 後檢查並部署整個 repository。推送前先確認本次需求是否包含發布；不能只憑本機檔案就宣稱手機公開網址已更新。
- 既有 `AGENT.md` 和 `PROJECT_STARTER_PROMPT.md` 是舊版交接資料，部分狀態與路徑可能過時；以目前程式和 Git 狀態為準。
