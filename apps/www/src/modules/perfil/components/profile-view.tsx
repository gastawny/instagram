import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Usuario } from "@/shared/auth/auth-context";
import { DeleteAccountDialog } from "./delete-account-dialog";

interface ProfileViewProps {
  user: Usuario;
  onEdit: () => void;
  onLogout: () => void;
}

function getInitials(nome: string) {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function ProfileView({ user, onEdit, onLogout }: ProfileViewProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={user.foto_url ?? undefined} alt={user.nome} />
        <AvatarFallback className="text-2xl">
          {getInitials(user.nome)}
        </AvatarFallback>
      </Avatar>

      <div className="text-center">
        <h1 className="text-xl font-semibold">{user.nome}</h1>
        <Badge variant="secondary" className="mt-1">
          @{user.usuario}
        </Badge>
      </div>

      {user.biografia && (
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          {user.biografia}
        </p>
      )}

      <Separator className="w-full" />

      <div className="w-full space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">E-mail</span>
          <span>{user.email}</span>
        </div>
      </div>

      <div className="flex gap-2 w-full pt-2">
        <Button className="flex-1" onClick={onEdit}>
          Editar perfil
        </Button>
        <DeleteAccountDialog />
        <Button variant="ghost" size="icon" onClick={onLogout} title="Sair">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
