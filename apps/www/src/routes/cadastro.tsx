import { createFileRoute } from "@tanstack/react-router";
import { RegisterForm } from "@/modules/auth/components/register-form";

export const Route = createFileRoute("/cadastro")({
  component: CadastroPage,
});

function CadastroPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-8">
      <RegisterForm />
    </main>
  );
}
