import makeApiRequest from "./axiosInstance";
import { apiUrls } from "./apiEndpoints";

export const getSfrKpis = () =>
  makeApiRequest(apiUrls.GetSfrKpis, { method: "get" });
export const getFeatureCategoryMix = () =>
  makeApiRequest(apiUrls.GetFeatureCategoryMix, { method: "get" });
