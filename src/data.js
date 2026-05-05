export const categories = [
  "全部",
  "半導體鏈",
  "硬體基建",
  "元件材料",
  "能源車用",
  "智慧應用",
  "企業IT",
];

export const topics = [
  {
    id: "custom-asic",
    title: "IC 設計｜IP 授權與客製 ASIC",
    category: "半導體鏈",
    score: 94,
    updatedAt: "2026-05-02",
    summary:
      "聚焦 AI 加速器、雲端服務商自研晶片與先進製程設計服務，是 AI 算力供應鏈最上游的高壁壘環節。",
    catalyst: "CSP 自研 ASIC 與先進封裝需求擴大",
    companies: [
      { ticker: "3035", name: "智原", role: "ASIC 設計服務", market: "TW" },
      { ticker: "3443", name: "創意", role: "先進製程 ASIC", market: "TW" },
      { ticker: "3529", name: "力旺", role: "矽智財授權", market: "TW" },
      { ticker: "3661", name: "世芯-KY", role: "高階 ASIC 設計", market: "TW" },
    ],
    relationships: [
      { group: "上游 IP", label: "CPU / SerDes IP" },
      { group: "設計服務", label: "ASIC Turnkey" },
      { group: "製造協作", label: "先進製程 Tape-out" },
      { group: "應用端", label: "雲端 AI 加速器" },
    ],
  },
  {
    id: "advanced-packaging",
    title: "先進封裝｜CoWoS 與載板",
    category: "半導體鏈",
    score: 91,
    updatedAt: "2026-04-30",
    summary:
      "AI GPU 與 HBM 需要高密度封裝、ABF 載板與測試產能，供應鏈瓶頸讓相關廠商具備較高議價能力。",
    catalyst: "AI 伺服器 GPU 供給持續受封裝產能影響",
    companies: [
      { ticker: "3711", name: "日月光投控", role: "封測服務", market: "TW" },
      { ticker: "3189", name: "景碩", role: "ABF 載板", market: "TW" },
      { ticker: "3037", name: "欣興", role: "高階載板", market: "TW" },
      { ticker: "2449", name: "京元電子", role: "IC 測試", market: "TW" },
    ],
    relationships: [
      { group: "基板", label: "ABF 載板" },
      { group: "封裝", label: "2.5D / CoWoS" },
      { group: "測試", label: "AI 晶片測試" },
      { group: "應用端", label: "AI GPU 模組" },
    ],
  },
  {
    id: "thermal-liquid",
    title: "AI 散熱｜液冷與機櫃熱管理",
    category: "硬體基建",
    score: 89,
    updatedAt: "2026-05-01",
    summary:
      "高功耗 AI 伺服器推升液冷、均熱板、熱管與整櫃散熱方案需求，散熱規格升級帶動單機價值量提高。",
    catalyst: "GB200 / AI Rack 功耗密度提高",
    companies: [
      { ticker: "3324", name: "雙鴻", role: "散熱模組", market: "TW" },
      { ticker: "3017", name: "奇鋐", role: "液冷系統", market: "TW" },
      { ticker: "3653", name: "健策", role: "均熱與扣件", market: "TW" },
      { ticker: "6230", name: "尼得科超眾", role: "熱管與風扇", market: "TW" },
    ],
    relationships: [
      { group: "材料", label: "導熱材料" },
      { group: "零組件", label: "熱管 / 均熱板" },
      { group: "系統", label: "液冷 CDU" },
      { group: "應用端", label: "AI Server Rack" },
    ],
  },
  {
    id: "optical-networking",
    title: "光通訊｜CPO 與高速網通",
    category: "硬體基建",
    score: 86,
    updatedAt: "2026-04-26",
    summary:
      "AI 資料中心東西向流量快速成長，高速交換器、光收發模組與共同封裝光學成為網路升級主軸。",
    catalyst: "800G / 1.6T 交換器滲透率提升",
    companies: [
      { ticker: "3081", name: "聯亞", role: "光通訊磊晶", market: "TW" },
      { ticker: "4908", name: "前鼎", role: "光收發模組", market: "TW" },
      { ticker: "2345", name: "智邦", role: "資料中心交換器", market: "TW" },
      { ticker: "6285", name: "啟碁", role: "網通系統", market: "TW" },
    ],
    relationships: [
      { group: "上游", label: "光磊晶 / 雷射" },
      { group: "模組", label: "800G 光收發" },
      { group: "設備", label: "AI Switch" },
      { group: "應用端", label: "資料中心網路" },
    ],
  },
  {
    id: "power-components",
    title: "電源元件｜伺服器供電升級",
    category: "元件材料",
    score: 82,
    updatedAt: "2026-04-24",
    summary:
      "AI 機櫃耗電量提升，推動電源供應器、功率元件、連接器與線束規格升級。",
    catalyst: "高壓直流與高瓦數 PSU 採用率提升",
    companies: [
      { ticker: "2308", name: "台達電", role: "電源與散熱系統", market: "TW" },
      { ticker: "6412", name: "群電", role: "高瓦數電源", market: "TW" },
      { ticker: "3533", name: "嘉澤", role: "高速連接器", market: "TW" },
      { ticker: "3322", name: "建舜電", role: "連接線材", market: "TW" },
    ],
    relationships: [
      { group: "功率", label: "Power IC / MOSFET" },
      { group: "供電", label: "Server PSU" },
      { group: "互連", label: "高速連接器" },
      { group: "應用端", label: "AI 機櫃供電" },
    ],
  },
  {
    id: "edge-ai",
    title: "邊緣 AI｜工業與車載應用",
    category: "智慧應用",
    score: 78,
    updatedAt: "2026-04-22",
    summary:
      "AI 模型往終端部署，工業電腦、車載系統與智慧影像設備受惠於低延遲推論需求。",
    catalyst: "小型化模型與工業自動化需求同步成長",
    companies: [
      { ticker: "2395", name: "研華", role: "工業電腦", market: "TW" },
      { ticker: "6414", name: "樺漢", role: "嵌入式系統", market: "TW" },
      { ticker: "2359", name: "所羅門", role: "機器視覺", market: "TW" },
      { ticker: "3706", name: "神達", role: "車載與伺服器", market: "TW" },
    ],
    relationships: [
      { group: "硬體", label: "Edge Box PC" },
      { group: "感測", label: "機器視覺" },
      { group: "整合", label: "工業 AI 平台" },
      { group: "應用端", label: "智慧製造 / 車載" },
    ],
  },
  {
    id: "enterprise-ai",
    title: "企業 AI｜資料平台與資安",
    category: "企業IT",
    score: 75,
    updatedAt: "2026-04-20",
    summary:
      "企業導入 AI 需要資料治理、雲端服務、資安控管與維運整合，軟體服務商切入內部流程升級。",
    catalyst: "企業導入私有化 AI 助理與資料治理方案",
    companies: [
      { ticker: "3029", name: "零壹", role: "雲端與資安代理", market: "TW" },
      { ticker: "8099", name: "大世科", role: "系統整合", market: "TW" },
      { ticker: "2468", name: "華經", role: "企業 IT 服務", market: "TW" },
      { ticker: "6214", name: "精誠", role: "資訊服務", market: "TW" },
    ],
    relationships: [
      { group: "資料", label: "Data Governance" },
      { group: "平台", label: "Private AI Platform" },
      { group: "資安", label: "Zero Trust" },
      { group: "應用端", label: "企業流程自動化" },
    ],
  },
  {
    id: "ev-energy",
    title: "能源車用｜電池與充電系統",
    category: "能源車用",
    score: 72,
    updatedAt: "2026-04-18",
    summary:
      "能源管理與車用電子供應鏈延伸到儲能、充電樁與電池材料，和 AI 資料中心用電議題形成交集。",
    catalyst: "儲能與快充基礎建設需求提高",
    companies: [
      { ticker: "2308", name: "台達電", role: "充電與能源管理", market: "TW" },
      { ticker: "1519", name: "華城", role: "重電設備", market: "TW" },
      { ticker: "1609", name: "大亞", role: "電纜與儲能", market: "TW" },
      { ticker: "4721", name: "美琪瑪", role: "電池材料", market: "TW" },
    ],
    relationships: [
      { group: "材料", label: "電池材料" },
      { group: "設備", label: "重電 / 電纜" },
      { group: "系統", label: "儲能與充電" },
      { group: "應用端", label: "電網與車用" },
    ],
  },
];
