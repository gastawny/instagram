const SENSITIVE = new Set(["senha", "senhaHash", "token"]);

function sanitize(obj: unknown): unknown {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);
  return Object.fromEntries(
    Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
      k,
      SENSITIVE.has(k) ? "[REDACTED]" : sanitize(v),
    ]),
  );
}

type Level = "INFO" | "ERROR";

function print(level: Level, ctx: string, event: string, data?: unknown) {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level}] [${ctx}]`;
  if (data !== undefined) {
    console.log(`${prefix} ${event}`, JSON.stringify(sanitize(data), null, 2));
  } else {
    console.log(`${prefix} ${event}`);
  }
}

export const logger = {
  payload(ctx: string, data: unknown) {
    print("INFO", ctx, "PAYLOAD", data);
  },
  dbQuery(ctx: string, op: string, params?: unknown) {
    print("INFO", ctx, `DB:QUERY [${op}]`, params);
  },
  dbResult(ctx: string, data: unknown) {
    print("INFO", ctx, "DB:RESULT", data);
  },
  response(ctx: string, data: unknown) {
    print("INFO", ctx, "RESPONSE", data);
  },
  error(ctx: string, error: unknown) {
    const payload =
      error instanceof Error
        ? { name: error.name, message: error.message }
        : error;
    print("ERROR", ctx, "ERROR", payload);
  },
};
