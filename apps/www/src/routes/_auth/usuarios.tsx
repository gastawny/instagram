import { createFileRoute, useRouter } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { UserList } from "@/modules/usuarios/components/user-list";
import { useAuth } from "@/shared/auth/use-auth";

const searchSchema = z.object({
  pagina: z.coerce.number().int().min(1).catch(1),
  limite: z.coerce.number().int().min(1).max(50).catch(12),
});

export const Route = createFileRoute("/_auth/usuarios")({
  validateSearch: searchSchema,
  component: UsuariosPage,
});

function UsuariosPage() {
  const { pagina, limite } = Route.useSearch();
  const router = useRouter();
  const auth = useAuth();

  function handlePageChange(newPage: number) {
    router.navigate({
      to: "/usuarios",
      search: { pagina: newPage, limite },
    });
  }

  return (
    <main className="min-h-dvh px-4 py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Usuários</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {auth.user?.nome}
          </span>
          <Button variant="ghost" size="sm" onClick={auth.logout}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Sair</span>
          </Button>
        </div>
      </div>
      <UserList
        pagina={pagina}
        limite={limite}
        onPageChange={handlePageChange}
      />
    </main>
  );
}
