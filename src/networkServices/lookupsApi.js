import makeApiRequest, { toList } from "./axiosInstance";
import { apiUrls } from "./apiEndpoints";

// Generic getter: pass the apiUrls key of any Lookup list.
const list = (key) => async (params) =>
  toList(await makeApiRequest(apiUrls[key], { method: "get", params }));

export const getCurrencyList = list("GetCurrencyList");
export const getCountryList = list("GetCountryList");
export const getSeverityLevelList = list("GetSeverityLevelList");
export const getHealthStatusList = list("GetHealthStatusList");
export const getProjectStatusList = list("GetProjectStatusList");
export const getProjectCategoryList = list("GetProjectCategoryList");
export const getImplementationTypeList = list("GetImplementationTypeList");
export const getHospitalTypeList = list("GetHospitalTypeList");
export const getProjectIntegrationTypeList = list("GetProjectIntegrationTypeList");
export const getLifecycleStageList = list("GetLifecycleStageList");
export const getHimsModuleList = list("GetHimsModuleList");
export const getHospitalDepartmentList = list("GetHospitalDepartmentList");
export const getInterfaceList = list("GetInterfaceList");
export const getRoleList = list("GetRoleList");
export const getTeamDepartmentList = list("GetTeamDepartmentList");
export const getIssueTypeList = list("GetIssueTypeList");
export const getRiskTypeList = list("GetRiskTypeList");
export const getTrainingTypeList = list("GetTrainingTypeList");
export const getDocCategoryList = list("GetDocCategoryList");
export const getSignoffMilestoneList = list("GetSignoffMilestoneList");
export const getBugCategoryList = list("GetBugCategoryList");
export const getIntegrationCategoryList = list("GetIntegrationCategoryList");
export const getIntegrationStatusList = list("GetIntegrationStatusList");
export const getHttpMethodList = list("GetHttpMethodList");
export const getAuthTypeList = list("GetAuthTypeList");
export const getFeatureModuleList = list("GetFeatureModuleList");
export const getFeatureCategoryList = list("GetFeatureCategoryList");
export const getFeatureStatusList = list("GetFeatureStatusList");
export const getApplicableSegmentList = list("GetApplicableSegmentList");
export const getKbDocTypeList = list("GetKbDocTypeList");
