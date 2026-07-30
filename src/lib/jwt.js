// Cheap client-side expiry read - never used for verification (the backend
// is the only thing that ever validates a token), only so the UI can tell a
// stale session apart from a live one without waiting on a round trip.
export function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof decoded.exp !== "number") return false; // no exp claim - let the backend be the judge
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true; // not a well-formed JWT - can't be a usable session
  }
}
