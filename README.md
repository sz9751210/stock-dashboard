# AI 產業地圖

一個可部署到 GitHub Pages 的靜態互動產業地圖。資料放在 `src/data.js`，前端使用原生 HTML/CSS/JavaScript ES modules，不需要後端或建置流程。

## Local Preview

```bash
rtk python3 -m http.server 4173
```

Open:

```text
http://127.0.0.1:4173/
```

## Test

```bash
rtk node --test tests/model.test.mjs
```

## Deploy To GitHub Pages

1. Push this repository to GitHub.
2. Open the repository settings.
3. Go to Pages.
4. Set Source to "Deploy from a branch".
5. Select the default branch and `/ (root)`.
6. Save and wait for GitHub Pages to publish.

Because all paths are relative, the site works from both a user page domain and a project page subpath.

## Update Data

Edit `src/data.js` to add new themes, companies, catalysts, and relationship nodes. The UI and tests read from the same data shape.
