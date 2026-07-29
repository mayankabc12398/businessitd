import makeApiRequest, { toList } from "./axiosInstance";
import { apiUrls } from "./apiEndpoints";

export const getApiList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetApiList, { method: "get", params }));
export const getApiById = (id) =>
  makeApiRequest(apiUrls.GetApiById, { method: "get", params: { id } });
export const insertApi = (data) =>
  makeApiRequest(apiUrls.InsertApi, { method: "post", data });
export const updateApi = (id, data) =>
  makeApiRequest(apiUrls.UpdateApi, { method: "put", params: { id }, data });
export const deleteApi = (id) =>
  makeApiRequest(apiUrls.DeleteApi, { method: "delete", params: { id } });
export const saveApiPayload = (id, data) =>
  makeApiRequest(apiUrls.SaveApiPayload, { method: "put", params: { id }, data });
export const getApiPayloadList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetApiPayloadList, { method: "get", params }));
