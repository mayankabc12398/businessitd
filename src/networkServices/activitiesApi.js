import makeApiRequest, { toList } from "./axiosInstance";
import { apiUrls } from "./apiEndpoints";

// ---- Activity schedule ----
export const getActivityList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetActivityList, { method: "get", params }));
export const getActivityById = (id) =>
  makeApiRequest(apiUrls.GetActivityById, { method: "get", params: { id } });
export const insertActivity = (data) =>
  makeApiRequest(apiUrls.InsertActivity, { method: "post", data });
export const updateActivity = (id, data) =>
  makeApiRequest(apiUrls.UpdateActivity, { method: "put", params: { id }, data });
export const deleteActivity = (id) =>
  makeApiRequest(apiUrls.DeleteActivity, { method: "delete", params: { id } });
export const getActivityModules = async (id) =>
  toList(await makeApiRequest(apiUrls.GetActivityModules, { method: "get", params: { id } }));
export const saveActivityModules = (id, moduleIds) =>
  makeApiRequest(apiUrls.SaveActivityModules, { method: "put", params: { id }, data: moduleIds });

// ---- Hospital users ----
export const getHospitalUserList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetHospitalUserList, { method: "get", params }));
export const insertHospitalUser = (data) =>
  makeApiRequest(apiUrls.InsertHospitalUser, { method: "post", data });
export const updateHospitalUser = (id, data) =>
  makeApiRequest(apiUrls.UpdateHospitalUser, { method: "put", params: { id }, data });
export const deleteHospitalUser = (id) =>
  makeApiRequest(apiUrls.DeleteHospitalUser, { method: "delete", params: { id } });
