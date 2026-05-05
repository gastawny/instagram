function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is required`);
  return value;
}

export const PORT = process.env.PORT ?? "8080";
export const DATABASE_URL = requireEnv("DATABASE_URL");
export const JWT_SECRET = requireEnv("JWT_SECRET");
