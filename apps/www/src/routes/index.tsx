import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof localStorage !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        throw redirect({ to: "/perfil" });
      }
    }
    throw redirect({ to: "/login" });
  },
  component: () => null,
});
