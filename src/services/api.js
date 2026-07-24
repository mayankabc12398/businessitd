// ============================================================
// Mock API layer — simulates async REST calls over dummy data so
// loading states, skeletons and optimistic updates behave like prod.
// ============================================================
import { PROJECTS, PROJECT_KPIS, findProject } from '../data/projects';
import { CLIENTS, findClient } from '../data/clients';
import { TEAM, CURRENT_USER, ROLES } from '../data/team';
import { SRS_SCHEDULE, REQUIREMENTS, SRS_KPIS } from '../data/srs';
import { MASTER_DATA, MASTERDATA_KPIS } from '../data/masterdata';
import { DEV_ITEMS, UAT_CASES, BUGS, TRAINING, GOLIVE_READINESS, LIVE_IMPORTS, PARALLEL_GOLIVE, FINAL_GOLIVE, DELIVERY_KPIS, GOLIVE_KPIS } from '../data/delivery';
import { ISSUES, RISKS, SIGNOFFS, DOCUMENTS, GOVERNANCE_KPIS } from '../data/governance';
import { NOTIFICATIONS, ACTIVITY_FEED, UPCOMING, PROJECT_TREND, REVENUE_TREND, PHASE_DISTRIBUTION, HEALTH_MIX, CATEGORY_MIX, WORKLOAD, STAGE_FUNNEL } from '../data/misc';

const LATENCY = 280;
const clone = (v) => JSON.parse(JSON.stringify(v));
const respond = (data, ms = LATENCY) =>
  new Promise((resolve) => setTimeout(() => resolve(clone(data)), ms + Math.random() * 160));

export const api = {
  // session / people
  getCurrentUser: () => respond(CURRENT_USER, 100),
  getTeam: () => respond(TEAM),
  getRoles: () => respond(ROLES),

  // projects
  getProjects: () => respond(PROJECTS),
  getProject: (code) => respond(findProject(code) || null),
  getProjectKpis: () => respond(PROJECT_KPIS, 120),

  // clients
  getClients: () => respond(CLIENTS),
  getClient: (id) => respond(findClient(id) || null),

  // srs / requirements
  getSrsSchedule: () => respond(SRS_SCHEDULE),
  getRequirements: () => respond(REQUIREMENTS),
  getSrsKpis: () => respond(SRS_KPIS, 120),

  // master data
  getMasterData: () => respond(MASTER_DATA),
  getMasterDataKpis: () => respond(MASTERDATA_KPIS, 120),

  // delivery
  getDevItems: () => respond(DEV_ITEMS),
  getUatCases: () => respond(UAT_CASES),
  getBugs: () => respond(BUGS),
  getTraining: () => respond(TRAINING),
  getGoLiveReadiness: () => respond(GOLIVE_READINESS),
  getLiveImports: () => respond(LIVE_IMPORTS),
  getParallelGoLive: () => respond(PARALLEL_GOLIVE),
  getFinalGoLive: () => respond(FINAL_GOLIVE),
  getDeliveryKpis: () => respond(DELIVERY_KPIS, 120),
  getGoLiveKpis: () => respond(GOLIVE_KPIS, 120),

  // governance
  getIssues: () => respond(ISSUES),
  getRisks: () => respond(RISKS),
  getSignoffs: () => respond(SIGNOFFS),
  getDocuments: () => respond(DOCUMENTS),
  getGovernanceKpis: () => respond(GOVERNANCE_KPIS, 120),

  // dashboard widgets
  getNotifications: () => respond(NOTIFICATIONS, 140),
  getActivityFeed: () => respond(ACTIVITY_FEED),
  getUpcoming: () => respond(UPCOMING),
  getProjectTrend: () => respond(PROJECT_TREND),
  getRevenueTrend: () => respond(REVENUE_TREND),
  getPhaseDistribution: () => respond(PHASE_DISTRIBUTION),
  getHealthMix: () => respond(HEALTH_MIX),
  getCategoryMix: () => respond(CATEGORY_MIX),
  getWorkload: () => respond(WORKLOAD),
  getStageFunnel: () => respond(STAGE_FUNNEL),

  // mutations (simulated echo so UIs can optimistic-update)
  submit: (entity, payload) => respond({ ok: true, entity, id: `${entity.slice(0, 3).toUpperCase()}-NEW-${Math.floor(Math.random() * 9000) + 1000}`, payload }, 460),
  actOn: (entity, id, action, remarks = '') => respond({ ok: true, entity, id, action, remarks, actedBy: CURRENT_USER.name }, 380),
};
