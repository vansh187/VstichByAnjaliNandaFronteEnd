export const VSTITCH_USER_ID_STORAGE_KEY = "vstitch_user_id";

export function normalizeVstitchUserId(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

export function readStoredVstitchUserId() {
  return normalizeVstitchUserId(localStorage.getItem(VSTITCH_USER_ID_STORAGE_KEY));
}

export function storeVstitchUserId(value) {
  const userId = normalizeVstitchUserId(value);
  if (!userId) return null;

  localStorage.setItem(VSTITCH_USER_ID_STORAGE_KEY, String(userId));
  return userId;
}

export function clearStoredVstitchUserId() {
  localStorage.removeItem(VSTITCH_USER_ID_STORAGE_KEY);
}
