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

## Stock Data With twstock

GitHub Pages cannot run Python at request time, so `twstock` is used as an offline data preparation step. Generate a static snapshot locally, review it, then copy the relevant rows into `marketSnapshots` in `src/data.js`.

```bash
rtk python3 -m pip install twstock
rtk python3 scripts/update_twstock_snapshot.py 2330 2308 3017
```

The company database displays these rows as `twstock Snapshot` data.

The repository also includes `.github/workflows/update-market-snapshot.yml`, which can be run manually or on the weekday schedule to generate `public/market-snapshot.json` with `twstock` and commit it back to the repository.

## AI Analysis

The AI analysis tab mirrors the reference site's ranking workflow in static form:

- My analysis login prompt
- Bullish Top 10
- Bearish Top 10
- Short-term momentum beta ranking
- Swing trend beta empty state
- Deep research scorecards

Each ranking card includes five factors: theme, fundamentals, technicals, chip flow, and news. Scores are deterministic demo scores derived from the static topic and company data.

## Active ETF

The Active ETF tab tracks demo active ETF data inspired by ETFEdge-style summaries:

- total AUM
- daily inflow and outflow
- weekly flow
- Taiwan Semiconductor 25% holding limit room
- top holdings and overlap with industry themes
