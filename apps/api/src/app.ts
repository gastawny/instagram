import cors from "@elysia/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { logger } from "./lib/logger";

export const app = new Elysia()
  .use(swagger())
  .use(cors({ origin: true }))
  .onError(({ code, error, request }) => {
    const url = new URL(request.url);
    logger.error("error-handler", {
      code,
      message: "message" in error ? error.message : String(error),
      method: request.method,
      path: url.pathname,
    });
  });
