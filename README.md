# 毛毛聊每日經課

以詩篇開始、為手機閱讀而設計的繁體中文每日經課網站。

網站會按照使用者裝置的所在地日期自動選取當日內容，毋須每日重新上載頁面；
使用者亦可將網站加入手機主畫面，以貓貓圖示開啟。

## 現有功能

- 詩篇、舊約、新約及今日默想
- 內置《和合本》完整經文，可展開或收起
- 完整支援 RCL A、B、C 三年循環（半連續讀經）
- 每日自動讀取官方當日經課並組合《和合本》全文
- 保留前後各兩天內容，按使用者所在地日期自動切換
- 手機、平板及電腦版面
- iPhone、iPad、Android 及桌面安裝圖示
- 「加入主畫面」圖文教學
- 41 幅毛毛聊原創主題插畫

## 每日資料更新

GitHub Actions 每日從 Vanderbilt Divinity Library 的 RCL 官方網頁讀取一個五日流動視窗，
選用半連續讀經，再從 eBible 的 Public Domain《和合本》USFM 檔案組合全文。

因此 A、B、C 三年循環會隨官方經課持續運作，毋須逐日修改或上載內容。
瀏覽器按使用者自己的所在地日期顯示當日資料；前後各兩日的緩衝可照顧全球時區。

### 固定主題及默想編排

三年循環共有 1,072 組不重複的經課組合。每一組均已逐篇閱讀及獨立編寫 topic、
題下小字、各段重點句及默想內容，沒有在每日更新時擷取經文片段再套入固定句式；
題下小字及默想亦不會在不同組合重複。遇到戰爭、集體刑罰、虐待或其他容易被誤用的
古代文本，內容會交代其經文脈絡及今日不可用作傷害人的界線；合適時以新約經文帶出
當日的核心信仰與實踐方向，但不會刪去或扭曲舊約。RCL 列出《巴錄書》時，網站採用
同一經課所列的六十六卷新教正典替代經文。

網頁顯示的題下小字最多 30 個字、最多三句；較完整的釋經脈絡和安全提醒另存為
內部 `editorialNote`，不會擠進主題版面。人手核對清單會同時列出兩者，以免精簡時遺失
編輯判斷。

每一組經課出處亦有固定的循環識別碼，以上人工編定內容不依賴即時人工或網上 AI。

三年後相同經課再次出現，系統會取回相同識別及編排，毋須重新設定。
復活節、大齋期、將臨期等日期會按教會年曆重新計算，因此即使公曆日期改變仍可繼續使用。

`public/cat-readings.js` 內原有的 14 日內容只作第一次更新前及離線預覽的後備資料。
每日產生的 `public/daily-content.js` 不需要手動編輯。

## 本機預覽

直接開啟 `public/index.html`，即可查看網站。

如要測試完整的網站安裝功能，須經 HTTPS 網址開啟；本機檔案預覽仍可查看安裝教學。

## 使用 GitHub Pages 發佈

本儲存庫已包含自動發佈設定。第一次使用時：

1. 在 GitHub 開啟本儲存庫的 **Settings**。
2. 在左側選擇 **Pages**。
3. 在 **Build and deployment** 下，將 **Source** 設為 **GitHub Actions**。
4. 等候 **Actions** 頁面的「Deploy GitHub Pages」完成。
5. 返回 **Settings → Pages**，即可看到網站網址。

如儲存庫名稱是 `daily-readings`，網址通常會是：
`https://你的GitHub帳戶.github.io/daily-readings/`

日後 GitHub Actions 會在每日 00:17 UTC 自動產生當日資料及重新發佈，
亦可在 **Actions → Deploy GitHub Pages → Run workflow** 手動執行一次。
更新 `main` 或 `master` 分支時亦會重新產生及發佈。

更新工作需要從以下兩個官方來源下載資料：

- Vanderbilt Divinity Library 的 RCL Daily Readings
- eBible 的 `cmn-cu89t_usfm.zip`

如果官方來源及適用的本地後備資料都無法提供已核對內容，該次 workflow 會停止，
已公開的上一個成功版本不會被取代。

### 資料核對及後備方案

- 官方經課出處會與儲存庫內已核對的三年 RCL 資料比對；在該三年範圍內，來源無法讀取
  或結果不一致時會改用本地資料。
- 從 eBible 下載的《和合本》會逐節與本地已核對經文比對；下載失敗或內容不一致時，
  改用本地經文。
- 每日五日視窗內的經課必須全部配對到已審閱編輯內容。任何未知出處、缺章缺節或未審閱
  組合都會令工作停止，不會猜測經文或發佈部分錯誤內容。
- 若日期超出本地後備經課範圍，而官方來源同時無法讀取，GitHub Pages 不會執行新部署，
  已公開的上一個成功版本會原封不動保留。

### 人手核對清單

執行 `npm run review:export` 會產生 `review/editorial-cycle-review.txt`。清單按循環日期排列，
列出每組經課實際使用的 topic 圖檔、經課出處、題下小字、重點句全文及默想，方便逐項核對。

## 建置及測試

需要 Node.js 18 或以上版本。

```bash
npm install
npm run build
npm test
```

本機品質檢查會產生 `dist` 測試輸出；GitHub Pages 不會使用這個資料夾，
並會直接發佈 `public` 內的正式網站。

## 主要檔案

- `public/index.html`：正式網頁
- `public/cat-style.css`：版面與響應式設計
- `public/cat-readings.js`：每日經課資料及日期切換
- `public/cat-full-texts.js`：《和合本》完整經文
- `public/daily-content.js`：每日自動產生的五日流動內容
- `public/assets/topics/`：主題插畫
- `public/icons/`：瀏覽器及主畫面圖示
- `public/manifest.webmanifest`：可安裝網站設定
- `.github/workflows/deploy-pages.yml`：GitHub Pages 自動發佈
- `scripts/update-daily-content.mjs`：RCL 與《和合本》每日內容產生器
- `data/editorial-plan.json`：1,072 組已審閱的固定主題、重點句及默想編排
- `data/editorial/`：逐批保留的編輯原稿
- `review/editorial-cycle-review.txt`：供人手逐項核對的純文字清單
- `scripts/export-editorial-review.mjs`：重新產生核對清單
- `build.mjs`：部署建置
- `tests/site.test.mjs`：網站測試

## 內容與版權

插畫、品牌標誌及視覺設計版權 © 2026 毛毛聊 CinGaryee。
《和合本》電子經文來源、RCL 經課出處與公開使用注意事項詳見
[COPYRIGHT.md](COPYRIGHT.md)。
