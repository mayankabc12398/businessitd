import makeApiRequest, { toList } from "./axiosInstance";
import { apiUrls } from "./apiEndpoints";

export const getProjectList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetProjectList, { method: "get", params }));

export const getProjectByCode = (code) =>
  makeApiRequest(apiUrls.GetProjectByCode, { method: "get", params: { code } });

export const insertProject = (data) =>
  makeApiRequest(apiUrls.InsertProject, { method: "post", data });

export const updateProject = (code, data) =>
  makeApiRequest(apiUrls.UpdateProject, { method: "put", params: { code }, data });

export const deleteProject = (code) =>
  makeApiRequest(apiUrls.DeleteProject, { method: "delete", params: { code } });

export const getProjectModules = async (code) =>
  toList(await makeApiRequest(apiUrls.GetProjectModules, { method: "get", params: { code } }));

export const saveProjectModules = (code, moduleIds) =>
  makeApiRequest(apiUrls.SaveProjectModules, { method: "put", params: { code }, data: moduleIds });

export const getProjectInterfaces = async (code) =>
  toList(await makeApiRequest(apiUrls.GetProjectInterfaces, { method: "get", params: { code } }));

export const saveProjectInterfaces = (code, interfaceNames) =>
  makeApiRequest(apiUrls.SaveProjectInterfaces, { method: "put", params: { code }, data: interfaceNames });

export const getProjectMilestones = async (code) =>
  toList(await makeApiRequest(apiUrls.GetProjectMilestones, { method: "get", params: { code } }));
