import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/shared/auth/require-auth";

export const Route = createFileRoute("/_auth")({
  component: RequireAuth,
});
