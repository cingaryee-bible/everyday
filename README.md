# 毛毛聊每日經課

以詩篇開始、為手機閱讀而設計的繁體中文每日經課網站。

網站會按照使用者裝置的所在地日期自動選取當日內容，毋須每日重新上載頁面；
使用者亦可將網站加入手機主畫面，以貓貓圖示開啟。

## 現有功能

- 詩篇、舊約、新約及今日默想
- 內置《和合本》完整經文，可展開或收起
- 按使用者所在地日期自動切換
- 手機、平板及電腦版面
- iPhone、iPad、Android 及桌面安裝圖示
- 「加入主畫面」圖文教學
- 41 幅毛毛聊原創主題插畫

## 目前內容範圍

目前已準備 2026 年 9 月 11 日至 9 月 24 日的每日經課。
日期切換是自動的，但新日期仍須先加入
`public/cat-readings.js` 及 `public/cat-full-texts.js`。

## 本機預覽

直接開啟 `public/index.html`，即可查看網站。

如要測試完整的網站安裝功能，須經 HTTPS 網址開啟；本機檔案預覽仍可查看安裝教學。

## 建置及測試

需要 Node.js 18 或以上版本。

```bash
npm install
npm run build
npm test
```

建置後的 Cloudflare Worker 會輸出至 `dist/server/index.js`。
`dist` 是自動產生的檔案，毋須上載至 GitHub。

## 主要檔案

- `public/index.html`：正式網頁
- `public/cat-style.css`：版面與響應式設計
- `public/cat-readings.js`：每日經課資料及日期切換
- `public/cat-full-texts.js`：《和合本》完整經文
- `public/assets/topics/`：主題插畫
- `public/icons/`：瀏覽器及主畫面圖示
- `public/manifest.webmanifest`：可安裝網站設定
- `build.mjs`：部署建置
- `tests/site.test.mjs`：網站測試

## 內容與版權

插畫、品牌標誌及視覺設計版權 © 2026 毛毛聊 CinGaryee。
《和合本》電子經文來源及其他資料詳見 [COPYRIGHT.md](COPYRIGHT.md)。
