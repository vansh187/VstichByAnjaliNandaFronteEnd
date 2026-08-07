import { useCallback, useEffect, useRef, useState } from "react";

const GOOGLE_CLIENT_ID = "698686810115-ruriejj8olt099g99qajcllmijkd5d7n.apps.googleusercontent.com";
const SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const SCRIPT_ID = "google-identity-script";
const LOAD_TIMEOUT_MS = 6000;

// Loads the Google Identity Services script (if not already present), wires
// it up to `onCredential`, and reports readiness so callers can show a
// sensible fallback (rather than a dead button or a thrown error) whenever
// Google's SDK is slow, blocked, or unreachable.
export function useGoogleSignIn(onCredential) {
  const [status, setStatus] = useState("loading"); // loading | ready | unavailable
  const callbackRef = useRef(onCredential);

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    let cancelled = false;
    let timeoutId;

    function markReady() {
      if (cancelled) return;
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => callbackRef.current(response.credential),
          auto_select: false,
        });
        setStatus("ready");
      } catch {
        setStatus("unavailable");
      }
    }

    function markUnavailable() {
      if (!cancelled) setStatus("unavailable");
    }

    if (window.google?.accounts?.id) {
      markReady();
      return () => {
        cancelled = true;
      };
    }

    let script = document.getElementById(SCRIPT_ID);
    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    script.addEventListener("load", markReady);
    script.addEventListener("error", markUnavailable);
    timeoutId = setTimeout(markUnavailable, LOAD_TIMEOUT_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      script.removeEventListener("load", markReady);
      script.removeEventListener("error", markUnavailable);
    };
  }, []);

  const promptSignIn = useCallback(
    (onUnavailable) => {
      if (status !== "ready" || !window.google?.accounts?.id) {
        onUnavailable?.();
        return;
      }
      try {
        window.google.accounts.id.prompt((notification) => {
          // Only treat an outright failure to display as "unavailable" - a
          // user closing/skipping a prompt they did see is not an error.
          if (notification.isNotDisplayed?.()) {
            onUnavailable?.();
          }
        });
      } catch {
        onUnavailable?.();
      }
    },
    [status],
  );

  return { status, promptSignIn };
}
