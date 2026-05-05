import { Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "./use-auth";

export function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login" as string });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return <Outlet />;
}
