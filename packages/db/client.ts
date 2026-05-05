import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export function createDbClient(url: string) {
  return drizzle(postgres(url));
}
