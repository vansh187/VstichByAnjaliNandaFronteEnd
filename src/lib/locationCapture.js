// Fires the browser's native geolocation permission prompt exactly once per
// page load — right when the site is first opened (wired into App.jsx on
// mount), not when a user later opens the login/signup card. By the time
// someone actually submits that form, the browser has already resolved
// (allow/deny/dismiss), so awaiting this from AuthCard doesn't introduce a
// second prompt or a visible wait.
//
// Whichever form the user completes afterward decides what happens with the
// result: signup sends it along as part of account creation (an insert),
// login instead calls the update-location endpoint against the now-known
// user id. A denied/unavailable outcome flows into both as "no location" —
// normal signup/login, nothing extra sent.
//
// Resolves with a ready-to-open Google Maps link rather than raw
// latitude/longitude, so whatever gets stored is something a human can
// click straight into a map instead of two floats to paste elsewhere.
let capturePromise = null;

function resolveOnce() {
  if (capturePromise) return capturePromise;

  capturePromise = new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve({ allowed: false, googleMapsLink: null });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          allowed: true,
          googleMapsLink: `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`,
        });
      },
      () => resolve({ allowed: false, googleMapsLink: null }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  });

  return capturePromise;
}

// Called once on app mount to kick off the prompt as early as possible.
export function initLandingLocationCapture() {
  resolveOnce();
}

// Called from signup/login to read the outcome — resolves immediately if
// the user already answered the prompt, or waits for it if they somehow
// submitted before responding.
export function getLandingLocation() {
  return resolveOnce();
}
