import { post } from "./http";

export function signup(payload) {
  return post("/signup", payload);
}

export function login(payload) {
  return post("/login", payload);
}

export function googleLogin(payload) {
  return post("/auth/google", payload);
}

export function subscribe(payload) {
  return post("/subscribe", payload);
}

export function requestPasswordResetOtp(payload) {
  return post("/password-reset/request", payload);
}

export function confirmPasswordReset(payload) {
  return post("/password-reset/confirm", payload);
}

// Updates the logged-in user's saved location (vstitch_users table) —
// used at login, since signup already carries location in its own payload.
export function updateUserLocation(payload, token) {
  return post("/users/location", payload, token);
}
