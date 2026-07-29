// ============================================================
// Client-side analytics derived from live API lists. The businessAPI exposes
// entity lists + a few analytics endpoints (Dashboard summary, Sfr KPIs), but
// not the per-workspace KPI/mix rollups the UI shows — those were computed over
// the old hardcoded arrays. We recompute them here from the fetched lists so
// no analytics stay hardcoded. Time-series trends need historical snapshots the
// API does not provide, so they return [] (charts degrade to empty).
// ============================================================
const count = (arr, pred) => arr.filter(pred).length;
const sum = (arr, sel) => arr.reduce((s, x) => s + (Number(sel(x)) || 0), 0);

// group a list into [{ label, value }] by a key selector
export const mixBy = (arr, sel) => {
  const m = new Map();
  for (const x of arr) {
    const k = sel(x) ?? "—";
    m.set(k, (m.get(k) || 0) + 1);
  }
  return [...m.entries()].map(([label, value]) => ({ label, value }));
};

export const projectKpis = (projects) => ({
  total: projects.length,
  inProgress: count(projects, (p) => ["In Progress", "UAT", "Training"].includes(p.status)),
  uat: count(projects, (p) => p.status === "UAT"),
  readyGoLive: count(projects, (p) => p.currentStage === "parallel" || p.currentStage === "golive"),
  completed: count(projects, (p) => p.status === "Completed"),
  onHold: count(projects, (p) => p.status === "On Hold"),
  atRisk: count(projects, (p) => p.health === "At Risk" || p.health === "Delayed"),
  contractValue: sum(projects, (p) => p.contractValue),
  openIssues: sum(projects, (p) => p.openIssues),
  pendingSignoffs: sum(projects, (p) => p.pendingSignoffs),
});

export const healthMix = (projects) => mixBy(projects, (p) => p.health);
export const projectCategoryMix = (projects) => mixBy(projects, (p) => p.category);
export const phaseDistribution = (projects) => mixBy(projects, (p) => p.status);
export const stageFunnel = (projects) => mixBy(projects, (p) => p.currentStage);

export const deliveryKpis = ({ dev = [], uat = [], bugs = [], training = [] }) => ({
  devItems: dev.length,
  uatCases: uat.length,
  uatPassed: count(uat, (u) => (u.status || "").toLowerCase() === "passed"),
  openBugs: count(bugs, (b) => (b.status || "").toLowerCase() !== "closed"),
  criticalBugs: count(bugs, (b) => (b.severity || "").toLowerCase() === "critical"),
  trainings: training.length,
});

export const governanceKpis = ({ issues = [], risks = [], signoffs = [], documents = [] }) => ({
  openIssues: count(issues, (i) => (i.status || "").toLowerCase() !== "closed"),
  totalIssues: issues.length,
  openRisks: count(risks, (r) => (r.status || "").toLowerCase() !== "closed"),
  totalRisks: risks.length,
  pendingSignoffs: count(signoffs, (s) => (s.status || "").toLowerCase() !== "signed"),
  documents: documents.length,
});

export const listKpis = (arr, extra = {}) => ({ total: arr.length, ...extra });

// Time-series trends: no historical data from the API -> empty series.
export const emptyTrend = () => [];
