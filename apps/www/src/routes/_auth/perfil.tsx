import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useGetUsuariosById } from "@/api/elysiaDocumentation";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileEditForm } from "@/modules/perfil/components/profile-edit-form";
import { ProfileView } from "@/modules/perfil/components/profile-view";
import type { Usuario } from "@/shared/auth/auth-context";
import { useAuth } from "@/shared/auth/use-auth";

export const Route = createFileRoute("/_auth/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  const auth = useAuth();
  const { user: authUser } = auth;
  const [editing, setEditing] = useState(false);

  const { data, isLoading, refetch } = useGetUsuariosById(authUser?.id ?? "", {
    query: { enabled: !!authUser?.id },
  });

  const user = (data as unknown as Usuario) ?? authUser;

  if (isLoading) {
    return (
      <main className="flex min-h-dvh items-start justify-center px-4 pt-16">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh items-start justify-center px-4 pt-16">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          {editing ? (
            <ProfileEditForm
              user={user!}
              onCancel={() => setEditing(false)}
              onSaved={() => {
                refetch();
                setEditing(false);
              }}
            />
          ) : (
            <ProfileView
              user={user!}
              onEdit={() => setEditing(true)}
              onLogout={auth.logout}
            />
          )}
        </CardContent>
      </Card>
    </main>
  );
}
