import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { usePostUsuarios } from "@/api/elysiaDocumentation";
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
import { Textarea } from "@/components/ui/textarea";
import { ApiRequestError } from "@/lib/api-client";

const schema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  usuario: z
    .string()
    .min(1, "Usuário obrigatório")
    .regex(/^[a-z0-9_]+$/, "Apenas letras minúsculas, números e _"),
  senha: z.string().min(6, "Mínimo 6 caracteres"),
  biografia: z.string().max(150, "Máximo 150 caracteres").optional(),
  foto: z.string().url("URL inválida").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      email: "",
      usuario: "",
      senha: "",
      biografia: "",
      foto: "",
    },
  });

  const { mutateAsync } = usePostUsuarios();

  async function onSubmit(values: FormValues) {
    setApiError(null);
    try {
      await mutateAsync({ data: values });
      navigate({ to: "/login" });
    } catch (e) {
      if (e instanceof ApiRequestError) {
        if (e.codigo === "USUARIO_JA_CADASTRADO") {
          setApiError("Usuário ou e-mail já cadastrado.");
        } else {
          setApiError(e.mensagem);
        }
      } else {
        setApiError("Erro inesperado. Tente novamente.");
      }
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Criar conta</CardTitle>
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
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu Nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="voce@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="biografia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografia (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Conte um pouco sobre você..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="foto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da foto (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
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
              {form.formState.isSubmitting ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        Já tem conta?&nbsp;
        <a href="/login" className="text-foreground underline">
          Entrar
        </a>
      </CardFooter>
    </Card>
  );
}
