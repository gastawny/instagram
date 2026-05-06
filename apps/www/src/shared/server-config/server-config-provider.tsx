import { type ReactNode, useState } from "react";
import {
  type ServerConfig,
  ServerConfigContext,
} from "./server-config-context";
import { ServerConfigForm } from "./server-config-form";

const STORAGE_KEY = "server_config";

function loadConfig(): ServerConfig | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ServerConfig) : null;
  } catch {
    return null;
  }
}

function saveConfig(config: ServerConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function ServerConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<ServerConfig | null>(loadConfig);

  function setConfig(next: ServerConfig) {
    saveConfig(next);
    setConfigState(next);
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    setConfigState(null);
  }

  if (!config) {
    return (
      <ServerConfigContext.Provider value={{ config, setConfig, reset }}>
        <ServerConfigForm onSave={setConfig} />
      </ServerConfigContext.Provider>
    );
  }

  return (
    <ServerConfigContext.Provider value={{ config, setConfig, reset }}>
      {children}
    </ServerConfigContext.Provider>
  );
}
