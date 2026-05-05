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
