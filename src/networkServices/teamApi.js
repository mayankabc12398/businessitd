import makeApiRequest, { toList } from "./axiosInstance";
import { apiUrls } from "./apiEndpoints";

export const getTeamMemberList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetTeamMemberList, { method: "get", params }));

export const getTeamMemberById = (id) =>
  makeApiRequest(apiUrls.GetTeamMemberById, { method: "get", params: { id } });

export const insertTeamMember = (data) =>
  makeApiRequest(apiUrls.InsertTeamMember, { method: "post", data });

export const updateTeamMember = (id, data) =>
  makeApiRequest(apiUrls.UpdateTeamMember, { method: "put", params: { id }, data });

export const deleteTeamMember = (id) =>
  makeApiRequest(apiUrls.DeleteTeamMember, { method: "delete", params: { id } });
