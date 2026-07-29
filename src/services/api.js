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
import * as W from "../networkServices/writeDto";
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
  getProjectModules: (code) => projectsApi.getProjectModules(code),
  getProjectInterfaces: (code) => projectsApi.getProjectInterfaces(code),
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

  // ============================================================
  // WRITES — persist to the backend. Payloads use lookup NAMES (not ids):
  // e.g. { healthStatus:"On Track", clientId:"CL-001", priority:"High",
  // currencyCode:"INR", modules:["M-OPD"] } — resolved server-side.
  // Each returns the created/updated row; callers reload the list after.
  // ============================================================
  // projects
  createProject: (payload) => projectsApi.insertProject(payload),
  updateProject: (code, payload) => projectsApi.updateProject(code, payload),
  setOnboardingStep: (code, step) => projectsApi.setOnboardingStep(code, step),
  deleteProject: (code) => projectsApi.deleteProject(code),
  saveProjectModules: (code, moduleIds) => projectsApi.saveProjectModules(code, moduleIds),
  saveProjectInterfaces: (code, names) => projectsApi.saveProjectInterfaces(code, names),
  // clients
  createClient: (payload) => clientsApi.insertClient(payload),
  updateClient: (id, payload) => clientsApi.updateClient(id, payload),
  deleteClient: (id) => clientsApi.deleteClient(id),
  // team
  createTeamMember: async (v) => teamApi.insertTeamMember(await W.teamMemberDto(v)),
  updateTeamMember: async (id, v) => teamApi.updateTeamMember(id, await W.teamMemberDto(v)),
  deleteTeamMember: (id) => teamApi.deleteTeamMember(id),
  // delivery — form values (names/codes) resolved to entity DTOs via writeDto
  createSrsSession: async (v) => deliveryApi.insertSrsSession(await W.srsSessionDto(v)),
  createRequirement: async (v) => deliveryApi.insertRequirement(await W.requirementDto(v)),
  createMasterData: async (v) => deliveryApi.insertMasterDataRecord(await W.masterDataDto(v)),
  createDevItem: async (v) => deliveryApi.insertDevelopmentItem(await W.devItemDto(v)),
  createUatCase: async (v) => deliveryApi.insertUatCase(await W.uatCaseDto(v)),
  createBug: async (v) => deliveryApi.insertBug(await W.bugDto(v)),
  createTraining: async (v) => deliveryApi.insertTraining(await W.trainingDto(v)),
  updateSrsSession: async (id, v) => deliveryApi.updateSrsSession(id, await W.srsSessionDto(v)),
  updateRequirement: async (id, v) => deliveryApi.updateRequirement(id, await W.requirementDto(v)),
  updateMasterData: async (id, v) => deliveryApi.updateMasterDataRecord(id, await W.masterDataDto(v)),
  updateDevItem: async (id, v) => deliveryApi.updateDevelopmentItem(id, await W.devItemDto(v)),
  updateUatCase: async (id, v) => deliveryApi.updateUatCase(id, await W.uatCaseDto(v)),
  updateBug: async (id, v) => deliveryApi.updateBug(id, await W.bugDto(v)),
  updateTraining: async (id, v) => deliveryApi.updateTraining(id, await W.trainingDto(v)),
  // governance
  createIssue: async (v) => governanceApi.insertIssue(await W.issueDto(v)),
  createRisk: async (v) => governanceApi.insertRisk(await W.riskDto(v)),
  createSignoff: async (v) => governanceApi.insertSignoff(await W.signoffDto(v)),
  createDocument: async (v) => governanceApi.insertDocument(await W.documentDto(v)),
  updateIssue: async (id, v) => governanceApi.updateIssue(id, await W.issueDto(v)),
  updateRisk: async (id, v) => governanceApi.updateRisk(id, await W.riskDto(v)),
  updateSignoff: async (id, v) => governanceApi.updateSignoff(id, await W.signoffDto(v)),
  updateDocument: async (id, v) => governanceApi.updateDocument(id, await W.documentDto(v)),
  // activities & hospital users
  createActivity: async (v) => {
    const dto = await W.activityDto(v);
    if (!dto.code) dto.code = await activitiesApi.nextActivityCode();
    return activitiesApi.insertActivity(dto);
  },
  updateActivity: async (id, v) => activitiesApi.updateActivity(id, await W.activityDto(v)),
  deleteActivity: (id) => activitiesApi.deleteActivity(id),
  createHospitalUser: async (v) => activitiesApi.insertHospitalUser(await W.hospitalUserDto(v)),
  updateHospitalUser: async (id, v) => activitiesApi.updateHospitalUser(id, await W.hospitalUserDto(v)),
  // integrations & apis
  createIntegration: (p) => integrationsApi.insertIntegration(p),
  updateIntegration: (id, p) => integrationsApi.updateIntegration(id, p),
  deleteIntegration: (id) => integrationsApi.deleteIntegration(id),
  createApi: (p) => apisApi.insertApi(p),
  updateApi: (id, p) => apisApi.updateApi(id, p),
  deleteApi: (id) => apisApi.deleteApi(id),
  saveApiPayload: (id, p) => apisApi.saveApiPayload(id, p),
  // features (SFR) + lifecycle
  createFeature: (p) => featuresApi.insertFeature(p),
  updateFeature: (id, p) => featuresApi.updateFeature(id, p),
  deleteFeature: (id) => featuresApi.deleteFeature(id),
  advanceFeature: (id) => featuresApi.advanceFeature(id),
  setFeatureStatus: (id, status) => featuresApi.setFeatureStatus(id, status),
  saveFeatureSegments: (id, segments) => featuresApi.saveFeatureSegments(id, segments),
  saveBusinessAnalysis: (id, p) => featureDocsApi.saveBusinessAnalysis(id, p),
  saveTechnicalAnalysis: (id, p) => featureDocsApi.saveTechnicalAnalysis(id, p),
  saveWorkflow: (id, p) => featureDocsApi.saveWorkflow(id, p),
  saveDevDetails: (id, p) => featureDocsApi.saveDevDetails(id, p),
  saveImpact: (id, p) => featureDocsApi.saveImpact(id, p),

  // ---- legacy optimistic echo (kept for any caller not yet migrated) ----
  submit: (entity, payload) =>
    Promise.resolve({ ok: true, entity, id: `${entity.slice(0, 3).toUpperCase()}-NEW-${Date.now()}`, payload }),
  actOn: (entity, id, action, remarks = "") =>
    Promise.resolve({ ok: true, entity, id, action, remarks }),
};
