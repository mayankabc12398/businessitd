// ============================================================
// Lookup resolution. List endpoints return raw FK ids (healthStatusId,
// moduleId, severityId, …) — only some aggregate (GetById) endpoints embed the
// joined { id, name } object. To show names everywhere, we fetch every lookup
// list once, cache id->value maps, and resolve FK ids in the normalizers.
// ============================================================
import makeApiRequest, { toList } from "./axiosInstance";
import { apiUrls } from "./apiEndpoints";

const fetchList = (key) =>
  makeApiRequest(apiUrls[key], { method: "get" }).then(toList).catch(() => []);

// Build a Map(id -> pick(row)) from a lookup list.
const toMap = (rows, pick) => {
  const m = new Map();
  for (const r of rows) if (r && r.id != null) m.set(r.id, pick(r));
  return m;
};

// Build a Map(pick(row) -> id) — reverse of toMap, for write DTOs (name/code -> id).
const toRevMap = (rows, pick) => {
  const m = new Map();
  for (const r of rows) if (r && r.id != null) m.set(pick(r), r.id);
  return m;
};

let cache = null;
let writeCache = null;

// Fetch all lookups once; subsequent calls reuse the resolved maps.
export const getLookupMaps = () => {
  if (cache) return cache;
  cache = (async () => {
    const [
      severity, health, hospitalType, country, currency, projectStatus,
      projectCategory, implementationType, lifecycleStage, himsModule,
      featureModule, featureCategory, featureStatus, issueType, riskType,
      bugCategory, integrationCategory, integrationStatus, httpMethod, authType,
      teamDepartment, team,
    ] = await Promise.all([
      fetchList("GetSeverityLevelList"),
      fetchList("GetHealthStatusList"),
      fetchList("GetHospitalTypeList"),
      fetchList("GetCountryList"),
      fetchList("GetCurrencyList"),
      fetchList("GetProjectStatusList"),
      fetchList("GetProjectCategoryList"),
      fetchList("GetImplementationTypeList"),
      fetchList("GetLifecycleStageList"),
      fetchList("GetHimsModuleList"),
      fetchList("GetFeatureModuleList"),
      fetchList("GetFeatureCategoryList"),
      fetchList("GetFeatureStatusList"),
      fetchList("GetIssueTypeList"),
      fetchList("GetRiskTypeList"),
      fetchList("GetBugCategoryList"),
      fetchList("GetIntegrationCategoryList"),
      fetchList("GetIntegrationStatusList"),
      fetchList("GetHttpMethodList"),
      fetchList("GetAuthTypeList"),
      fetchList("GetTeamDepartmentList"),
      makeApiRequest(apiUrls.GetTeamMemberList, { method: "get" }).then(toList).catch(() => []),
    ]);
    // Entity id->code maps: child rows link to parents by numeric id, but the UI
    // keys parents by their natural code. Resolve ref ids to codes (see normalize).
    const [clients, projects, features, integrations, apisList] = await Promise.all([
      fetchList("GetClientList"),
      fetchList("GetProjectList"),
      fetchList("GetFeatureList"),
      fetchList("GetIntegrationList"),
      fetchList("GetApiList"),
    ]);
    const name = (r) => r.name;
    const code = (r) => r.code;
    return {
      // severity_levels backs severity / priority / riskLevel
      severity: toMap(severity, name),
      health: toMap(health, name),
      hospitalType: toMap(hospitalType, name),
      country: toMap(country, name),
      currency: toMap(currency, (r) => r.code || r.name),
      projectStatus: toMap(projectStatus, name),
      projectCategory: toMap(projectCategory, name),
      implementationType: toMap(implementationType, name),
      lifecycleStage: toMap(lifecycleStage, (r) => r.stageKey || r.name), // UI keys off stageKey
      himsModule: toMap(himsModule, name),
      featureModule: toMap(featureModule, name),
      featureCategory: toMap(featureCategory, name),
      featureStatus: toMap(featureStatus, name),
      issueType: toMap(issueType, name),
      riskType: toMap(riskType, name),
      bugCategory: toMap(bugCategory, name),
      integrationCategory: toMap(integrationCategory, name),
      integrationStatus: toMap(integrationStatus, name),
      httpMethod: toMap(httpMethod, name),
      authType: toMap(authType, name),
      teamDepartment: toMap(teamDepartment, name),
      team: toMap(team, (r) => r.code || r.name), // project pm/fc/... FK -> member code (U-01)
      // id -> code (for resolving child rows' parent ref ids)
      clientCode: toMap(clients, code),
      projectCode: toMap(projects, code),
      featureCode: toMap(features, code),
      integrationCode: toMap(integrations, code),
      apiCode: toMap(apisList, code),
    };
  })();
  return cache;
};

// Reverse maps for WRITES: convert the display value a form collects (a lookup
// NAME, a parent CODE, or a lifecycle stageKey) back to the numeric FK id the
// generic entity inserts require. Cached once.
export const getWriteMaps = () => {
  if (writeCache) return writeCache;
  writeCache = (async () => {
    const [
      severity, health, hospitalType, country, currency, projectStatus,
      projectCategory, implementationType, lifecycleStage, himsModule,
      featureModule, featureCategory, featureStatus, issueType, riskType,
      bugCategory, integrationCategory, integrationStatus, httpMethod, authType,
      teamDepartment, team, clients, projects, features, integrations, apisList,
      hospitalDepartment, signoffMilestone, masterDataItem, docCategory, trainingType, role,
    ] = await Promise.all([
      fetchList("GetSeverityLevelList"), fetchList("GetHealthStatusList"),
      fetchList("GetHospitalTypeList"), fetchList("GetCountryList"),
      fetchList("GetCurrencyList"), fetchList("GetProjectStatusList"),
      fetchList("GetProjectCategoryList"), fetchList("GetImplementationTypeList"),
      fetchList("GetLifecycleStageList"), fetchList("GetHimsModuleList"),
      fetchList("GetFeatureModuleList"), fetchList("GetFeatureCategoryList"),
      fetchList("GetFeatureStatusList"), fetchList("GetIssueTypeList"),
      fetchList("GetRiskTypeList"), fetchList("GetBugCategoryList"),
      fetchList("GetIntegrationCategoryList"), fetchList("GetIntegrationStatusList"),
      fetchList("GetHttpMethodList"), fetchList("GetAuthTypeList"),
      fetchList("GetTeamDepartmentList"),
      makeApiRequest(apiUrls.GetTeamMemberList, { method: "get" }).then(toList).catch(() => []),
      fetchList("GetClientList"), fetchList("GetProjectList"),
      fetchList("GetFeatureList"), fetchList("GetIntegrationList"), fetchList("GetApiList"),
      fetchList("GetHospitalDepartmentList"), fetchList("GetSignoffMilestoneList"),
      fetchList("GetMasterDataItemList"), fetchList("GetDocCategoryList"),
      fetchList("GetTrainingTypeList"), fetchList("GetRoleList"),
    ]);
    const byName = (r) => r.name;
    return {
      severity: toRevMap(severity, byName),      // also used for priority / riskLevel
      health: toRevMap(health, byName),
      hospitalType: toRevMap(hospitalType, byName),
      country: toRevMap(country, (r) => r.code || r.name),
      currency: toRevMap(currency, (r) => r.code || r.name),
      projectStatus: toRevMap(projectStatus, byName),
      projectCategory: toRevMap(projectCategory, byName),
      implementationType: toRevMap(implementationType, byName),
      lifecycleStage: toRevMap(lifecycleStage, (r) => r.stageKey || r.name),
      himsModule: toRevMap(himsModule, byName),
      himsModuleByCode: toRevMap(himsModule, (r) => r.code),
      featureModule: toRevMap(featureModule, byName),
      featureCategory: toRevMap(featureCategory, byName),
      featureStatus: toRevMap(featureStatus, byName),
      issueType: toRevMap(issueType, byName),
      riskType: toRevMap(riskType, byName),
      bugCategory: toRevMap(bugCategory, byName),
      integrationCategory: toRevMap(integrationCategory, byName),
      integrationStatus: toRevMap(integrationStatus, byName),
      httpMethod: toRevMap(httpMethod, byName),
      authType: toRevMap(authType, byName),
      teamDepartment: toRevMap(teamDepartment, byName),
      hospitalDepartment: toRevMap(hospitalDepartment, byName),
      signoffMilestone: toRevMap(signoffMilestone, byName),
      masterDataItem: toRevMap(masterDataItem, byName),
      docCategory: toRevMap(docCategory, byName),
      trainingType: toRevMap(trainingType, byName),
      role: toRevMap(role, byName),
      team: toRevMap(team, (r) => r.code || r.name),
      // parent code -> numeric id
      client: toRevMap(clients, code),
      project: toRevMap(projects, code),
      feature: toRevMap(features, code),
      integration: toRevMap(integrations, code),
      api: toRevMap(apisList, code),
    };
  })();
  return writeCache;
};
