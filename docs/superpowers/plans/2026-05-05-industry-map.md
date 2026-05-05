# Industry Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a GitHub Pages-ready static interactive industry map app.

**Architecture:** Use native HTML, CSS, and ES modules. Keep business logic in pure functions under `src/model.js`, sample data in `src/data.js`, and DOM work in `src/main.js`.

**Tech Stack:** HTML, CSS, JavaScript ES modules, Node built-in test runner.

---

## Files

- Create `index.html`: app shell and GitHub Pages entry point.
- Create `src/data.js`: static industry, company, relationship, and update data.
- Create `src/model.js`: pure data functions used by UI and tests.
- Create `src/main.js`: state, rendering, and event handling.
- Create `src/styles.css`: responsive dark dashboard styling.
- Create `tests/model.test.mjs`: Node tests for data logic.
- Create `README.md`: local preview and GitHub Pages deployment instructions.
- Create `.gitignore`: ignore local visual companion and OS files.

## Tasks

### Task 1: Data Model Tests

- [x] Write tests in `tests/model.test.mjs` for topic filtering, company aggregation, heat map sorting, relationship grouping, and AI insight text.
- [x] Run `rtk node --test tests/model.test.mjs` and verify it fails because implementation files do not exist.

### Task 2: Pure Model Implementation

- [ ] Create `src/data.js` with sample AI infrastructure data.
- [ ] Create `src/model.js` exporting the functions required by tests.
- [ ] Run `rtk node --test tests/model.test.mjs` and verify it passes.

### Task 3: Static App UI

- [ ] Create `index.html`, `src/main.js`, and `src/styles.css`.
- [ ] Render all five views from the shared data and model functions.
- [ ] Add responsive behavior for mobile and desktop.
- [ ] Run the local static server and inspect the app in the in-app browser.

### Task 4: Deployment Docs

- [ ] Create `README.md` with GitHub Pages instructions.
- [ ] Create `.gitignore`.
- [ ] Run final verification commands and inspect `git status`.
