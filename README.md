# Mermaid Markdown 預覽器

極簡的瀏覽器端 Mermaid 預覽器：貼上 Markdown（或直接貼 Mermaid 語法）、即時查看圖表、下載 PNG。內容只在瀏覽器內渲染，不會傳送至伺服器。

## 本機啟動

需要 Node.js 20 以上：

```bash
npm install
npm run dev
```

開啟終端機顯示的網址即可使用。

## Docker 部署

```bash
docker build -t markdown-mermaid-preview .
docker run --rm -p 8080:8080 markdown-mermaid-preview
```

瀏覽 `http://localhost:8080`。

推送到 `main` 或 `v*` tag 時，GitHub Actions 會建置並發布映像檔至 GitHub Container Registry（GHCR）。實際名稱為 `ghcr.io/<你的 GitHub 帳號或組織>/markdown-mermaid-preview`。

## GitHub 上的 Demo 網站

推送到 `main` 後，`Deploy demo site to GitHub Pages` workflow 會自動發布靜態網站。第一次使用時，到 GitHub repository 的 **Settings → Pages**，將 Source 設為 **GitHub Actions**；若未啟用，deploy job 會以 `404 / Creating Pages deployment failed` 失敗。完成後，重新執行 workflow 或再推送一次，deploy job 會顯示 Demo 網址，通常是：

`https://<你的 GitHub 帳號或組織>.github.io/<repository 名稱>/`

GitHub Pages 不會執行 Docker；它只託管這個專案建置後的前端檔案，因此正符合本工具在瀏覽器端渲染 Mermaid 的設計。

## 授權

本專案採 [MIT License](LICENSE)。Mermaid 本身也採 MIT License；其授權通知見 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)，並隨 Docker 映像檔提供。
