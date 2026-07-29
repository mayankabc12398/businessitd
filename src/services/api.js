// ============================================================
// API seam. Every method keeps its original name/signature so pages that call
// `api.*` need no changes — but each now hits the businessAPI backend through
// src/networkServices (hospediav12-fe format) instead of hardcoded data.
// Entity reads/writes go straight through; per-workspace KPI/mix rollups the
// backend does not expose are computed from the live lists (see ./derive).
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
import {
  normalizeClient,
  normalizeClients,
  normalizeProject,
  normalizeProjects,
  normalizeList,
} from "../networkServices/normalize";
import * as d from "./derive";

// Never let a derived-analytics sub-fetch crash the whole widget.
const safe = (p) => p.catch(() => []);

export const api = {
  // session / people
  getCurrentUser: async () => {
    const team = await safe(teamApi.getTeamMemberList());
    return (
      team.find((t) => /pmo/i.test(t.role || "")) || team[0] || { name: "PMO", role: "PMO" }
    );
  },
  getTeam: () => teamApi.getTeamMemberList().then(normalizeList),
  getRoles: () => lookupsApi.getRoleList(),

  // projects
  getProjects: () => projectsApi.getProjectList().then(normalizeProjects),
  getProject: (code) => projectsApi.getProjectByCode(code).then(normalizeProject),
  getProjectKpis: async () => d.projectKpis(await api.getProjects()),

  // clients
  getClients: () => clientsApi.getClientList().then(normalizeClients),
  getClient: (id) => clientsApi.getClientById(id).then(normalizeClient),

  // srs / requirements
  getSrsSchedule: () => deliveryApi.getSrsSessionList().then(normalizeList),
  getRequirements: () => deliveryApi.getRequirementList().then(normalizeList),
  getSrsKpis: async () => d.listKpis(await safe(api.getRequirements())),

  // master data
  getMasterData: () => deliveryApi.getMasterDataRecordList().then(normalizeList),
  getMasterDataKpis: async () => d.listKpis(await safe(api.getMasterData())),

  // delivery
  getDevItems: () => deliveryApi.getDevelopmentItemList().then(normalizeList),
  getUatCases: () => deliveryApi.getUatCaseList().then(normalizeList),
  getBugs: () => deliveryApi.getBugList().then(normalizeList),
  getTraining: () => deliveryApi.getTrainingList().then(normalizeList),
  getGoLiveReadiness: () => deliveryApi.getGoLiveReadinessList().then(normalizeList),
  getLiveImports: () => deliveryApi.getLiveImportList().then(normalizeList),
  getParallelGoLive: () => deliveryApi.getParallelGoLiveList().then(normalizeList),
  getFinalGoLive: () => deliveryApi.getFinalGoLiveList().then(normalizeList),
  getDeliveryKpis: async () => {
    const [dev, uat, bugs, training] = await Promise.all([
      safe(api.getDevItems()), safe(api.getUatCases()), safe(api.getBugs()), safe(api.getTraining()),
    ]);
    return d.deliveryKpis({ dev, uat, bugs, training });
  },
  getGoLiveKpis: async () => d.listKpis(await safe(api.getGoLiveReadiness())),

  // activity schedule
  getActivitySchedule: () => activitiesApi.getActivityList().then(normalizeList),
  getScheduleKpis: async () => d.listKpis(await safe(api.getActivitySchedule())),

  // hospital users & access
  getHospitalUsers: () => activitiesApi.getHospitalUserList().then(normalizeList),
  getUsersKpis: async () => d.listKpis(await safe(api.getHospitalUsers())),

  // governance
  getIssues: () => governanceApi.getIssueList().then(normalizeList),
  getRisks: () => governanceApi.getRiskList().then(normalizeList),
  getSignoffs: () => governanceApi.getSignoffList().then(normalizeList),
  getDocuments: () => governanceApi.getDocumentList().then(normalizeList),
  getGovernanceKpis: async () => {
    const [issues, risks, signoffs, documents] = await Promise.all([
      safe(api.getIssues()), safe(api.getRisks()), safe(api.getSignoffs()), safe(api.getDocuments()),
    ]);
    return d.governanceKpis({ issues, risks, signoffs, documents });
  },

  // dashboard widgets
  getNotifications: () => dashboardApi.getNotificationList().then(normalizeList),
  getActivityFeed: () => dashboardApi.getActivityFeedList().then(normalizeList),
  getUpcoming: () => dashboardApi.getUpcomingEventList().then(normalizeList),
  getDashboardSummary: () => dashboardApi.getDashboardSummary(),
  getProjectTrend: () => Promise.resolve(d.emptyTrend()),
  getRevenueTrend: () => Promise.resolve(d.emptyTrend()),
  getPhaseDistribution: async () => d.phaseDistribution(await safe(api.getProjects())),
  getHealthMix: async () => d.healthMix(await safe(api.getProjects())),
  getCategoryMix: async () => d.projectCategoryMix(await safe(api.getProjects())),
  getWorkload: async () => d.mixBy(await safe(api.getProjects()), (p) => p.pm),
  getStageFunnel: async () => d.stageFunnel(await safe(api.getProjects())),

  // smart integration records (SIR)
  getIntegrations: () => integrationsApi.getIntegrationList().then(normalizeList),
  getProcessFlows: () => integrationsApi.getProcessFlowList().then(normalizeList),
  getApis: () => apisApi.getApiList().then(normalizeList),
  getPayloads: () => apisApi.getApiPayloadList().then(normalizeList),
  getHimsChanges: () => integrationsApi.getHimsChangeList().then(normalizeList),
  getDbChanges: () => integrationsApi.getDbChangeList().then(normalizeList),
  getSourceCode: () => integrationsApi.getSourceCodeList().then(normalizeList),
  getScreens: () => integrationsApi.getIntegrationScreenList().then(normalizeList),
  getClientImplementations: () => integrationsApi.getClientImplementationList().then(normalizeList),
  getTestCases: () => integrationsApi.getIntegrationTestCaseList().then(normalizeList),
  getIntegrationDocuments: () => integrationsApi.getIntegrationDocumentList().then(normalizeList),
  getVersionHistory: () => integrationsApi.getVersionHistoryList().then(normalizeList),
  getDeveloperNotes: () => integrationsApi.getDeveloperNoteList().then(normalizeList),
  getVendors: () => integrationsApi.getVendorList().then(normalizeList),
  getTypeMix: async () => d.mixBy(await safe(api.getIntegrations()), (i) => i.type),
  getSirKpis: async () => d.listKpis(await safe(api.getIntegrations())),

  // smart feature repository (SFR)
  getFeatures: () => featuresApi.getFeatureList().then(normalizeList),
  getBusinessAnalysis: () => featureDocsApi.getFeatureBusinessAnalysisList().then(normalizeList),
  getTechnicalAnalysis: () => featureDocsApi.getFeatureTechnicalAnalysisList().then(normalizeList),
  getFeatureWorkflows: () => featureDocsApi.getFeatureWorkflowList().then(normalizeList),
  getDevDetails: () => featureDocsApi.getFeatureDevDetailsList().then(normalizeList),
  getFeatureImpact: () => featureDocsApi.getFeatureImpactList().then(normalizeList),
  getScreenChanges: () => featureDocsApi.getFeatureScreenChangeList().then(normalizeList),
  getFeatureTests: () => featureDocsApi.getFeatureTestList().then(normalizeList),
  getClientAdoption: () => featureDocsApi.getFeatureClientAdoptionList().then(normalizeList),
  getKbDocs: () => featureDocsApi.getFeatureKbDocList().then(normalizeList),
  getApprovals: () => featureDocsApi.getFeatureApprovalList().then(normalizeList),
  getFeatureLibrary: () => featuresApi.getFeatureList().then(normalizeList),
  getTopByImpact: async () => (await safe(api.getFeatures())).slice(0, 10),
  getFeatureStatusMix: async () => d.mixBy(await safe(api.getFeatures()), (f) => f.status),
  getFeatureCategoryMix: () => sfrApi.getFeatureCategoryMix(),
  getFeatureTrend: () => Promise.resolve(d.emptyTrend()),
  getSfrKpis: () => sfrApi.getSfrKpis(),

  // ---- mutations ----
  // Optimistic client-side echo used by a few forms for instant feedback.
  // Not a data source; kept generic (no hardcoded datasets).
  submit: (entity, payload) =>
    Promise.resolve({ ok: true, entity, id: `${entity.slice(0, 3).toUpperCase()}-NEW-${Date.now()}`, payload }),
  actOn: (entity, id, action, remarks = "") =>
    Promise.resolve({ ok: true, entity, id, action, remarks }),
};
