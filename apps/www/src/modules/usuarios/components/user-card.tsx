import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { Usuario } from "@/shared/auth/auth-context";

function getInitials(nome: string) {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function UserCard({ user }: { user: Usuario }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.foto_url ?? undefined} alt={user.nome} />
          <AvatarFallback>{getInitials(user.nome)}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <p className="font-medium truncate max-w-[120px]">{user.nome}</p>
          <p className="text-sm text-muted-foreground truncate max-w-[120px]">
            @{user.usuario}
          </p>
          {user.biografia && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 max-w-[140px]">
              {user.biografia}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
