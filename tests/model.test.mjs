import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCompanyIndex,
  filterCompanies,
  createAnalysisReport,
  createAiRankingReport,
  buildHeatMap,
  createInsights,
  filterTopics,
  groupRelationships,
} from "../src/model.js";

const sampleTopics = [
  {
    id: "asic",
    title: "ASIC 設計",
    category: "半導體鏈",
    score: 92,
    updatedAt: "2026-05-01",
    summary: "AI 加速器與客製晶片設計",
    catalyst: "CSP 自研晶片需求升溫",
    companies: [
      { ticker: "3035", name: "智原", role: "ASIC 設計服務", market: "TW" },
      { ticker: "3443", name: "創意", role: "先進製程 ASIC", market: "TW" },
    ],
    relationships: [
      { group: "上游 IP", label: "SerDes IP" },
      { group: "設計服務", label: "ASIC Turnkey" },
    ],
  },
  {
    id: "thermal",
    title: "AI 散熱",
    category: "硬體基建",
    score: 87,
    updatedAt: "2026-04-28",
    summary: "伺服器液冷與機殼散熱",
    catalyst: "GB200 機櫃功耗提高",
    companies: [
      { ticker: "3324", name: "雙鴻", role: "散熱模組", market: "TW" },
      { ticker: "3017", name: "奇鋐", role: "液冷系統", market: "TW" },
    ],
    relationships: [
      { group: "材料", label: "導熱材料" },
      { group: "系統", label: "液冷 CDU" },
    ],
  },
];

test("filterTopics returns category matches and search matches", () => {
  assert.deepEqual(
    filterTopics(sampleTopics, { category: "半導體鏈", query: "" }).map((topic) => topic.id),
    ["asic"],
  );

  assert.deepEqual(
    filterTopics(sampleTopics, { category: "全部", query: "液冷" }).map((topic) => topic.id),
    ["thermal"],
  );
});

test("buildCompanyIndex flattens companies with topic context", () => {
  const companies = buildCompanyIndex(sampleTopics);

  assert.equal(companies.length, 4);
  assert.deepEqual(companies[0], {
    ticker: "3035",
    name: "智原",
    role: "ASIC 設計服務",
    market: "TW",
    topicId: "asic",
    topicTitle: "ASIC 設計",
    category: "半導體鏈",
  });
});

test("filterCompanies returns only rows matching the query", () => {
  const companies = buildCompanyIndex(sampleTopics);

  assert.deepEqual(
    filterCompanies(companies, "雙鴻").map((company) => company.ticker),
    ["3324"],
  );
});

test("buildHeatMap sorts categories by average score descending", () => {
  assert.deepEqual(buildHeatMap(sampleTopics), [
    { category: "半導體鏈", averageScore: 92, topicCount: 1, companyCount: 2 },
    { category: "硬體基建", averageScore: 87, topicCount: 1, companyCount: 2 },
  ]);
});

test("groupRelationships groups nodes by supply-chain stage", () => {
  assert.deepEqual(groupRelationships(sampleTopics[0]), [
    { group: "上游 IP", nodes: ["SerDes IP"] },
    { group: "設計服務", nodes: ["ASIC Turnkey"] },
  ]);
});

test("createInsights highlights the highest score and newest update", () => {
  const insights = createInsights(sampleTopics);

  assert.equal(insights[0].title, "最高動能題材");
  assert.match(insights[0].body, /ASIC 設計/);
  assert.match(insights[1].body, /2026-05-01/);
});

test("createInsights respects company query when reporting company breadth", () => {
  const insights = createInsights(sampleTopics, { query: "雙鴻" });

  assert.match(insights[2].body, /1 筆公司角色/);
});

test("createAnalysisReport returns ranked themes, catalysts, stages, roles, and watchlist", () => {
  const report = createAnalysisReport(sampleTopics, { query: "AI" });

  assert.deepEqual(
    report.momentumRanking.map((item) => item.id),
    ["asic", "thermal"],
  );
  assert.deepEqual(report.catalysts[0], {
    title: "ASIC 設計",
    catalyst: "CSP 自研晶片需求升溫",
    updatedAt: "2026-05-01",
    score: 92,
  });
  assert.deepEqual(report.supplyChainCoverage, [
    { group: "上游 IP", count: 1 },
    { group: "設計服務", count: 1 },
    { group: "材料", count: 1 },
    { group: "系統", count: 1 },
  ]);
  assert.deepEqual(report.roleBreakdown, [
    { role: "ASIC 設計服務", count: 1 },
    { role: "先進製程 ASIC", count: 1 },
    { role: "散熱模組", count: 1 },
    { role: "液冷系統", count: 1 },
  ]);
  assert.equal(report.watchlist[0].label, "ASIC 設計");
  assert.match(report.watchlist[0].reason, /CSP 自研晶片需求升溫/);
});

test("createAiRankingReport builds bullish scorecards with five factors", () => {
  const report = createAiRankingReport(sampleTopics, { mode: "bullish", query: "" });

  assert.equal(report.title, "看多 Top 10");
  assert.equal(report.items.length, 4);
  assert.equal(report.items[0].sentiment, "偏多");
  assert.deepEqual(Object.keys(report.items[0].factors), [
    "題材面",
    "基本面",
    "技術面",
    "籌碼面",
    "新聞面",
  ]);
  assert.ok(report.items[0].totalScore >= report.items[1].totalScore);
});

test("createAiRankingReport supports bearish, short momentum, personal, and swing states", () => {
  const bearish = createAiRankingReport(sampleTopics, { mode: "bearish", query: "" });
  const short = createAiRankingReport(sampleTopics, { mode: "short", query: "" });
  const personal = createAiRankingReport(sampleTopics, { mode: "personal", query: "" });
  const swing = createAiRankingReport(sampleTopics, { mode: "swing", query: "" });

  assert.equal(bearish.items[0].sentiment, "偏空");
  assert.ok(bearish.items[0].totalScore <= bearish.items[1].totalScore);
  assert.equal(short.items[0].strategy, "短線動能 (Beta)");
  assert.equal(personal.requiresLogin, true);
  assert.match(swing.emptyMessage, /排行榜尚無資料/);
});
