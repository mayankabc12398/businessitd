import makeApiRequest, { toList } from "./axiosInstance";
import { apiUrls } from "./apiEndpoints";

export const getDashboardSummary = () =>
  makeApiRequest(apiUrls.GetDashboardSummary, { method: "get" });
export const getNotificationList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetNotificationList, { method: "get", params }));
export const getActivityFeedList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetActivityFeedList, { method: "get", params }));
export const getUpcomingEventList = async (params) =>
  toList(await makeApiRequest(apiUrls.GetUpcomingEventList, { method: "get", params }));
