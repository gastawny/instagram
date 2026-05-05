import { useCallback, useMemo, useState } from "react";
import { usePostUsuariosLogout } from "@/api/elysiaDocumentation";
import { AuthContext, type Usuario } from "./auth-context";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

function readStorage(): { token: string | null; user: Usuario | null } {
  if (typeof localStorage === "undefined") return { token: null, user: null };
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    const user = raw ? (JSON.parse(raw) as Usuario) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initial = readStorage();
  const [token, setToken] = useState<string | null>(initial.token);
  const [user, setUser] = useState<Usuario | null>(initial.user);

  const { mutateAsync: logoutApi } = usePostUsuariosLogout();

  const login = useCallback((newToken: string, newUser: Usuario) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // token may already be invalid; clear anyway
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, [logoutApi]);

  const value = useMemo(
    () => ({ user, token, isAuthenticated: !!token, login, logout }),
    [user, token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
