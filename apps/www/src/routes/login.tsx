import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/modules/auth/components/login-form";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <main className="flex h-dvh items-center justify-center px-4">
      <LoginForm />
    </main>
  );
}
