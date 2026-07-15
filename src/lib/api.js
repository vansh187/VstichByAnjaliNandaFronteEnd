import { API_BASE_URL } from "./apiConfig";

function normalizeError(status, data) {
  if (status === 422 && Array.isArray(data?.detail)) {
    const fieldErrors = {};
    data.detail.forEach((err) => {
      const field = err.loc?.[err.loc.length - 1];
      if (field) fieldErrors[field] = err.msg;
    });
    const error = new Error("Please check the highlighted fields and try again.");
    error.fieldErrors = fieldErrors;
    error.status = status;
    return error;
  }

  const message =
    typeof data?.detail === "string"
      ? data.detail
      : "Something went wrong. Please try again later.";
  const error = new Error(message);
  error.status = status;
  return error;
}

async function post(path, body) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
    throw normalizeError(response.status, data);
  }

  return data;
}

export function signup(payload) {
  return post("/signup", payload);
}

export function login(payload) {
  return post("/login", payload);
}
