import makeApiRequest, { toList } from "./axiosInstance";
import { apiUrls } from "./apiEndpoints";

// ---- Issues ----
export const getIssueList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetIssueList, { method: "get", params }));
export const insertIssue = (data) =>
  makeApiRequest(apiUrls.InsertIssue, { method: "post", data });
export const updateIssue = (id, data) =>
  makeApiRequest(apiUrls.UpdateIssue, { method: "put", params: { id }, data });
export const deleteIssue = (id) =>
  makeApiRequest(apiUrls.DeleteIssue, { method: "delete", params: { id } });

// ---- Risks ----
export const getRiskList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetRiskList, { method: "get", params }));
export const insertRisk = (data) =>
  makeApiRequest(apiUrls.InsertRisk, { method: "post", data });
export const updateRisk = (id, data) =>
  makeApiRequest(apiUrls.UpdateRisk, { method: "put", params: { id }, data });
export const deleteRisk = (id) =>
  makeApiRequest(apiUrls.DeleteRisk, { method: "delete", params: { id } });

// ---- Signoffs ----
export const getSignoffList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetSignoffList, { method: "get", params }));
export const insertSignoff = (data) =>
  makeApiRequest(apiUrls.InsertSignoff, { method: "post", data });
export const updateSignoff = (id, data) =>
  makeApiRequest(apiUrls.UpdateSignoff, { method: "put", params: { id }, data });
export const deleteSignoff = (id) =>
  makeApiRequest(apiUrls.DeleteSignoff, { method: "delete", params: { id } });

// ---- Documents ----
export const getDocumentList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetDocumentList, { method: "get", params }));
export const insertDocument = (data) =>
  makeApiRequest(apiUrls.InsertDocument, { method: "post", data });
export const updateDocument = (id, data) =>
  makeApiRequest(apiUrls.UpdateDocument, { method: "put", params: { id }, data });
export const deleteDocument = (id) =>
  makeApiRequest(apiUrls.DeleteDocument, { method: "delete", params: { id } });
