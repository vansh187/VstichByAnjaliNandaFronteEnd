export const BACKEND_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  "https://api.vstitchbyanjalinanda.com";

export function parseVerificationParams(location) {
  if (!location) {
    return { userId: null, token: null };
  }

  const searchParams = new URLSearchParams(location.search ?? "");
  const userIdFromQuery = searchParams.get("user_id");
  const tokenFromQuery = searchParams.get("token");

  if (userIdFromQuery || tokenFromQuery) {
    return {
      userId: userIdFromQuery ?? null,
      token: tokenFromQuery ?? null,
    };
  }

  const match = (location.pathname ?? "").match(/^\/verify-email\/(\d+)\/(.+)$/);
  if (match) {
    return {
      userId: match[1] ?? null,
      token: match[2] ?? null,
    };
  }

  return { userId: null, token: null };
}

export function getLoginRedirectUrl(currentOrigin = typeof window !== "undefined" ? window.location.origin : "") {
  const normalizedOrigin = currentOrigin || "https://vstitchbyanjalinanda.com";
  const backendOrigins = [
    "https://api.vstitchbyanjalinanda.com",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
  ];

  if (backendOrigins.includes(normalizedOrigin)) {
    return "https://vstitchbyanjalinanda.com/login";
  }

  return `${normalizedOrigin}/login`;
}
