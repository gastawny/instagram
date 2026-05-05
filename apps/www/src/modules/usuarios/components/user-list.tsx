import { useGetUsuarios } from "@/api/elysiaDocumentation";
import { Skeleton } from "@/components/ui/skeleton";
import type { Usuario } from "@/shared/auth/auth-context";
import { PaginationControls } from "./pagination-controls";
import { UserCard } from "./user-card";

interface UserListData {
  total: number;
  pagina: number;
  limite: number;
  usuarios: Usuario[];
}

interface UserListProps {
  pagina: number;
  limite: number;
  onPageChange: (page: number) => void;
}

export function UserList({ pagina, limite, onPageChange }: UserListProps) {
  const { data, isLoading, isError } = useGetUsuarios({ pagina, limite });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: limite }, (_, i) => `sk-${i}`).map((id) => (
            <Skeleton key={id} className="h-40 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Nenhum usuário encontrado.
      </div>
    );
  }

  const list = data as unknown as UserListData;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {list.usuarios.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
      {list.total > limite && (
        <PaginationControls
          pagina={pagina}
          total={list.total}
          limite={limite}
          onPrev={() => onPageChange(pagina - 1)}
          onNext={() => onPageChange(pagina + 1)}
        />
      )}
    </div>
  );
}
