import { API_BASE_URL } from "./apiConfig";
import { notifyUnauthorized } from "./authEvents";

function normalizeError(status, data) {
  if (status === 422 && Array.isArray(data?.detail)) {
    const fieldErrors = {};
    data.detail.forEach((err) => {
      const field = err.loc?.[err.loc.length - 1];
      // Pydantic prefixes custom @validator messages with "Value error, "
      // before the actual text - strip it so the UI shows a clean sentence.
      if (field) fieldErrors[field] = err.msg?.replace(/^Value error,\s*/i, "");
    });
    const error = new Error("Please check the highlighted fields and try again.");
    error.fieldErrors = fieldErrors;
    error.status = status;
    return error;
  }

  const message =
    typeof data?.detail === "string"
      ? data.detail
      : typeof data?.error === "string"
        ? data.error
      : "Something went wrong. Please try again later.";
  const error = new Error(message);
  error.status = status;
  return error;
}

function buildQuery(params) {
  if (!params) return "";
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

async function request(path, { method = "GET", body, token, query } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}${buildQuery(query)}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      "Can't reach the server right now. Please check your connection and try again.",
    );
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // no JSON body
  }

  if (!response.ok) {
    // Only a call that was actually authenticated (carried a token) failing
    // with 401 means "this session is no longer valid" - a bad-password
    // response from /login or /auth/google is a 401 too, but never carries
    // a token, so it can't trigger a false-positive logout here.
    if (response.status === 401 && token) {
      notifyUnauthorized();
    }
    throw normalizeError(response.status, data);
  }

  return data;
}

export function get(path, query, token) {
  return request(path, { method: "GET", query, token });
}

export function post(path, body, token) {
  return request(path, { method: "POST", body, token });
}

export function patch(path, body, token) {
  return request(path, { method: "PATCH", body, token });
}
