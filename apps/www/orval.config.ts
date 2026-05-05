import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: "./src/swagger.json",
    output: {
      target: "./src/api",
      client: "react-query",
      clean: true,
      override: {
        mutator: {
          path: "./src/lib/api-client.ts",
          name: "apiClient",
        },
      },
    },
  },
});
