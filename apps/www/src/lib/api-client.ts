import { addLog } from "@/shared/request-log/request-log-store";
import {
  buildApiUrl,
  type ServerConfig,
} from "@/shared/server-config/server-config-context";

function getApiUrl(): string {
  try {
    const raw = localStorage.getItem("server_config");
    if (raw) return buildApiUrl(JSON.parse(raw) as ServerConfig);
  } catch {}
  return "";
}

export class ApiRequestError extends Error {
  constructor(
    public readonly codigo: string,
    public readonly mensagem: string,
    public readonly httpStatus: number,
  ) {
    super(mensagem);
    this.name = "ApiRequestError";
  }
}

export const apiClient = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const token =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("auth_token")
      : null;

  const headers = new Headers(options?.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${getApiUrl()}${url}`, {
    ...options,
    headers,
  });

  const body = await response.json();
  const isError = !response.ok || body.status === "erro";

  addLog({
    method: (options?.method ?? "GET").toUpperCase(),
    route: url,
    payload: options?.body
      ? (() => {
          try {
            return JSON.parse(options.body as string);
          } catch {
            return options.body;
          }
        })()
      : undefined,
    response: body,
    status: response.status,
    error: isError ? (body.mensagem ?? "Erro inesperado") : undefined,
  });

  if (isError) {
    throw new ApiRequestError(
      body.codigo ?? "ERRO_DESCONHECIDO",
      body.mensagem ?? "Erro inesperado",
      response.status,
    );
  }

  return (body.dados ?? body) as T;
};
