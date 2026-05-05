import { API_URL } from "@/env";

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

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  const body = await response.json();

  if (!response.ok || body.status === "erro") {
    throw new ApiRequestError(
      body.codigo ?? "ERRO_DESCONHECIDO",
      body.mensagem ?? "Erro inesperado",
      response.status,
    );
  }

  return (body.dados ?? body) as T;
};
