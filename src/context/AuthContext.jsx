import { useCallback, useMemo, useState } from "react";
import { AuthContext } from "./authContextObject";
import { login as loginRequest, signup as signupRequest } from "../lib/api";

const STORAGE_KEY = "vstitch_auth";

function readStoredSession() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { user: null, token: null };
  try {
    const parsed = JSON.parse(raw);
    return { user: parsed.user ?? null, token: parsed.token ?? null };
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

  const signup = useCallback((payload) => signupRequest(payload), []);

  const logout = useCallback(() => persist(null, null), [persist]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      ready: true,
      login,
      signup,
      logout,
    }),
    [user, token, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
