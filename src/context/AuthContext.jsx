import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContextObject";
import {
  login as loginRequest,
  signup as signupRequest,
  googleLogin as googleLoginRequest,
} from "../lib/api";
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

  const loginWithGoogle = useCallback(
    async (idToken) => {
      const data = await googleLoginRequest({ id_token: idToken });
      persist({ id: data.vstitch_user_id, username: data.vstitch_user_name }, data.access_token);
      return data;
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
      loginWithGoogle,
      signup,
      logout,
    }),
    [user, token, login, loginWithGoogle, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
