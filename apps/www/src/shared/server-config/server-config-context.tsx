import { createContext, useContext } from "react";

export type ServerConfig = {
  host: string;
  port: string;
};

export type ServerConfigContextValue = {
  config: ServerConfig | null;
  setConfig: (config: ServerConfig) => void;
  reset: () => void;
};

export const ServerConfigContext =
  createContext<ServerConfigContextValue | null>(null);

export function useServerConfig() {
  const ctx = useContext(ServerConfigContext);
  if (!ctx)
    throw new Error("useServerConfig must be used inside ServerConfigProvider");
  return ctx;
}

export function buildApiUrl(config: ServerConfig) {
  return `http://${config.host}:${config.port}`;
}
