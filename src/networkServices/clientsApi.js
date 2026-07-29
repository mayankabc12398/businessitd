import makeApiRequest, { toList } from "./axiosInstance";
import { apiUrls } from "./apiEndpoints";

export const getClientList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetClientList, { method: "get", params }));

export const getClientById = (id) =>
  makeApiRequest(apiUrls.GetClientById, { method: "get", params: { id } });

export const getClientProjects = async (id) =>
  toList(await makeApiRequest(apiUrls.GetClientProjects, { method: "get", params: { id } }));

export const insertClient = (data) =>
  makeApiRequest(apiUrls.InsertClient, { method: "post", data });

export const updateClient = (id, data) =>
  makeApiRequest(apiUrls.UpdateClient, { method: "put", params: { id }, data });

export const deleteClient = (id) =>
  makeApiRequest(apiUrls.DeleteClient, { method: "delete", params: { id } });
