import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { usePatchUsuariosById } from "@/api/elysiaDocumentation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import type { Usuario } from "@/shared/auth/auth-context";
import { useAuth } from "@/shared/auth/use-auth";

const schema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  usuario: z.string().min(1, "Usuário obrigatório"),
  biografia: z.string().max(150).optional(),
  foto: z.string().url("URL inválida").optional().or(z.literal("")),
  senha: z.string().min(6, "Mínimo 6 caracteres").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

interface ProfileEditFormProps {
  user: Usuario;
  onCancel: () => void;
  onSaved: () => void;
}

export function ProfileEditForm({
  user,
  onCancel,
  onSaved,
}: ProfileEditFormProps) {
  const auth = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: user.nome,
      email: user.email,
      usuario: user.usuario,
      biografia: user.biografia ?? "",
      foto: user.foto_url ?? "",
      senha: "",
    },
  });

  const { mutateAsync } = usePatchUsuariosById();

  async function onSubmit(values: FormValues) {
    setApiError(null);
    try {
      const body = {
        nome: values.nome,
        email: values.email,
        usuario: values.usuario,
        ...(values.biografia ? { biografia: values.biografia } : {}),
        ...(values.foto ? { foto: values.foto } : {}),
        ...(values.senha ? { senha: values.senha } : {}),
      };
      const updated = (await mutateAsync({
        id: user.id,
        data: body,
      })) as unknown as Usuario;
      auth.login(auth.token!, updated);
      onSaved();
    } catch (e) {
      if (e instanceof ApiRequestError) {
        setApiError(e.mensagem);
      } else {
        setApiError("Erro inesperado. Tente novamente.");
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
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
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Input type="email" {...field} />
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
                <Input {...field} />
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
              <FormLabel>Biografia</FormLabel>
              <FormControl>
                <Textarea className="resize-none" {...field} />
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
              <FormLabel>URL da foto</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
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
              <FormLabel>Nova senha (opcional)</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Deixe em branco para não alterar"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            className="flex-1"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
