import makeApiRequest, { toList } from "./axiosInstance";
import { apiUrls } from "./apiEndpoints";

export const getIntegrationList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetIntegrationList, { method: "get", params }));
export const getIntegrationById = (id) =>
  makeApiRequest(apiUrls.GetIntegrationById, { method: "get", params: { id } });
export const getIntegrationApis = async (id) =>
  toList(await makeApiRequest(apiUrls.GetIntegrationApis, { method: "get", params: { id } }));
export const insertIntegration = (data) =>
  makeApiRequest(apiUrls.InsertIntegration, { method: "post", data });
export const updateIntegration = (id, data) =>
  makeApiRequest(apiUrls.UpdateIntegration, { method: "put", params: { id }, data });
export const deleteIntegration = (id) =>
  makeApiRequest(apiUrls.DeleteIntegration, { method: "delete", params: { id } });

// ---- Child catalogues (read lists) ----
export const getProcessFlowList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetProcessFlowList, { method: "get", params }));
export const getHimsChangeList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetHimsChangeList, { method: "get", params }));
export const getDbChangeList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetDbChangeList, { method: "get", params }));
export const getSourceCodeList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetSourceCodeList, { method: "get", params }));
export const getIntegrationScreenList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetIntegrationScreenList, { method: "get", params }));
export const getClientImplementationList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetClientImplementationList, { method: "get", params }));
export const getIntegrationTestCaseList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetIntegrationTestCaseList, { method: "get", params }));
export const getIntegrationDocumentList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetIntegrationDocumentList, { method: "get", params }));
export const getVersionHistoryList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetVersionHistoryList, { method: "get", params }));
export const getDeveloperNoteList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetDeveloperNoteList, { method: "get", params }));
export const getVendorList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetVendorList, { method: "get", params }));
