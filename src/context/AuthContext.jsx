import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContextObject";
import { login as loginRequest, signup as signupRequest } from "../lib/api";
import { setUnauthorizedHandler } from "../lib/authEvents";
import { isTokenExpired } from "../lib/jwt";

const STORAGE_KEY = "vstitch_auth";

// How often to re-check the stored token's expiry while a tab stays open on
// one page - catches a session going stale mid-visit, not just on reload.
const EXPIRY_CHECK_INTERVAL_MS = 60 * 1000;

function readStoredSession() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { user: null, token: null };
  try {
    const parsed = JSON.parse(raw);
    const token = parsed.token ?? null;
    if (token && isTokenExpired(token)) {
      localStorage.removeItem(STORAGE_KEY);
      return { user: null, token: null };
    }
    return { user: parsed.user ?? null, token };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return { user: null, token: null };
  }
}

export function AuthProvider({ children }) {
  const [{ user, token }, setSession] = useState(readStoredSession);

  const persist = useCallback((nextUser, nextToken) => {
    setSession({ user: nextUser, token: nextToken });
    if (nextUser && nextToken) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: nextUser, token: nextToken }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(
    async (vstitchUserName, password) => {
      const data = await loginRequest({
        vstitch_user_name: vstitchUserName,
        password,
      });
      persist({ id: data.vstitch_user_id, username: data.vstitch_user_name }, data.access_token);
      return data;
    },
    [persist],
  );

  // The Google *redirect* flow (unlike password login or the old GIS-widget
  // credential exchange) never gives our JS a token to POST anywhere - the
  // backend does the whole OAuth dance server-side and hands back a
  // ready-made session in the URL fragment it redirects to. This just files
  // that session away the same way persist() does for every other login path.
  const applyGoogleSession = useCallback(
    (accessToken, vstitchUserId, vstitchUserName) => {
      persist({ id: vstitchUserId, username: vstitchUserName }, accessToken);
    },
    [persist],
  );

  const signup = useCallback((payload) => signupRequest(payload), []);

  const logout = useCallback(() => persist(null, null), [persist]);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    if (!token) return undefined;
    const interval = setInterval(() => {
      if (isTokenExpired(token)) logout();
    }, EXPIRY_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [token, logout]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      ready: true,
      login,
      applyGoogleSession,
      signup,
      logout,
    }),
    [user, token, login, applyGoogleSession, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
