import { categories, topics } from "./data.js";
import {
  buildCompanyIndex,
  buildHeatMap,
  createAnalysisReport,
  createAiRankingReport,
  createInsights,
  filterCompanies,
  filterTopics,
  groupRelationships,
} from "./model.js";

const state = {
  view: "themes",
  category: "全部",
  query: "",
  selectedTopicId: topics[0]?.id ?? "",
  analysisMode: "bullish",
};

const content = document.querySelector("#content");
const viewTitle = document.querySelector("#view-title");
const searchInput = document.querySelector("#search-input");
const categoryFilters = document.querySelector("#category-filters");
const topicCount = document.querySelector("#topic-count");
const companyCount = document.querySelector("#company-count");
const topScore = document.querySelector("#top-score");

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
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>代號</th>
            <th>公司</th>
            <th>角色</th>
            <th>題材</th>
            <th>市場</th>
          </tr>
        </thead>
        <tbody>
          ${companies
            .map(
              (company) => `
                <tr>
                  <td>${company.ticker}</td>
                  <td>${company.name}</td>
                  <td>${company.role}</td>
                  <td>${company.topicTitle}</td>
                  <td>${company.market}</td>
                </tr>
              `,
            )
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

function renderAnalysis(visibleTopics) {
  const report = createAnalysisReport(visibleTopics, { query: state.query });

  viewTitle.innerHTML = `
    <div>
      <p class="eyebrow">AI Analysis</p>
      <h2>AI 分析</h2>
    </div>
  `;

  content.innerHTML = `
    <div class="insight-grid">
      ${report.insights
        .map(
          (insight) => `
            <article class="insight-card">
              <span class="spark">✦</span>
              <h3>${insight.title}</h3>
              <p>${insight.body}</p>
            </article>
          `,
        )
        .join("")}
    </div>
    <div class="analysis-layout">
      <section class="analysis-panel wide">
        <div class="panel-kicker">Momentum Ranking</div>
        <h3>動能排行</h3>
        <div class="ranking-list">
          ${report.momentumRanking
            .map(
              (item, index) => `
                <div class="ranking-row">
                  <span class="rank">${index + 1}</span>
                  <div>
                    <strong>${item.title}</strong>
                    <small>${item.category} · ${item.companyCount} 家公司</small>
                  </div>
                  <span class="score">${item.score}</span>
                </div>
              `,
            )
            .join("")}
        </div>
      </section>

      <section class="analysis-panel">
        <div class="panel-kicker">Catalyst Radar</div>
        <h3>催化因素</h3>
        <div class="catalyst-list">
          ${report.catalysts
            .slice(0, 5)
            .map(
              (item) => `
                <article>
                  <strong>${item.title}</strong>
                  <p>${item.catalyst}</p>
                  <span>核實 ${item.updatedAt} · 分數 ${item.score}</span>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>

      <section class="analysis-panel">
        <div class="panel-kicker">Supply Chain</div>
        <h3>供應鏈覆蓋</h3>
        <div class="bar-list">
          ${report.supplyChainCoverage
            .map(
              (item) => `
                <div class="bar-row">
                  <span>${item.group}</span>
                  <div class="bar"><i style="width:${Math.max(18, item.count * 22)}%"></i></div>
                  <strong>${item.count}</strong>
                </div>
              `,
            )
            .join("")}
        </div>
      </section>

      <section class="analysis-panel">
        <div class="panel-kicker">Company Roles</div>
        <h3>公司角色分布</h3>
        <div class="role-cloud">
          ${report.roleBreakdown
            .slice(0, 12)
            .map((item) => `<span>${item.role}<b>${item.count}</b></span>`)
            .join("")}
        </div>
      </section>

      <section class="analysis-panel wide">
        <div class="panel-kicker">Watchlist</div>
        <h3>追蹤清單</h3>
        <div class="watchlist">
          ${report.watchlist
            .map(
              (item) => `
                <article>
                  <div>
                    <strong>${item.label}</strong>
                    <p>${item.reason}</p>
                  </div>
                  <span class="score large">${item.score}</span>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
    </div>
  `;
}

function renderAiRankings(visibleTopics) {
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

  if (state.view === "themes") renderThemes(visibleTopics);
  if (state.view === "map") renderMap(visibleTopics);
  if (state.view === "companies") renderCompanies(visibleTopics);
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

renderFilters();
render();
