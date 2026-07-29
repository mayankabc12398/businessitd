import makeApiRequest, { toList } from "./axiosInstance";
import { apiUrls } from "./apiEndpoints";

// ---- Upserts (create-or-overwrite the doc block on a feature) ----
export const saveBusinessAnalysis = (id, data) =>
  makeApiRequest(apiUrls.SaveBusinessAnalysis, { method: "put", params: { id }, data });
export const saveTechnicalAnalysis = (id, data) =>
  makeApiRequest(apiUrls.SaveTechnicalAnalysis, { method: "put", params: { id }, data });
export const saveWorkflow = (id, data) =>
  makeApiRequest(apiUrls.SaveWorkflow, { method: "put", params: { id }, data });
export const saveDevDetails = (id, data) =>
  makeApiRequest(apiUrls.SaveDevDetails, { method: "put", params: { id }, data });
export const saveImpact = (id, data) =>
  makeApiRequest(apiUrls.SaveImpact, { method: "put", params: { id }, data });

// ---- Read lists ----
export const getFeatureBusinessAnalysisList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetFeatureBusinessAnalysisList, { method: "get", params }));
export const getFeatureTechnicalAnalysisList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetFeatureTechnicalAnalysisList, { method: "get", params }));
export const getFeatureWorkflowList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetFeatureWorkflowList, { method: "get", params }));
export const getFeatureDevDetailsList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetFeatureDevDetailsList, { method: "get", params }));
export const getFeatureImpactList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetFeatureImpactList, { method: "get", params }));
export const getFeatureScreenChangeList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetFeatureScreenChangeList, { method: "get", params }));
export const getFeatureTestList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetFeatureTestList, { method: "get", params }));
export const getFeatureClientAdoptionList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetFeatureClientAdoptionList, { method: "get", params }));
export const getFeatureKbDocList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetFeatureKbDocList, { method: "get", params }));
export const getFeatureApprovalList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetFeatureApprovalList, { method: "get", params }));
