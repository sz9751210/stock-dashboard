import test from "node:test";
import assert from "node:assert/strict";

import { addSavedAnalysis, createUserProfile, normalizeLoginName } from "../src/auth.js";

test("createUserProfile normalizes local login names", () => {
  assert.deepEqual(createUserProfile("  Alan   Wang  ", "2026-05-05T00:00:00.000Z"), {
    id: "alan-wang",
    name: "Alan Wang",
    createdAt: "2026-05-05T00:00:00.000Z",
  });
  assert.equal(normalizeLoginName("  台股  研究員  "), "台股 研究員");
});

test("createUserProfile rejects empty names", () => {
  assert.throws(() => createUserProfile("   "), /name is required/);
});

test("addSavedAnalysis dedupes and keeps newest item first", () => {
  const saved = addSavedAnalysis(
    [{ id: "2330-bullish", ticker: "2330", mode: "bullish", savedAt: "old" }],
    {
      ticker: "2330",
      name: "台積電",
      mode: "bullish",
      totalScore: 92.5,
      sentiment: "偏多",
      topicTitle: "主動式 ETF",
    },
    "2026-05-05T00:00:00.000Z",
  );

  assert.equal(saved.length, 1);
  assert.deepEqual(saved[0], {
    id: "2330-bullish",
    savedAt: "2026-05-05T00:00:00.000Z",
    ticker: "2330",
    name: "台積電",
    mode: "bullish",
    totalScore: 92.5,
    sentiment: "偏多",
    topicTitle: "主動式 ETF",
  });
});
