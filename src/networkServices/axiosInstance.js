// ============================================================
// Axios instance + request helper. Mirrors the hospediav12-fe
// networkServices format (axios.create + makeApiRequest), adapted:
// no redux loader, no auth/localStorage — this app has none.
// ============================================================
import axios from "axios";

// Base URL includes the version segment, e.g. http://localhost:5264/api/v1
export const APIBaseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5264/api/v1";

const axiosInstance = axios.create({
  baseURL: APIBaseURL,
  headers: { "Content-Type": "application/json" },
});

// HTTP status code -> human message. Fallback when the server sends none.
const STATUS_MESSAGES = {
  400: "Bad request. Please check the submitted data.",
  401: "Session expired. Please log in again.",
  403: "Access denied. You don't have permission to do this.",
  404: "Requested resource not found.",
  405: "This action is not allowed.",
  408: "Request timed out. Please try again.",
  409: "Conflict with the current data. Please refresh and retry.",
  413: "The data you sent is too large.",
  422: "Validation failed. Please check your input.",
  429: "Too many requests. Please slow down and retry.",
  500: "Internal server error. Please try again later.",
  502: "Bad gateway. The server returned an invalid response.",
  503: "Service unavailable. Please try again later.",
  504: "Gateway timeout. The server took too long to respond.",
};

// Pull the first usable string out of a server `errors` payload, which can be
// a string, an array, or an object of field -> string[] (e.g. { Name: ["..."] }).
const extractFirstError = (errors) => {
  if (!errors) return undefined;
  if (typeof errors === "string") return errors;
  if (Array.isArray(errors)) return extractFirstError(errors[0]);
  if (typeof errors === "object") return extractFirstError(Object.values(errors)[0]);
  return undefined;
};

// Build a proper, status-aware message for any failed request.
export const getApiErrorMessage = (error) => {
  if (!error?.response) {
    if (error?.code === "ERR_NETWORK") return "Network error. Unable to reach the server.";
    if (error?.code === "ECONNABORTED") return "Request timed out. Please try again.";
    return error?.message || "Something went wrong. Please try again.";
  }
  const { status, data } = error.response;
  const serverMsg =
    (typeof data === "string" && data) ||
    data?.message ||
    data?.error ||
    extractFirstError(data?.errors);
  if (serverMsg && typeof serverMsg === "string") return serverMsg;
  return STATUS_MESSAGES[status] || `Request failed (status ${status}).`;
};

// Every businessAPI action returns HTTP 200 with the envelope
// { message, data, success }. `data` may be an entity, a list, a paged
// { items, page, pageSize, total, totalPages }, or { errors } on validation.
// This helper unwraps that envelope: returns `data` on success, throws with the
// server message on `success:false` (attaching `.errors` for form handling).
// System endpoints like /health are not enveloped — returned as-is.
const makeApiRequest = async (url, options = {}) => {
  const { method = "get", data, params, headers, signal } = options;
  try {
    const response = await axiosInstance({
      method: method.toLowerCase(),
      url,
      ...(data !== undefined && { data }),
      ...(params && { params }),
      ...(headers && { headers }),
      ...(signal && { signal }),
    });
    const env = response.data;
    if (env && typeof env === "object" && "success" in env) {
      if (!env.success) {
        const err = new Error(env.message || "Request failed.");
        err.success = false;
        err.errors = env?.data?.errors;
        err.envelope = env;
        throw err;
      }
      return env.data;
    }
    return env;
  } catch (error) {
    // Re-throw a business-rule failure (success:false) untouched.
    if (error?.success === false) throw error;
    // HTTP / network failure -> status-aware message.
    const err = new Error(getApiErrorMessage(error));
    err.status = error?.response?.status;
    err.errors = error?.response?.data?.errors;
    throw err;
  }
};

// A list endpoint returns either a raw array or a paged { items } envelope.
// Normalize to a plain array for the UI.
export const toList = (data) =>
  Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];

export default makeApiRequest;
