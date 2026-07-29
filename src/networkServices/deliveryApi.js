import makeApiRequest, { toList } from "./axiosInstance";
import { apiUrls } from "./apiEndpoints";

// ---- SRS sessions ----
export const getSrsSessionList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetSrsSessionList, { method: "get", params }));
export const insertSrsSession = (data) =>
  makeApiRequest(apiUrls.InsertSrsSession, { method: "post", data });
export const updateSrsSession = (id, data) =>
  makeApiRequest(apiUrls.UpdateSrsSession, { method: "put", params: { id }, data });
export const deleteSrsSession = (id) =>
  makeApiRequest(apiUrls.DeleteSrsSession, { method: "delete", params: { id } });

// ---- Requirements ----
export const getRequirementList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetRequirementList, { method: "get", params }));
export const insertRequirement = (data) =>
  makeApiRequest(apiUrls.InsertRequirement, { method: "post", data });
export const updateRequirement = (id, data) =>
  makeApiRequest(apiUrls.UpdateRequirement, { method: "put", params: { id }, data });
export const deleteRequirement = (id) =>
  makeApiRequest(apiUrls.DeleteRequirement, { method: "delete", params: { id } });

// ---- Master data records ----
export const getMasterDataRecordList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetMasterDataRecordList, { method: "get", params }));
export const insertMasterDataRecord = (data) =>
  makeApiRequest(apiUrls.InsertMasterDataRecord, { method: "post", data });
export const updateMasterDataRecord = (id, data) =>
  makeApiRequest(apiUrls.UpdateMasterDataRecord, { method: "put", params: { id }, data });
export const deleteMasterDataRecord = (id) =>
  makeApiRequest(apiUrls.DeleteMasterDataRecord, { method: "delete", params: { id } });

// ---- Development items ----
export const getDevelopmentItemList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetDevelopmentItemList, { method: "get", params }));
export const insertDevelopmentItem = (data) =>
  makeApiRequest(apiUrls.InsertDevelopmentItem, { method: "post", data });
export const updateDevelopmentItem = (id, data) =>
  makeApiRequest(apiUrls.UpdateDevelopmentItem, { method: "put", params: { id }, data });
export const deleteDevelopmentItem = (id) =>
  makeApiRequest(apiUrls.DeleteDevelopmentItem, { method: "delete", params: { id } });

// ---- UAT cases ----
export const getUatCaseList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetUatCaseList, { method: "get", params }));
export const insertUatCase = (data) =>
  makeApiRequest(apiUrls.InsertUatCase, { method: "post", data });
export const updateUatCase = (id, data) =>
  makeApiRequest(apiUrls.UpdateUatCase, { method: "put", params: { id }, data });
export const deleteUatCase = (id) =>
  makeApiRequest(apiUrls.DeleteUatCase, { method: "delete", params: { id } });

// ---- Bugs ----
export const getBugList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetBugList, { method: "get", params }));
export const insertBug = (data) =>
  makeApiRequest(apiUrls.InsertBug, { method: "post", data });
export const updateBug = (id, data) =>
  makeApiRequest(apiUrls.UpdateBug, { method: "put", params: { id }, data });
export const deleteBug = (id) =>
  makeApiRequest(apiUrls.DeleteBug, { method: "delete", params: { id } });

// ---- Training ----
export const getTrainingList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetTrainingList, { method: "get", params }));
export const insertTraining = (data) =>
  makeApiRequest(apiUrls.InsertTraining, { method: "post", data });
export const updateTraining = (id, data) =>
  makeApiRequest(apiUrls.UpdateTraining, { method: "put", params: { id }, data });
export const deleteTraining = (id) =>
  makeApiRequest(apiUrls.DeleteTraining, { method: "delete", params: { id } });

// ---- Go-live (read-only aggregates) ----
export const getGoLiveReadinessList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetGoLiveReadinessList, { method: "get", params }));
export const getLiveImportList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetLiveImportList, { method: "get", params }));
export const getParallelGoLiveList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetParallelGoLiveList, { method: "get", params }));
export const getFinalGoLiveList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetFinalGoLiveList, { method: "get", params }));
