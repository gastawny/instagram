import { createContext } from "react";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  usuario: string;
  biografia: string | null;
  foto_url: string | null;
}

export interface AuthContextValue {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: Usuario) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
