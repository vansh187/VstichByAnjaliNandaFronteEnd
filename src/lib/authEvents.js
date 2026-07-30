// Lets http.js (a plain module with no React tree access) tell AuthContext
// that the current session just got rejected by the server, so every
// authenticated call - not just the ones that happen to check err.status
// themselves - can trigger the same force-logout CheckoutPage already did
// for its own 401s.
let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export function notifyUnauthorized() {
  unauthorizedHandler?.();
}
