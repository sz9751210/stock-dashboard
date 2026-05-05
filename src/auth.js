const MAX_SAVED_ANALYSES = 20;

export function normalizeLoginName(name) {
  return String(name ?? "").trim().replace(/\s+/g, " ").slice(0, 32);
}

export function createUserProfile(name, now = new Date().toISOString()) {
  const normalizedName = normalizeLoginName(name);
  if (!normalizedName) {
    throw new Error("name is required");
  }

  return {
    id: normalizedName.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/gi, "-"),
    name: normalizedName,
    createdAt: now,
  };
}

export function addSavedAnalysis(savedAnalyses, analysis, now = new Date().toISOString()) {
  const nextItem = {
    id: `${analysis.ticker}-${analysis.mode}`,
    savedAt: now,
    ticker: analysis.ticker,
    name: analysis.name,
    mode: analysis.mode,
    totalScore: analysis.totalScore,
    sentiment: analysis.sentiment,
    topicTitle: analysis.topicTitle,
  };

  const deduped = savedAnalyses.filter((item) => item.id !== nextItem.id);
  return [nextItem, ...deduped].slice(0, MAX_SAVED_ANALYSES);
}
