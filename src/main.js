import {
  activeEtfMarketNote,
  activeEtfs,
  categories,
  etfEdgeMeta,
  marketSnapshots,
  topics,
} from "./data.js";
import { addSavedAnalysis, createUserProfile } from "./auth.js";
import {
  buildCompanyIndex,
  buildHeatMap,
  createAiRankingReport,
  createDailyFocusReport,
  createEtfDashboard,
  createMarketSnapshot,
  filterCompanies,
  filterTopics,
  groupRelationships,
} from "./model.js";

const USER_KEY = "ai-industry-map-user";
const SAVED_ANALYSES_KEY = "ai-industry-map-saved-analyses";

const state = {
  view: "themes",
  category: "全部",
  query: "",
  selectedTopicId: topics[0]?.id ?? "",
  analysisMode: "bullish",
  user: loadJson(USER_KEY, null),
  savedAnalyses: loadJson(SAVED_ANALYSES_KEY, []),
};

const content = document.querySelector("#content");
const viewTitle = document.querySelector("#view-title");
const searchInput = document.querySelector("#search-input");
const categoryFilters = document.querySelector("#category-filters");
const topicCount = document.querySelector("#topic-count");
const companyCount = document.querySelector("#company-count");
const topScore = document.querySelector("#top-score");
const authButton = document.querySelector("#auth-button");

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function refreshAuthButton() {
  authButton.textContent = state.user ? `${state.user.name} · 登出` : "登入";
}

function openLoginModal() {
  const modal = document.createElement("div");
  modal.className = "auth-modal";
  modal.innerHTML = `
    <form class="auth-card">
      <button class="modal-close" type="button" aria-label="關閉">×</button>
      <p class="eyebrow">Local Account</p>
      <h2>本機登入</h2>
      <p>這是 GitHub Pages 可用的前端會員模式，資料只存在此瀏覽器。</p>
      <label>
        <span>顯示名稱</span>
        <input name="name" autocomplete="name" placeholder="例如：台股研究員" required />
      </label>
      <button class="mock-button" type="submit">登入並啟用我的分析</button>
    </form>
  `;

  document.body.append(modal);
  modal.querySelector("input").focus();
  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.closest(".modal-close")) modal.remove();
  });
  modal.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    state.user = createUserProfile(formData.get("name"));
    saveJson(USER_KEY, state.user);
    refreshAuthButton();
    modal.remove();
    if (state.view === "analysis") render();
  });
}

function logout() {
  if (!state.user) {
    openLoginModal();
    return;
  }

  const confirmed = window.confirm("要登出本機會員嗎？收藏分析會保留在此瀏覽器。");
  if (!confirmed) return;
  state.user = null;
  localStorage.removeItem(USER_KEY);
  refreshAuthButton();
  render();
}

function setView(view) {
  state.view = view;
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  render();
}

function setCategory(category) {
  state.category = category;
  renderFilters();
  render();
}

function getVisibleTopics() {
  return filterTopics(topics, { category: state.category, query: state.query });
}

function renderStats(visibleTopics) {
  const companies = filterCompanies(buildCompanyIndex(visibleTopics), state.query);
  topicCount.textContent = String(visibleTopics.length);
  companyCount.textContent = String(companies.length);
  topScore.textContent = String(Math.max(0, ...visibleTopics.map((topic) => topic.score)));
}

function renderFilters() {
  categoryFilters.innerHTML = categories
    .map(
      (category) => `
        <button class="chip ${category === state.category ? "active" : ""}" data-category="${category}">
          ${category}
        </button>
      `,
    )
    .join("");
}

function renderEmpty() {
  content.innerHTML = `
    <div class="empty-state">
      <h2>沒有符合條件的資料</h2>
      <p>請調整搜尋字詞或切換分類。</p>
    </div>
  `;
}

function renderDailyFocus(visibleTopics) {
  const report = createDailyFocusReport(visibleTopics, marketSnapshots, activeEtfs, etfEdgeMeta);

  viewTitle.innerHTML = `
    <div>
      <p class="eyebrow">Daily Focus</p>
      <h2>每日焦點</h2>
      <p class="section-copy">盤前焦點、ETF 早報、量價訊號與風險提示。</p>
    </div>
  `;

  content.innerHTML = `
    <section class="focus-hero">
      <div>
        <span>${report.etfBrief.asOf}</span>
        <h3>${report.lead}</h3>
        <p>${activeEtfMarketNote.body}</p>
      </div>
      <div class="focus-source">
        <strong>${report.etfBrief.sourceLabel}</strong>
        <span>${report.etfBrief.etfCount} ETFs · ${report.etfBrief.totalAum} 億 AUM</span>
        <span>25% 上限使用率 ${report.etfBrief.tsmcLimitUsage}%</span>
      </div>
    </section>
    <div class="focus-layout">
      <section class="focus-panel">
        <div class="panel-kicker">Market Movers</div>
        <h3>量價焦點</h3>
        ${report.marketMovers
          .map(
            (row) => `
              <div class="focus-row">
                <strong>${row.ticker} ${row.name}</strong>
                <span class="${row.changePct >= 0 ? "up-text" : "down-text"}">${row.changePct >= 0 ? "+" : ""}${row.changePct}%</span>
                <small>${row.topicTitle} · ${row.signal}</small>
              </div>
            `,
          )
          .join("")}
      </section>
      <section class="focus-panel">
        <div class="panel-kicker">ETF Morning Brief</div>
        <h3>主動式 ETF 早報</h3>
        <div class="brief-grid">
          <div><span>今日流入</span><strong>${report.etfBrief.dailyInflow}</strong></div>
          <div><span>今日流出</span><strong>${report.etfBrief.dailyOutflow}</strong></div>
          <div><span>週資金流</span><strong>${report.etfBrief.weeklyFlow}</strong></div>
        </div>
        <p>${etfEdgeMeta.marketNote}</p>
        <p>${activeEtfMarketNote.title}：${activeEtfMarketNote.body}</p>
      </section>
      <section class="focus-panel">
        <div class="panel-kicker">Watch Items</div>
        <h3>今日追蹤</h3>
        <ul class="focus-list">
          ${report.watchItems.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </section>
      <section class="focus-panel">
        <div class="panel-kicker">Risk Notes</div>
        <h3>風險提示</h3>
        <ul class="focus-list">
          ${report.riskNotes.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </section>
    </div>
  `;
}

function renderThemes(visibleTopics) {
  viewTitle.innerHTML = `
    <div>
      <p class="eyebrow">Industry Themes</p>
      <h2>題材總覽</h2>
    </div>
  `;

  if (visibleTopics.length === 0) {
    renderEmpty();
    return;
  }

  content.innerHTML = `
    <div class="topic-grid">
      ${visibleTopics
        .map(
          (topic) => `
            <article class="topic-card">
              <div class="card-topline">
                <span class="category">${topic.category}</span>
                <span class="score">${topic.score}</span>
              </div>
              <h3>${topic.title}</h3>
              <p>${topic.summary}</p>
              <div class="catalyst">催化因素：${topic.catalyst}</div>
              <div class="card-footer">
                <span>${topic.companies.length} 家公司</span>
                <span>核實於 ${topic.updatedAt}</span>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderMap(visibleTopics) {
  viewTitle.innerHTML = `
    <div>
      <p class="eyebrow">Supply Chain Map</p>
      <h2>產業地圖</h2>
    </div>
  `;

  if (visibleTopics.length === 0) {
    renderEmpty();
    return;
  }

  const selectedTopic =
    visibleTopics.find((topic) => topic.id === state.selectedTopicId) ?? visibleTopics[0];
  state.selectedTopicId = selectedTopic.id;
  const groups = groupRelationships(selectedTopic);

  content.innerHTML = `
    <div class="map-layout">
      <aside class="topic-list" aria-label="目前篩選題材">
        ${visibleTopics
          .map(
            (topic) => `
              <button class="topic-selector ${topic.id === selectedTopic.id ? "active" : ""}" data-topic="${topic.id}">
                <span>${topic.category}</span>
                ${topic.title}
              </button>
            `,
          )
          .join("")}
      </aside>
      <div class="relationship-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">${selectedTopic.category}</p>
            <h3>${selectedTopic.title}</h3>
          </div>
          <span class="score large">${selectedTopic.score}</span>
        </div>
        <div class="relationship-map">
          ${groups
            .map(
              (group, groupIndex) => `
                <section class="stage" style="--stage-index:${groupIndex}">
                  <h4>${group.group}</h4>
                  <div class="node-row">
                    ${group.nodes.map((node) => `<span class="node">${node}</span>`).join("")}
                  </div>
                </section>
              `,
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function renderCompanies(visibleTopics) {
  viewTitle.innerHTML = `
    <div>
      <p class="eyebrow">Company Database</p>
      <h2>公司資料庫</h2>
    </div>
  `;

  const companies = filterCompanies(buildCompanyIndex(visibleTopics), state.query);
  if (companies.length === 0) {
    renderEmpty();
    return;
  }

  content.innerHTML = `
    <div class="market-tape">
      ${createMarketSnapshot(visibleTopics, marketSnapshots)
        .slice(0, 6)
        .map(
          (row) => `
            <div class="ticker-pill ${row.changePct >= 0 ? "up" : "down"}">
              <strong>${row.ticker} ${row.name}</strong>
              <span>${row.lastPrice} · ${row.changePct >= 0 ? "+" : ""}${row.changePct}%</span>
            </div>
          `,
        )
        .join("")}
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>代號</th>
            <th>公司</th>
            <th>角色</th>
            <th>題材</th>
            <th>市場</th>
            <th>twstock Snapshot</th>
          </tr>
        </thead>
        <tbody>
          ${companies
            .map((company) => {
              const snapshot = marketSnapshots.find((item) => item.ticker === company.ticker);
              return `
                <tr>
                  <td>${company.ticker}</td>
                  <td>${company.name}</td>
                  <td>${company.role}</td>
                  <td>${company.topicTitle}</td>
                  <td>${company.market}</td>
                  <td>${snapshot ? `${snapshot.lastPrice} / ${snapshot.changePct >= 0 ? "+" : ""}${snapshot.changePct}% · ${snapshot.signal}` : "待更新"}</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderHeat(visibleTopics) {
  viewTitle.innerHTML = `
    <div>
      <p class="eyebrow">Momentum Heatmap</p>
      <h2>熱力圖</h2>
    </div>
  `;

  const heatMap = buildHeatMap(visibleTopics);
  if (heatMap.length === 0) {
    renderEmpty();
    return;
  }

  content.innerHTML = `
    <div class="heat-grid">
      ${heatMap
        .map(
          (item) => `
            <article class="heat-tile" style="--heat:${item.averageScore}">
              <span>${item.category}</span>
              <strong>${item.averageScore}</strong>
              <small>${item.topicCount} 題材 · ${item.companyCount} 公司角色</small>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderEtfs(visibleTopics) {
  const dashboard = createEtfDashboard(activeEtfs, visibleTopics);

  viewTitle.innerHTML = `
    <div>
      <p class="eyebrow">Active ETF Edge</p>
      <h2>主動式 ETF</h2>
      <p class="section-copy">整合主動式 ETF 資金流、台積電 25% 上限與持股題材交集。</p>
    </div>
  `;

  content.innerHTML = `
    <section class="focus-hero compact">
      <div>
        <span>${etfEdgeMeta.sourceLabel} · ${etfEdgeMeta.asOf}</span>
        <h3>${etfEdgeMeta.marketNote}</h3>
        <p>${activeEtfMarketNote.body}</p>
      </div>
      <div class="focus-source">
        <strong>${activeEtfMarketNote.sourceLabel}</strong>
        <span>${activeEtfMarketNote.publishedAt}</span>
      </div>
    </section>
    <div class="etf-summary-grid">
      <article>
        <span>總規模</span>
        <strong>${dashboard.totalAum}</strong>
        <small>億元</small>
      </article>
      <article>
        <span>今日流入</span>
        <strong>${dashboard.dailyInflow}</strong>
        <small>億元</small>
      </article>
      <article>
        <span>今日流出</span>
        <strong>${dashboard.dailyOutflow}</strong>
        <small>億元</small>
      </article>
      <article>
        <span>週資金流</span>
        <strong>${dashboard.weeklyFlow}</strong>
        <small>億元</small>
      </article>
    </div>
    <div class="etf-layout">
      <section class="etf-panel wide">
        <div class="panel-kicker">Active ETF List</div>
        <h3>主動式 ETF 追蹤</h3>
        <div class="etf-card-list">
          ${dashboard.funds
            .map(
              (etf) => `
                <article class="etf-card">
                  <div>
                    <strong>${etf.ticker} ${etf.name}</strong>
                    <span>${etf.issuer} · 掛牌 ${etf.listingDate}</span>
                    <p>${etf.report}</p>
                  </div>
                  <div class="etf-metrics">
                    <span>AUM ${etf.aum} 億</span>
                    <span class="${etf.dailyFlow >= 0 ? "up-text" : "down-text"}">日流 ${etf.dailyFlow >= 0 ? "+" : ""}${etf.dailyFlow} 億</span>
                    <span>台積電 ${etf.tsmcWeight}%</span>
                  </div>
                  <div class="holding-strip">
                    ${etf.topHoldings.map((holding) => `<span>${holding.name} ${holding.weight}%</span>`).join("")}
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
      <section class="etf-panel">
        <div class="panel-kicker">25% Limit</div>
        <h3>台積電上限監控</h3>
        ${dashboard.tsmcLimit
          .map(
            (item) => `
              <div class="limit-row">
                <span>${item.ticker}</span>
                <div class="bar"><i style="width:${item.tsmcWeight * 4}%"></i></div>
                <strong>${item.roomToLimit}%</strong>
              </div>
            `,
          )
          .join("")}
      </section>
      <section class="etf-panel">
        <div class="panel-kicker">Holdings Overlap</div>
        <h3>持股題材交集</h3>
        <div class="role-cloud">
          ${dashboard.holdingOverlap
            .slice(0, 12)
            .map(
              (item) => `
                <span>${item.name}<b>${item.etfCount}</b><small>${item.topicTitles.join("、") || "未分類"}</small></span>
              `,
            )
            .join("")}
        </div>
      </section>
    </div>
  `;
}

function renderSavedAnalyses() {
  viewTitle.innerHTML = `
    <div>
      <p class="eyebrow">My Analysis</p>
      <h2>我的分析</h2>
      <p class="section-copy">本機登入後儲存在此瀏覽器，不會上傳到伺服器。</p>
    </div>
  `;

  if (!state.user) {
    content.innerHTML = `
      <div class="empty-state ai-empty">
        <h2>請先登入以查看您的分析紀錄</h2>
        <p>GitHub Pages 靜態版使用本機會員資料，登入後可收藏 AI 分析卡片。</p>
        <button class="mock-button" data-login-open>前往登入</button>
      </div>
    `;
    return;
  }

  if (state.savedAnalyses.length === 0) {
    content.innerHTML = `
      <div class="empty-state">
        <h2>${state.user.name}，目前沒有收藏分析</h2>
        <p>切換到看多、看空、短線動能或深度研究，按下「收藏分析」即可加入。</p>
      </div>
    `;
    return;
  }

  content.innerHTML = `
    <div class="saved-grid">
      ${state.savedAnalyses
        .map(
          (item) => `
            <article class="saved-card">
              <span>${item.mode}</span>
              <h3>${item.ticker} ${item.name}</h3>
              <strong>${item.totalScore.toFixed(1)} · ${item.sentiment}</strong>
              <p>${item.topicTitle}</p>
              <small>收藏於 ${item.savedAt.slice(0, 10)}</small>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderAiRankings(visibleTopics) {
  if (state.analysisMode === "personal") {
    renderSavedAnalyses();
    return;
  }

  const report = createAiRankingReport(visibleTopics, {
    mode: state.analysisMode,
    query: state.query,
  });

  viewTitle.innerHTML = `
    <div>
      <p class="eyebrow">AI Score Ranking</p>
      <h2>AI 評分排行榜</h2>
      <p class="section-copy">來自靜態示範資料的 AI 分析結果 · Top 10 · 五面向評分</p>
    </div>
  `;

  const modeButtons = (modes) =>
    modes
      .map(
        (mode) => `
          <button class="ai-mode ${state.analysisMode === mode.id ? "active" : ""}" data-analysis-mode="${mode.id}">
            ${mode.label}
          </button>
        `,
      )
      .join("");

  const emptyMarkup = `
    <div class="empty-state ai-empty">
      <h2>${report.emptyMessage}</h2>
      <p>${report.requiresLogin ? "GitHub Pages 靜態版不提供登入；請切換排行榜模式查看示範分析。" : "切換看多、看空或短線動能模式可查看目前示範資料。"}</p>
    </div>
  `;

  const rankingMarkup = `
    <div class="ai-ranking-list">
      ${report.items
        .map(
          (item) => `
            <article class="ai-score-card ${item.sentiment === "偏空" ? "bearish" : "bullish"}">
              <div class="ai-card-main">
                <div class="rank-badge">${item.rank <= 3 ? ["🥇", "🥈", "🥉"][item.rank - 1] : item.rank}</div>
                <div class="company-heading">
                  <strong>${item.ticker} ${item.name}</strong>
                  <span>${item.sentiment}</span>
                  ${item.strategy ? `<em>${item.strategy}</em>` : ""}
                </div>
              </div>
              <button class="save-analysis" data-save-analysis data-ticker="${item.ticker}" data-name="${item.name}" data-mode="${state.analysisMode}" data-score="${item.totalScore}" data-sentiment="${item.sentiment}" data-topic="${item.topicTitle}">
                收藏分析
              </button>
              <div class="factor-list">
                ${Object.entries(item.factors)
                  .map(
                    ([label, value]) => `
                      <div class="factor-row">
                        <span>${label}</span>
                        <div class="factor-bar"><i style="width:${value}%"></i></div>
                        <strong>${value}</strong>
                      </div>
                    `,
                  )
                  .join("")}
              </div>
              <div class="ai-card-side">
                <strong>${item.totalScore.toFixed(1)}</strong>
                <span>/ 100</span>
              </div>
              <div class="analysis-time">分析時間：${item.analyzedAt} · ${item.topicTitle}</div>
              ${item.researchNote ? `<p class="research-note">${item.researchNote}</p>` : ""}
            </article>
          `,
        )
        .join("")}
    </div>
  `;

  content.innerHTML = `
    <div class="ai-mode-stack">
      <div class="ai-mode-row primary">${modeButtons(report.modes.slice(0, 3))}</div>
      <div class="ai-mode-row secondary">${modeButtons(report.modes.slice(3))}</div>
    </div>
    <div class="analysis-meta">
      <span>最後更新：${report.updatedAtLabel}</span>
      <button class="refresh-button" type="button">重新整理</button>
    </div>
    ${report.items.length === 0 ? emptyMarkup : rankingMarkup}
  `;
}

function render() {
  const visibleTopics = getVisibleTopics();
  renderStats(visibleTopics);

  if (state.view === "daily") renderDailyFocus(visibleTopics);
  if (state.view === "themes") renderThemes(visibleTopics);
  if (state.view === "map") renderMap(visibleTopics);
  if (state.view === "companies") renderCompanies(visibleTopics);
  if (state.view === "etfs") renderEtfs(visibleTopics);
  if (state.view === "heat") renderHeat(visibleTopics);
  if (state.view === "analysis") renderAiRankings(visibleTopics);
}

document.querySelector(".nav").addEventListener("click", (event) => {
  const button = event.target.closest("[data-view]");
  if (button) setView(button.dataset.view);
});

categoryFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (button) setCategory(button.dataset.category);
});

content.addEventListener("click", (event) => {
  if (event.target.closest("[data-login-open]")) {
    openLoginModal();
    return;
  }

  const saveButton = event.target.closest("[data-save-analysis]");
  if (saveButton) {
    if (!state.user) {
      openLoginModal();
      return;
    }

    state.savedAnalyses = addSavedAnalysis(state.savedAnalyses, {
      ticker: saveButton.dataset.ticker,
      name: saveButton.dataset.name,
      mode: saveButton.dataset.mode,
      totalScore: Number(saveButton.dataset.score),
      sentiment: saveButton.dataset.sentiment,
      topicTitle: saveButton.dataset.topic,
    });
    saveJson(SAVED_ANALYSES_KEY, state.savedAnalyses);
    saveButton.textContent = "已收藏";
    return;
  }

  const analysisButton = event.target.closest("[data-analysis-mode]");
  if (analysisButton) {
    state.analysisMode = analysisButton.dataset.analysisMode;
    render();
    return;
  }

  const button = event.target.closest("[data-topic]");
  if (!button) return;

  state.selectedTopicId = button.dataset.topic;
  render();
});

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
});

authButton.addEventListener("click", logout);

renderFilters();
refreshAuthButton();
render();
