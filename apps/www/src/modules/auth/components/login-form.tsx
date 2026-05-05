import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { usePostUsuariosLogin } from "@/api/elysiaDocumentation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ApiRequestError } from "@/lib/api-client";
import type { Usuario } from "@/shared/auth/auth-context";
import { useAuth } from "@/shared/auth/use-auth";

const schema = z.object({
  usuario: z.string().min(1, "Usuário obrigatório"),
  senha: z.string().min(1, "Senha obrigatória"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { usuario: "", senha: "" },
  });

  const { mutateAsync } = usePostUsuariosLogin();

  async function onSubmit(values: FormValues) {
    setApiError(null);
    try {
      const result = (await mutateAsync({ data: values })) as unknown as {
        token: string;
        usuario: Usuario;
      };
      auth.login(result.token, result.usuario);
      navigate({ to: "/perfil" });
    } catch (e) {
      if (e instanceof ApiRequestError) {
        setApiError(e.mensagem);
      } else {
        setApiError("Erro inesperado. Tente novamente.");
      }
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Instagram</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {apiError && (
              <Alert variant="destructive">
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="usuario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuário</FormLabel>
                  <FormControl>
                    <Input placeholder="seu_usuario" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="senha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        Não tem conta?&nbsp;
        <a href="/cadastro" className="text-foreground underline">
          Cadastre-se
        </a>
      </CardFooter>
    </Card>
  );
}
