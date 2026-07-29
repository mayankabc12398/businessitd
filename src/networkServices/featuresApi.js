import makeApiRequest, { toList } from "./axiosInstance";
import { apiUrls } from "./apiEndpoints";

export const getFeatureList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetFeatureList, { method: "get", params }));
export const getFeatureById = (id) =>
  makeApiRequest(apiUrls.GetFeatureById, { method: "get", params: { id } });
export const insertFeature = (data) =>
  makeApiRequest(apiUrls.InsertFeature, { method: "post", data });
export const updateFeature = (id, data) =>
  makeApiRequest(apiUrls.UpdateFeature, { method: "put", params: { id }, data });
export const deleteFeature = (id) =>
  makeApiRequest(apiUrls.DeleteFeature, { method: "delete", params: { id } });

export const advanceFeature = (id) =>
  makeApiRequest(apiUrls.AdvanceFeature, { method: "post", params: { id } });
export const setFeatureStatus = (id, status) =>
  makeApiRequest(apiUrls.SetFeatureStatus, { method: "put", params: { id }, data: { status } });

export const getFeatureSegments = async (id) =>
  toList(await makeApiRequest(apiUrls.GetFeatureSegments, { method: "get", params: { id } }));
export const saveFeatureSegments = (id, segments) =>
  makeApiRequest(apiUrls.SaveFeatureSegments, { method: "put", params: { id }, data: segments });
