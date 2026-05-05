export function filterTopics(topics, { category = "全部", query = "" } = {}) {
  const normalizedQuery = query.trim().toLowerCase();

  return topics.filter((topic) => {
    const categoryMatches = category === "全部" || topic.category === category;
    const searchable = [
      topic.title,
      topic.category,
      topic.summary,
      topic.catalyst,
      ...topic.companies.flatMap((company) => [company.name, company.ticker, company.role]),
    ]
      .join(" ")
      .toLowerCase();

    return categoryMatches && (!normalizedQuery || searchable.includes(normalizedQuery));
  });
}

export function buildCompanyIndex(topics) {
  return topics.flatMap((topic) =>
    topic.companies.map((company) => ({
      ...company,
      topicId: topic.id,
      topicTitle: topic.title,
      category: topic.category,
    })),
  );
}

export function filterCompanies(companies, query = "") {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return companies;

  return companies.filter((company) =>
    [company.ticker, company.name, company.role, company.topicTitle, company.category, company.market]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery),
  );
}

export function buildHeatMap(topics) {
  const categoryMap = new Map();

  for (const topic of topics) {
    const entry = categoryMap.get(topic.category) ?? {
      category: topic.category,
      scoreTotal: 0,
      topicCount: 0,
      companyCount: 0,
    };

    entry.scoreTotal += topic.score;
    entry.topicCount += 1;
    entry.companyCount += topic.companies.length;
    categoryMap.set(topic.category, entry);
  }

  return [...categoryMap.values()]
    .map((entry) => ({
      category: entry.category,
      averageScore: Math.round(entry.scoreTotal / entry.topicCount),
      topicCount: entry.topicCount,
      companyCount: entry.companyCount,
    }))
    .sort((a, b) => b.averageScore - a.averageScore || a.category.localeCompare(b.category, "zh-Hant"));
}

export function groupRelationships(topic) {
  const groups = new Map();

  for (const relationship of topic.relationships ?? []) {
    const nodes = groups.get(relationship.group) ?? [];
    nodes.push(relationship.label);
    groups.set(relationship.group, nodes);
  }

  return [...groups.entries()].map(([group, nodes]) => ({ group, nodes }));
}

export function createTopicNetwork(topic) {
  const network = topic.network;
  if (!network) {
    return { clusters: [], lanes: [], edgesByType: {} };
  }

  const laneMap = new Map(network.lanes.map((lane) => [lane.id, { ...lane, nodes: [] }]));
  for (const node of network.nodes) {
    const lane = laneMap.get(node.lane);
    if (lane) lane.nodes.push(node);
  }

  const edgesByType = {};
  for (const edge of network.edges) {
    edgesByType[edge.type] = (edgesByType[edge.type] ?? 0) + 1;
  }

  return {
    clusters: network.clusters,
    lanes: [...laneMap.values()],
    edgesByType,
  };
}

export function createInsights(topics, { query = "" } = {}) {
  if (topics.length === 0) {
    return [
      {
        title: "目前沒有符合條件的題材",
        body: "請調整分類或搜尋字詞，系統會重新整理產業摘要與公司清單。",
      },
    ];
  }

  const byScore = [...topics].sort((a, b) => b.score - a.score);
  const byDate = [...topics].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const companyCount = filterCompanies(buildCompanyIndex(topics), query).length;
  const topCategory = buildHeatMap(topics)[0];

  return [
    {
      title: "最高動能題材",
      body: `${byScore[0].title} 目前分數 ${byScore[0].score}，主要催化來自「${byScore[0].catalyst}」。`,
    },
    {
      title: "最新核實資料",
      body: `${byDate[0].title} 於 ${byDate[0].updatedAt} 更新，適合作為本週追蹤清單的起點。`,
    },
    {
      title: "供應鏈廣度",
      body: `目前篩選範圍涵蓋 ${topics.length} 個題材與 ${companyCount} 筆公司角色，其中 ${topCategory.category} 平均分數最高。`,
    },
  ];
}

export function createAnalysisReport(topics, { query = "" } = {}) {
  const topicCompanies = buildCompanyIndex(topics);
  const groupCounts = new Map();
  const roleCounts = new Map();

  for (const topic of topics) {
    for (const relationship of topic.relationships ?? []) {
      groupCounts.set(relationship.group, (groupCounts.get(relationship.group) ?? 0) + 1);
    }
  }

  for (const company of topicCompanies) {
    roleCounts.set(company.role, (roleCounts.get(company.role) ?? 0) + 1);
  }

  const momentumRanking = [...topics]
    .sort((a, b) => b.score - a.score || b.updatedAt.localeCompare(a.updatedAt))
    .map((topic) => ({
      id: topic.id,
      title: topic.title,
      category: topic.category,
      score: topic.score,
      companyCount: topic.companies.length,
    }));

  const catalysts = momentumRanking.map((rankedTopic) => {
    const topic = topics.find((item) => item.id === rankedTopic.id);
    return {
      title: topic.title,
      catalyst: topic.catalyst,
      updatedAt: topic.updatedAt,
      score: topic.score,
    };
  });

  const supplyChainCoverage = [...groupCounts.entries()]
    .map(([group, count], index) => ({ group, count, index }))
    .sort((a, b) => b.count - a.count || a.index - b.index)
    .map(({ group, count }) => ({ group, count }));

  const roleBreakdown = [...roleCounts.entries()]
    .map(([role, count], index) => ({ role, count, index }))
    .sort((a, b) => b.count - a.count || a.index - b.index)
    .map(({ role, count }) => ({ role, count }));

  const watchlist = momentumRanking.slice(0, 4).map((topic) => ({
    label: topic.title,
    score: topic.score,
    reason: `${topics.find((item) => item.id === topic.id).catalyst}；可追蹤 ${topic.companyCount} 個公司角色。`,
  }));

  return {
    insights: createInsights(topics, { query }),
    momentumRanking,
    catalysts,
    supplyChainCoverage,
    roleBreakdown,
    watchlist,
  };
}

function clampScore(score) {
  return Math.max(5, Math.min(99, Math.round(score)));
}

function tickerSeed(ticker) {
  return String(ticker)
    .split("")
    .reduce((sum, char, index) => sum + Number(char || 0) * (index + 3), 0);
}

function scoreCompany(company, topic) {
  const seed = tickerSeed(company.ticker);
  const theme = clampScore(topic.score + (seed % 9) - 4);
  const fundamental = clampScore(topic.score - 8 + (seed % 17));
  const technical = clampScore(topic.score - 16 + ((seed * 3) % 31));
  const chips = clampScore(topic.score - 14 + ((seed * 5) % 29));
  const news = clampScore(topic.score - 10 + ((seed * 7) % 25));
  const totalScore = Number(
    (theme * 0.28 + fundamental * 0.2 + technical * 0.2 + chips * 0.16 + news * 0.16).toFixed(1),
  );

  return {
    ticker: company.ticker,
    name: company.name,
    role: company.role,
    topicTitle: topic.title,
    category: topic.category,
    catalyst: topic.catalyst,
    analyzedAt: topic.updatedAt,
    totalScore,
    sentiment: totalScore >= 60 ? "偏多" : "偏空",
    factors: {
      題材面: theme,
      基本面: fundamental,
      技術面: technical,
      籌碼面: chips,
      新聞面: news,
    },
  };
}

function buildScorecards(topics, query) {
  const normalizedQuery = query.trim().toLowerCase();
  const cards = topics.flatMap((topic) => topic.companies.map((company) => scoreCompany(company, topic)));

  if (!normalizedQuery) return cards;

  return cards.filter((card) =>
    [card.ticker, card.name, card.role, card.topicTitle, card.category, card.catalyst]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery),
  );
}

export function createAiRankingReport(topics, { mode = "bullish", query = "" } = {}) {
  const base = {
    updatedAtLabel: "示範資料即時整理",
    modes: [
      { id: "personal", label: "我的分析" },
      { id: "bullish", label: "看多 Top 10" },
      { id: "bearish", label: "看空 Top 10" },
      { id: "short", label: "短線動能 (Beta)" },
      { id: "swing", label: "波段趨勢 (Beta)" },
      { id: "deep", label: "深度研究" },
    ],
  };

  if (mode === "personal") {
    return {
      ...base,
      title: "我的分析",
      requiresLogin: true,
      items: [],
      emptyMessage: "請先登入以查看您的分析紀錄",
    };
  }

  if (mode === "swing") {
    return {
      ...base,
      title: "波段趨勢 (Beta)",
      items: [],
      emptyMessage: "排行榜尚無資料，點擊公司頁的 AI 分析後會自動出現在這裡。",
    };
  }

  const cards = buildScorecards(topics, query);
  const titleByMode = {
    bullish: "看多 Top 10",
    bearish: "看空 Top 10",
    short: "短線動能 (Beta)",
    deep: "深度研究",
  };

  const ranked = [...cards]
    .map((card) => {
      if (mode === "bearish") {
        return { ...card, sentiment: "偏空" };
      }

      if (mode !== "short") return card;

      const shortScore = Number(
        (card.factors.技術面 * 0.38 + card.factors.籌碼面 * 0.34 + card.factors.新聞面 * 0.28).toFixed(1),
      );
      return {
        ...card,
        totalScore: shortScore,
        sentiment: shortScore >= 60 ? "偏多" : "偏空",
        strategy: "短線動能 (Beta)",
      };
    })
    .sort((a, b) => {
      if (mode === "bearish") return a.totalScore - b.totalScore || a.ticker.localeCompare(b.ticker);
      return b.totalScore - a.totalScore || a.ticker.localeCompare(b.ticker);
    })
    .slice(0, 10)
    .map((card, index) => ({
      ...card,
      rank: index + 1,
      researchNote:
        mode === "deep"
          ? `${card.name} 的主要觀察點是「${card.catalyst}」，需同步檢查 ${card.role} 的訂單能見度與估值位置。`
          : "",
    }));

  return {
    ...base,
    title: titleByMode[mode] ?? titleByMode.bullish,
    items: ranked,
    emptyMessage: ranked.length === 0 ? "目前沒有符合條件的 AI 分析結果。" : "",
  };
}

export function createMarketSnapshot(topics, snapshots) {
  const snapshotMap = new Map(snapshots.map((snapshot) => [snapshot.ticker, snapshot]));

  return buildCompanyIndex(topics)
    .filter((company) => snapshotMap.has(company.ticker))
    .map((company) => {
      const snapshot = snapshotMap.get(company.ticker);
      return {
        ticker: company.ticker,
        name: company.name,
        role: company.role,
        topicTitle: company.topicTitle,
        lastPrice: snapshot.lastPrice,
        changePct: snapshot.changePct,
        volume: snapshot.volume,
        signal: snapshot.signal,
      };
    });
}

export function createEtfDashboard(etfs, topics) {
  const companyTopics = new Map();
  for (const company of buildCompanyIndex(topics)) {
    const titles = companyTopics.get(company.ticker) ?? new Set();
    titles.add(company.topicTitle);
    companyTopics.set(company.ticker, titles);
  }

  const holdingMap = new Map();
  for (const etf of etfs) {
    for (const holding of etf.topHoldings) {
      const entry = holdingMap.get(holding.ticker) ?? {
        ticker: holding.ticker,
        name: holding.name,
        etfTickers: new Set(),
        topicTitles: companyTopics.get(holding.ticker) ?? new Set(),
      };
      entry.etfTickers.add(etf.ticker);
      holdingMap.set(holding.ticker, entry);
    }
  }

  return {
    totalAum: Number(etfs.reduce((sum, etf) => sum + etf.aum, 0).toFixed(1)),
    dailyInflow: Number(
      etfs.filter((etf) => etf.dailyFlow > 0).reduce((sum, etf) => sum + etf.dailyFlow, 0).toFixed(1),
    ),
    dailyOutflow: Number(
      etfs.filter((etf) => etf.dailyFlow < 0).reduce((sum, etf) => sum + etf.dailyFlow, 0).toFixed(1),
    ),
    weeklyFlow: Number(etfs.reduce((sum, etf) => sum + etf.weeklyFlow, 0).toFixed(1)),
    funds: [...etfs].sort((a, b) => b.aum - a.aum),
    tsmcLimit: [...etfs]
      .map((etf) => ({
        ticker: etf.ticker,
        name: etf.name,
        tsmcWeight: etf.tsmcWeight,
        roomToLimit: Number((25 - etf.tsmcWeight).toFixed(1)),
      }))
      .sort((a, b) => a.roomToLimit - b.roomToLimit),
    holdingOverlap: [...holdingMap.values()]
      .map((entry) => ({
        ticker: entry.ticker,
        name: entry.name,
        etfCount: entry.etfTickers.size,
        topicTitles: [...entry.topicTitles],
      }))
      .sort((a, b) => b.etfCount - a.etfCount || a.ticker.localeCompare(b.ticker)),
  };
}

export function createDailyFocusReport(topics, snapshots, etfs, etfMeta) {
  const marketRows = createMarketSnapshot(topics, snapshots)
    .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
    .slice(0, 6);
  const etfDashboard = createEtfDashboard(etfs, topics);
  const strongestTopic = [...topics].sort((a, b) => b.score - a.score)[0];
  const biggestFlow = [...etfs].sort((a, b) => b.dailyFlow - a.dailyFlow)[0];

  return {
    headline: "每日焦點",
    lead: `${strongestTopic.title} 維持最高題材動能，${biggestFlow.ticker} ${biggestFlow.name} 今日資金流入 ${biggestFlow.dailyFlow} 億。`,
    marketMovers: marketRows,
    etfBrief: {
      sourceLabel: etfMeta.sourceLabel,
      asOf: etfMeta.asOf,
      etfCount: etfMeta.etfCount,
      totalAum: etfMeta.totalAum,
      tsmcLimitUsage: etfMeta.tsmcLimitUsage,
      dailyInflow: etfDashboard.dailyInflow,
      dailyOutflow: etfDashboard.dailyOutflow,
      weeklyFlow: etfDashboard.weeklyFlow,
    },
    watchItems: [
      `${strongestTopic.category}：${strongestTopic.catalyst}`,
      `${biggestFlow.ticker}：追蹤日流入 ${biggestFlow.dailyFlow} 億與持股集中度`,
      `公司資料庫：優先檢查 ${marketRows[0].ticker} ${marketRows[0].name} 的量價訊號`,
    ],
    riskNotes: [
      `台積電 25% 上限使用率 ${etfMeta.tsmcLimitUsage}%，高含積 ETF 需追蹤可加碼空間。`,
      "twstock snapshot 為離線更新資料，部署前應重新產生並人工檢查。",
    ],
  };
}

export function createEtfFlowReport(events, etfs, date) {
  const etfNameMap = new Map(etfs.map((etf) => [etf.ticker, etf.name]));
  const filteredEvents = events.filter((event) => event.date === date);
  const addTotal = Number(
    filteredEvents
      .filter((event) => event.amount > 0)
      .reduce((sum, event) => sum + event.amount, 0)
      .toFixed(1),
  );
  const trimTotal = Number(
    filteredEvents
      .filter((event) => event.amount < 0)
      .reduce((sum, event) => sum + event.amount, 0)
      .toFixed(1),
  );
  const etfMap = new Map();

  for (const event of filteredEvents) {
    const entry = etfMap.get(event.etfTicker) ?? {
      etfTicker: event.etfTicker,
      etfName: etfNameMap.get(event.etfTicker) ?? event.etfTicker,
      addAmount: 0,
      trimAmount: 0,
      netAmount: 0,
    };

    if (event.amount >= 0) entry.addAmount += event.amount;
    else entry.trimAmount += event.amount;
    entry.netAmount += event.amount;
    etfMap.set(event.etfTicker, entry);
  }

  const normalize = (entry) => ({
    ...entry,
    addAmount: Number(entry.addAmount.toFixed(1)),
    trimAmount: Number(entry.trimAmount.toFixed(1)),
    netAmount: Number(entry.netAmount.toFixed(1)),
  });

  return {
    date,
    addTotal,
    trimTotal,
    events: filteredEvents.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)),
    byEtf: [...etfMap.values()].map(normalize).sort((a, b) => b.netAmount - a.netAmount),
  };
}
