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

let cache = null;

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
