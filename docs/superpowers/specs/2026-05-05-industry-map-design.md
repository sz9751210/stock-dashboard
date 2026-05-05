# Industry Map Design

## Goal

Build a GitHub Pages-ready interactive stock industry map inspired by aistockmap.com, focused on Taiwan AI infrastructure themes. The first version is a static single-page app with enough interaction to feel like a research tool: search, category filters, topic cards, relationship map, company table, heat map, and AI-style insight summaries.

## Scope

The app will use only static files so it can be deployed directly from a GitHub Pages branch or repository root. It will not include login, payment, real-time quotes, or backend data editing. Market data is sample editorial data stored in JavaScript modules and can be replaced later.

## Product Experience

The first screen is the tool itself, not a landing page. A dark, utilitarian dashboard shows a sticky top navigation bar, a concise title block, segmented view controls, category filters, and a content area. Users can move among:

- Industry themes: cards with company count, tags, updated date, summary, and catalyst.
- Relationship map: grouped supply-chain nodes with connecting lines.
- Company database: searchable table of company names, tickers, roles, and themes.
- Heat map: sector tiles sized evenly and colored by score.
- AI analysis: generated-style insight panels derived from the selected dataset.

## Architecture

Use native HTML, CSS, and ES modules. `index.html` loads `src/main.js`; `src/data.js` owns sample data; `src/model.js` owns pure filtering, grouping, scoring, and formatting functions; `src/main.js` owns DOM rendering and event wiring. Tests target `src/model.js` through Node's built-in test runner.

## Data Flow

Static data flows from `src/data.js` into pure model functions. UI state includes active view, active category, and search query. Rendering functions recompute visible topics, companies, and insights from that state and replace the relevant DOM regions.

## Error Handling

The app shows empty states when filters or search return no results. Rendering functions avoid assuming a selected topic exists. Links and deployment instructions avoid absolute paths so the app works from a GitHub Pages project subpath.

## Testing

Automated tests cover filtering, company aggregation, heat map scoring order, relationship grouping, and insight generation. Manual verification covers loading `index.html` through a local static server and checking the main views in the in-app browser.

## Deployment

The repository root will contain `index.html`, `src/`, and `README.md`. GitHub Pages can serve from the root of the default branch. No build command is required.
