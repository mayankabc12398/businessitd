// ============================================================
// New Feature Management & Revenue Generation workspace — seeded data.
// Product backlog + roadmap, subscription plans / add-on modules,
// revenue streams and monthly revenue trend.
// ============================================================

// Feature backlog — ideas → shipped, with revenue impact & effort
export const FEATURES = [
  { id: 'FT-101', title: 'Patient Self-Service App 2.0', module: 'Patient App / Portal', status: 'In Dev', priority: 'Critical', effort: 21, revenueImpact: 4200000, requestedBy: 'Apollo Group', targetQtr: 'Q3 2026', votes: 48 },
  { id: 'FT-102', title: 'AI Discharge Summary', module: 'EMR / Clinicals', status: 'Beta', priority: 'High', effort: 13, revenueImpact: 3100000, requestedBy: 'Fortis', targetQtr: 'Q3 2026', votes: 41 },
  { id: 'FT-103', title: 'WhatsApp Appointment Booking', module: 'Patient App / Portal', status: 'Shipped', priority: 'High', effort: 8, revenueImpact: 1800000, requestedBy: 'Multiple', targetQtr: 'Q2 2026', votes: 62 },
  { id: 'FT-104', title: 'NABH Compliance Dashboard', module: 'EMR / Clinicals', status: 'Planned', priority: 'High', effort: 13, revenueImpact: 2600000, requestedBy: 'Manipal', targetQtr: 'Q4 2026', votes: 29 },
  { id: 'FT-105', title: 'Dynamic Package Billing', module: 'Billing & Revenue', status: 'In Dev', priority: 'Critical', effort: 18, revenueImpact: 3800000, requestedBy: 'Max Healthcare', targetQtr: 'Q3 2026', votes: 37 },
  { id: 'FT-106', title: 'Bed Management Live Board', module: 'IPD Management', status: 'Shipped', priority: 'Medium', effort: 8, revenueImpact: 1200000, requestedBy: 'Narayana', targetQtr: 'Q2 2026', votes: 33 },
  { id: 'FT-107', title: 'e-Rakt Kosh Blood Bank Sync', module: 'Blood Bank', status: 'Planned', priority: 'Medium', effort: 8, revenueImpact: 900000, requestedBy: 'Govt Tender', targetQtr: 'Q4 2026', votes: 15 },
  { id: 'FT-108', title: 'Smart OT Scheduling', module: 'Operation Theatre', status: 'Idea', priority: 'Medium', effort: 21, revenueImpact: 2200000, requestedBy: 'Fortis', targetQtr: 'Q1 2027', votes: 22 },
  { id: 'FT-109', title: 'Pharmacy Auto-Reorder (ML)', module: 'Pharmacy', status: 'In Dev', priority: 'High', effort: 13, revenueImpact: 2900000, requestedBy: 'MedPlus', targetQtr: 'Q3 2026', votes: 44 },
  { id: 'FT-110', title: 'Insurance Claim Auto-Fill', module: 'Insurance / TPA', status: 'Beta', priority: 'Critical', effort: 13, revenueImpact: 3400000, requestedBy: 'Star Health', targetQtr: 'Q3 2026', votes: 39 },
  { id: 'FT-111', title: 'Voice-to-Text OPD Notes', module: 'EMR / Clinicals', status: 'Idea', priority: 'Low', effort: 21, revenueImpact: 1500000, requestedBy: 'Beta wishlist', targetQtr: 'Q1 2027', votes: 51 },
  { id: 'FT-112', title: 'Multi-Currency Billing (GCC)', module: 'Billing & Revenue', status: 'Planned', priority: 'High', effort: 13, revenueImpact: 5200000, requestedBy: 'NMC Dubai', targetQtr: 'Q4 2026', votes: 18 },
  { id: 'FT-113', title: 'Queue Kiosk & Token TV', module: 'Queue Management', status: 'Shipped', priority: 'Medium', effort: 5, revenueImpact: 1100000, requestedBy: 'Multiple', targetQtr: 'Q2 2026', votes: 27 },
  { id: 'FT-114', title: 'FHIR Data Export API', module: 'EMR / Clinicals', status: 'In Dev', priority: 'Medium', effort: 8, revenueImpact: 1600000, requestedBy: 'HIE Grid', targetQtr: 'Q3 2026', votes: 20 },
  { id: 'FT-115', title: 'Diet & Nutrition Planner', module: 'Dietary', status: 'Idea', priority: 'Low', effort: 8, revenueImpact: 600000, requestedBy: 'Wishlist', targetQtr: 'Q1 2027', votes: 9 },
  { id: 'FT-116', title: 'Radiology AI Triage', module: 'Radiology (RIS/PACS)', status: 'Planned', priority: 'High', effort: 21, revenueImpact: 4600000, requestedBy: 'GE Partner', targetQtr: 'Q4 2026', votes: 34 },
];

// Roadmap columns (kanban-style) — status buckets
export const FEATURE_STATUSES = ['Idea', 'Planned', 'In Dev', 'Beta', 'Shipped'];
export const FEATURE_STATUS_TINT = { Idea: 'lavender', Planned: 'sky', 'In Dev': 'peach', Beta: 'lemon', Shipped: 'green' };

// Subscription plans & add-on modules that drive recurring revenue
export const PLANS = [
  { id: 'PL-01', name: 'Clinic Starter', tier: 'Starter', priceMonthly: 18000, priceAnnual: 194400, modules: 'OPD, Pharmacy, Billing', activeClients: 34, mrr: 612000, status: 'Active' },
  { id: 'PL-02', name: 'Hospital Standard', tier: 'Standard', priceMonthly: 65000, priceAnnual: 702000, modules: 'OPD, IPD, EMR, Pharmacy, Lab, Billing', activeClients: 21, mrr: 1365000, status: 'Active' },
  { id: 'PL-03', name: 'Enterprise Suite', tier: 'Enterprise', priceMonthly: 185000, priceAnnual: 1998000, modules: 'All modules + priority support', activeClients: 9, mrr: 1665000, status: 'Active' },
  { id: 'PL-04', name: 'Add-on · Radiology PACS', tier: 'Add-on', priceMonthly: 28000, priceAnnual: 302400, modules: 'RIS / PACS', activeClients: 16, mrr: 448000, status: 'Active' },
  { id: 'PL-05', name: 'Add-on · Insurance/TPA', tier: 'Add-on', priceMonthly: 22000, priceAnnual: 237600, modules: 'Insurance / TPA', activeClients: 19, mrr: 418000, status: 'Active' },
  { id: 'PL-06', name: 'Add-on · Patient App', tier: 'Add-on', priceMonthly: 15000, priceAnnual: 162000, modules: 'Patient App / Portal', activeClients: 27, mrr: 405000, status: 'Active' },
  { id: 'PL-07', name: 'GCC Enterprise (Multi-Currency)', tier: 'Enterprise', priceMonthly: 240000, priceAnnual: 2592000, modules: 'All + GCC compliance', activeClients: 3, mrr: 720000, status: 'Beta' },
  { id: 'PL-08', name: 'Govt / Trust Edition', tier: 'Standard', priceMonthly: 48000, priceAnnual: 518400, modules: 'Core + ABDM + e-Rakt Kosh', activeClients: 6, mrr: 288000, status: 'Active' },
];

// Revenue streams — where recurring & one-time revenue comes from
export const REVENUE_STREAMS = [
  { id: 'RS-01', source: 'Subscription — Enterprise', category: 'Recurring', clients: 12, mrr: 2385000, arr: 28620000, growth: 14.2, status: 'Growing' },
  { id: 'RS-02', source: 'Subscription — Standard', category: 'Recurring', clients: 27, mrr: 1653000, arr: 19836000, growth: 9.8, status: 'Growing' },
  { id: 'RS-03', source: 'Subscription — Starter', category: 'Recurring', clients: 34, mrr: 612000, arr: 7344000, growth: 6.1, status: 'Stable' },
  { id: 'RS-04', source: 'Add-on Modules', category: 'Recurring', clients: 41, mrr: 1271000, arr: 15252000, growth: 21.5, status: 'Growing' },
  { id: 'RS-05', source: 'Implementation & Setup', category: 'One-time', clients: 8, mrr: 0, arr: 9600000, growth: -4.0, status: 'Declining' },
  { id: 'RS-06', source: 'Training & Onboarding', category: 'One-time', clients: 11, mrr: 0, arr: 3300000, growth: 2.5, status: 'Stable' },
  { id: 'RS-07', source: 'AMC & Support', category: 'Recurring', clients: 58, mrr: 870000, arr: 10440000, growth: 7.3, status: 'Stable' },
  { id: 'RS-08', source: 'Data Migration Services', category: 'One-time', clients: 5, mrr: 0, arr: 2100000, growth: 11.0, status: 'Growing' },
  { id: 'RS-09', source: 'API / Integration Licensing', category: 'Recurring', clients: 14, mrr: 420000, arr: 5040000, growth: 33.0, status: 'Growing' },
];

// Monthly MRR trend (₹ lakh) — new vs churn
export const REVENUE_TREND = [
  { label: 'Jan', mrr: 58, newMrr: 6.2, churn: 1.8 },
  { label: 'Feb', mrr: 61, newMrr: 5.1, churn: 2.1 },
  { label: 'Mar', mrr: 64, newMrr: 6.8, churn: 3.8 },
  { label: 'Apr', mrr: 68, newMrr: 7.4, churn: 3.4 },
  { label: 'May', mrr: 71, newMrr: 6.0, churn: 3.0 },
  { label: 'Jun', mrr: 75, newMrr: 7.9, churn: 3.9 },
  { label: 'Jul', mrr: 79, newMrr: 8.3, churn: 4.3 },
];

// Revenue by product module (₹ lakh ARR) — for HBar list
export const REVENUE_BY_MODULE = [
  { label: 'EMR / Clinicals', value: 182 },
  { label: 'Billing & Revenue', value: 164 },
  { label: 'Pharmacy', value: 121 },
  { label: 'Laboratory (LIS)', value: 98 },
  { label: 'Patient App', value: 87 },
  { label: 'Radiology PACS', value: 74 },
  { label: 'Insurance / TPA', value: 69 },
];

export const REVENUE_KPIS = {
  mrr: 7911000,
  arr: 94932000,
  activeClients: 73,
  churnRate: 5.4,
  featuresShipped: 4,
  featuresInDev: 5,
  pipelineValue: 33800000,
  netRevenueRetention: 112,
};
