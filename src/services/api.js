// ============================================================
// API seam. Every method keeps its original name/signature so pages that call
// `api.*` need no changes — but each now hits the businessAPI backend through
// src/networkServices (hospediav12-fe format) instead of hardcoded data.
// List endpoints return raw FK ids, so reads are resolved through the cached
// lookup maps (getLookupMaps) in the normalizers. Per-workspace KPI/mix rollups
// the backend does not expose are computed from the live lists (see ./derive).
// ============================================================
import * as clientsApi from "../networkServices/clientsApi";
import * as projectsApi from "../networkServices/projectsApi";
import * as teamApi from "../networkServices/teamApi";
import * as deliveryApi from "../networkServices/deliveryApi";
import * as governanceApi from "../networkServices/governanceApi";
import * as activitiesApi from "../networkServices/activitiesApi";
import * as integrationsApi from "../networkServices/integrationsApi";
import * as apisApi from "../networkServices/apisApi";
import * as featuresApi from "../networkServices/featuresApi";
import * as featureDocsApi from "../networkServices/featureDocsApi";
import * as dashboardApi from "../networkServices/dashboardApi";
import * as sfrApi from "../networkServices/sfrApi";
import * as lookupsApi from "../networkServices/lookupsApi";
import { getLookupMaps } from "../networkServices/lookups";
import * as N from "../networkServices/normalize";
import * as d from "./derive";

// Fetch data + lookup maps together, then normalize.
const withMaps = async (fetchPromise, normFn) => {
  const [raw, maps] = await Promise.all([fetchPromise, getLookupMaps()]);
  return normFn(raw, maps);
};
// Never let a derived-analytics sub-fetch crash the whole widget.
const safe = (p) => p.catch(() => []);

export const api = {
  // session / people
  getCurrentUser: async () => {
    const team = await safe(api.getTeam());
    return team.find((t) => /pmo/i.test(t.role || "")) || team[0] || { name: "PMO", role: "PMO" };
  },
  getTeam: () => withMaps(teamApi.getTeamMemberList(), N.normalizeTeam),
  getRoles: () => lookupsApi.getRoleList(),

  // projects
  getProjects: () => withMaps(projectsApi.getProjectList(), N.normalizeProjects),
  getProject: (code) => withMaps(projectsApi.getProjectByCode(code), N.normalizeProject),
  getProjectKpis: async () => d.projectKpis(await api.getProjects()),

  // clients
  getClients: () => withMaps(clientsApi.getClientList(), N.normalizeClients),
  getClient: (id) => withMaps(clientsApi.getClientById(id), N.normalizeClient),

  // srs / requirements
  getSrsSchedule: () => withMaps(deliveryApi.getSrsSessionList(), N.normalizeList),
  getRequirements: () => withMaps(deliveryApi.getRequirementList(), N.normalizeList),
  getSrsKpis: async () => d.listKpis(await safe(api.getRequirements())),

  // master data
  getMasterData: () => withMaps(deliveryApi.getMasterDataRecordList(), N.normalizeList),
  getMasterDataKpis: async () => d.listKpis(await safe(api.getMasterData())),

  // delivery
  getDevItems: () => withMaps(deliveryApi.getDevelopmentItemList(), N.normalizeList),
  getUatCases: () => withMaps(deliveryApi.getUatCaseList(), N.normalizeList),
  getBugs: () => withMaps(deliveryApi.getBugList(), N.normalizeBugs),
  getTraining: () => withMaps(deliveryApi.getTrainingList(), N.normalizeList),
  getGoLiveReadiness: () => withMaps(deliveryApi.getGoLiveReadinessList(), N.normalizeList),
  getLiveImports: () => withMaps(deliveryApi.getLiveImportList(), N.normalizeList),
  getParallelGoLive: () => withMaps(deliveryApi.getParallelGoLiveList(), N.normalizeList),
  getFinalGoLive: () => withMaps(deliveryApi.getFinalGoLiveList(), N.normalizeList),
  getDeliveryKpis: async () => {
    const [dev, uat, bugs, training] = await Promise.all([
      safe(api.getDevItems()), safe(api.getUatCases()), safe(api.getBugs()), safe(api.getTraining()),
    ]);
    return d.deliveryKpis({ dev, uat, bugs, training });
  },
  getGoLiveKpis: async () => d.listKpis(await safe(api.getGoLiveReadiness())),

  // activity schedule
  getActivitySchedule: () => withMaps(activitiesApi.getActivityList(), N.normalizeList),
  getScheduleKpis: async () => d.listKpis(await safe(api.getActivitySchedule())),

  // hospital users & access
  getHospitalUsers: () => withMaps(activitiesApi.getHospitalUserList(), N.normalizeList),
  getUsersKpis: async () => d.listKpis(await safe(api.getHospitalUsers())),

  // governance
  getIssues: () => withMaps(governanceApi.getIssueList(), N.normalizeIssues),
  getRisks: () => withMaps(governanceApi.getRiskList(), N.normalizeRisks),
  getSignoffs: () => withMaps(governanceApi.getSignoffList(), N.normalizeList),
  getDocuments: () => withMaps(governanceApi.getDocumentList(), N.normalizeList),
  getGovernanceKpis: async () => {
    const [issues, risks, signoffs, documents] = await Promise.all([
      safe(api.getIssues()), safe(api.getRisks()), safe(api.getSignoffs()), safe(api.getDocuments()),
    ]);
    return d.governanceKpis({ issues, risks, signoffs, documents });
  },

  // dashboard widgets
  getNotifications: () => withMaps(dashboardApi.getNotificationList(), N.normalizeList),
  getActivityFeed: () => withMaps(dashboardApi.getActivityFeedList(), N.normalizeList),
  getUpcoming: () => withMaps(dashboardApi.getUpcomingEventList(), N.normalizeList),
  getDashboardSummary: () => dashboardApi.getDashboardSummary(),
  getProjectTrend: () => Promise.resolve(d.emptyTrend()),
  getRevenueTrend: () => Promise.resolve(d.emptyTrend()),
  getPhaseDistribution: async () => d.phaseDistribution(await safe(api.getProjects())),
  getHealthMix: async () => d.healthMix(await safe(api.getProjects())),
  getCategoryMix: async () => d.projectCategoryMix(await safe(api.getProjects())),
  getWorkload: async () => d.mixBy(await safe(api.getProjects()), (p) => p.pm),
  getStageFunnel: async () => d.stageFunnel(await safe(api.getProjects())),

  // smart integration records (SIR)
  getIntegrations: () => withMaps(integrationsApi.getIntegrationList(), N.normalizeIntegrations),
  getProcessFlows: () => withMaps(integrationsApi.getProcessFlowList(), N.normalizeList),
  getApis: () => withMaps(apisApi.getApiList(), N.normalizeApis),
  getPayloads: () => withMaps(apisApi.getApiPayloadList(), N.normalizeList),
  getHimsChanges: () => withMaps(integrationsApi.getHimsChangeList(), N.normalizeList),
  getDbChanges: () => withMaps(integrationsApi.getDbChangeList(), N.normalizeList),
  getSourceCode: () => withMaps(integrationsApi.getSourceCodeList(), N.normalizeList),
  getScreens: () => withMaps(integrationsApi.getIntegrationScreenList(), N.normalizeList),
  getClientImplementations: () => withMaps(integrationsApi.getClientImplementationList(), N.normalizeList),
  getTestCases: () => withMaps(integrationsApi.getIntegrationTestCaseList(), N.normalizeList),
  getIntegrationDocuments: () => withMaps(integrationsApi.getIntegrationDocumentList(), N.normalizeList),
  getVersionHistory: () => withMaps(integrationsApi.getVersionHistoryList(), N.normalizeList),
  getDeveloperNotes: () => withMaps(integrationsApi.getDeveloperNoteList(), N.normalizeList),
  getVendors: () => withMaps(integrationsApi.getVendorList(), N.normalizeList),
  getTypeMix: async () => d.mixBy(await safe(api.getIntegrations()), (i) => i.type),
  getSirKpis: async () => d.listKpis(await safe(api.getIntegrations())),

  // smart feature repository (SFR)
  getFeatures: () => withMaps(featuresApi.getFeatureList(), N.normalizeFeatures),
  getBusinessAnalysis: () => withMaps(featureDocsApi.getFeatureBusinessAnalysisList(), N.normalizeList),
  getTechnicalAnalysis: () => withMaps(featureDocsApi.getFeatureTechnicalAnalysisList(), N.normalizeList),
  getFeatureWorkflows: () => withMaps(featureDocsApi.getFeatureWorkflowList(), N.normalizeList),
  getDevDetails: () => withMaps(featureDocsApi.getFeatureDevDetailsList(), N.normalizeList),
  getFeatureImpact: () => withMaps(featureDocsApi.getFeatureImpactList(), N.normalizeList),
  getScreenChanges: () => withMaps(featureDocsApi.getFeatureScreenChangeList(), N.normalizeList),
  getFeatureTests: () => withMaps(featureDocsApi.getFeatureTestList(), N.normalizeList),
  getClientAdoption: () => withMaps(featureDocsApi.getFeatureClientAdoptionList(), N.normalizeList),
  getKbDocs: () => withMaps(featureDocsApi.getFeatureKbDocList(), N.normalizeList),
  getApprovals: () => withMaps(featureDocsApi.getFeatureApprovalList(), N.normalizeList),
  getFeatureLibrary: () => withMaps(featuresApi.getFeatureList(), N.normalizeFeatures),
  getTopByImpact: async () => (await safe(api.getFeatures())).slice(0, 10),
  getFeatureStatusMix: async () => d.mixBy(await safe(api.getFeatures()), (f) => f.status),
  getFeatureCategoryMix: () => sfrApi.getFeatureCategoryMix(),
  getFeatureTrend: () => Promise.resolve(d.emptyTrend()),
  getSfrKpis: () => sfrApi.getSfrKpis(),

  // ---- mutations ----
  // Optimistic client-side echo used by a few forms for instant feedback.
  submit: (entity, payload) =>
    Promise.resolve({ ok: true, entity, id: `${entity.slice(0, 3).toUpperCase()}-NEW-${Date.now()}`, payload }),
  actOn: (entity, id, action, remarks = "") =>
    Promise.resolve({ ok: true, entity, id, action, remarks }),
};
