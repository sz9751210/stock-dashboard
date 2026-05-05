import { categories, topics } from "./data.js";
import {
  buildCompanyIndex,
  buildHeatMap,
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
  viewTitle.innerHTML = `
    <div>
      <p class="eyebrow">AI Analysis</p>
      <h2>AI 分析</h2>
    </div>
  `;

  content.innerHTML = `
    <div class="insight-grid">
      ${createInsights(visibleTopics, { query: state.query })
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
  `;
}

function render() {
  const visibleTopics = getVisibleTopics();
  renderStats(visibleTopics);

  if (state.view === "themes") renderThemes(visibleTopics);
  if (state.view === "map") renderMap(visibleTopics);
  if (state.view === "companies") renderCompanies(visibleTopics);
  if (state.view === "heat") renderHeat(visibleTopics);
  if (state.view === "analysis") renderAnalysis(visibleTopics);
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
