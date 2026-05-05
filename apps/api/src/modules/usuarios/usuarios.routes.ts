import { jwt } from "@elysia/jwt";
import { Elysia } from "elysia";
import { JWT_SECRET } from "../../env";
import {
  atualizacaoBodyDto,
  cadastroBodyDto,
  loginBodyDto,
  paginacaoQueryDto,
} from "./usuarios.dtos";
import { UsuariosService } from "./usuarios.service";

const service = new UsuariosService();

function ok(codigo: string, mensagem: string, dados?: unknown) {
  return {
    status: "sucesso" as const,
    codigo,
    mensagem,
    ...(dados !== undefined && { dados }),
  };
}

function err(codigo: string, mensagem: string) {
  return { status: "erro" as const, codigo, mensagem };
}

function extrairToken(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

const ERRO_HTTP: Record<string, number> = {
  CREDENCIAIS_INVALIDAS: 401,
  TOKEN_INVALIDO: 401,
  TOKEN_NAO_INFORMADO: 400,
  USUARIO_JA_CADASTRADO: 409,
  USUARIO_NAO_ENCONTRADO: 404,
  ACESSO_NEGADO: 403,
};

export const usuariosRoutes = new Elysia({ prefix: "/usuarios" })
  .use(jwt({ name: "jwt", secret: JWT_SECRET, exp: "7d" }))
  .post(
    "/login",
    async ({ body, jwt, set }) => {
      try {
        const usuario = await service.login(body.usuario, body.senha);
        const token = await jwt.sign({
          sub: usuario.id,
          usuario: usuario.usuario,
        });
        return ok("LOGIN_SUCESSO", "Login realizado com sucesso", {
          token,
          usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
        });
      } catch (e) {
        const codigo = (e as Error).message;
        set.status = ERRO_HTTP[codigo] ?? 400;
        return err(codigo, "Credenciais inválidas");
      }
    },
    { body: loginBodyDto },
  )
  .post("/logout", async ({ headers, jwt, set }) => {
    const token = extrairToken(headers.authorization);
    if (!token) {
      set.status = 400;
      return err("TOKEN_NAO_INFORMADO", "Token não informado");
    }
    const payload = await jwt.verify(token);
    if (!payload) {
      set.status = 401;
      return err("TOKEN_INVALIDO", "Token inválido ou expirado");
    }
    await service.logout(token);
    return ok("OPERACAO_SUCESSO", "Logout realizado com sucesso");
  })
  .get(
    "/",
    async ({ query, headers, jwt, set }) => {
      const token = extrairToken(headers.authorization);
      if (!token) {
        set.status = 401;
        return err("TOKEN_INVALIDO", "Token não informado");
      }
      const payload = await jwt.verify(token);
      if (!payload) {
        set.status = 401;
        return err("TOKEN_INVALIDO", "Token inválido ou expirado");
      }
      const revogado = await service.verificarBlocklist(token);
      if (revogado) {
        set.status = 401;
        return err("TOKEN_INVALIDO", "Token inválido ou expirado");
      }

      const pagina = query.pagina ?? 1;
      const limite = query.limite ?? 10;
      const dados = await service.listar(pagina, limite);

      if (dados.total === 0) {
        set.status = 404;
        return err("NENHUM_USUARIO_ENCONTRADO", "Nenhum usuário encontrado");
      }

      return ok("LISTAGEM_SUCESSO", "Usuários listados com sucesso", dados);
    },
    { query: paginacaoQueryDto },
  )
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const dados = await service.cadastrar(body);
        set.status = 201;
        return ok("USUARIO_CRIADO", "Usuário cadastrado com sucesso", dados);
      } catch (e) {
        const codigo = (e as Error).message;
        set.status = ERRO_HTTP[codigo] ?? 400;
        return err(codigo, "Erro ao cadastrar usuário");
      }
    },
    { body: cadastroBodyDto },
  )
  .get("/:id", async ({ params, headers, jwt, set }) => {
    const token = extrairToken(headers.authorization);
    if (!token) {
      set.status = 401;
      return err("TOKEN_INVALIDO", "Token não informado");
    }
    const payload = await jwt.verify(token);
    if (!payload) {
      set.status = 401;
      return err("TOKEN_INVALIDO", "Token inválido ou expirado");
    }
    const revogado = await service.verificarBlocklist(token);
    if (revogado) {
      set.status = 401;
      return err("TOKEN_INVALIDO", "Token inválido ou expirado");
    }

    if (payload.sub !== params.id) {
      set.status = 403;
      return err("ACESSO_NEGADO", "Acesso negado");
    }

    try {
      const dados = await service.obterPorId(params.id);
      return ok("USUARIO_ENCONTRADO", "Dados do usuário recuperados", dados);
    } catch (e) {
      const codigo = (e as Error).message;
      set.status = ERRO_HTTP[codigo] ?? 500;
      return err(codigo, "Usuário não encontrado");
    }
  })
  .patch(
    "/:id",
    async ({ params, body, headers, jwt, set }) => {
      const token = extrairToken(headers.authorization);
      if (!token) {
        set.status = 401;
        return err("TOKEN_INVALIDO", "Token não informado");
      }
      const payload = await jwt.verify(token);
      if (!payload) {
        set.status = 401;
        return err("TOKEN_INVALIDO", "Token inválido ou expirado");
      }
      const revogado = await service.verificarBlocklist(token);
      if (revogado) {
        set.status = 401;
        return err("TOKEN_INVALIDO", "Token inválido ou expirado");
      }

      if (payload.sub !== params.id) {
        set.status = 403;
        return err("ACESSO_NEGADO", "Acesso negado");
      }

      try {
        const dados = await service.atualizar(params.id, body);
        return ok(
          "USUARIO_ATUALIZADO",
          "Usuário atualizado com sucesso",
          dados,
        );
      } catch (e) {
        const codigo = (e as Error).message;
        set.status = ERRO_HTTP[codigo] ?? 400;
        return err(codigo, "Erro ao atualizar usuário");
      }
    },
    { body: atualizacaoBodyDto },
  )
  .delete("/:id", async ({ params, headers, jwt, set }) => {
    const token = extrairToken(headers.authorization);
    if (!token) {
      set.status = 401;
      return err("TOKEN_INVALIDO", "Token não informado");
    }
    const payload = await jwt.verify(token);
    if (!payload) {
      set.status = 401;
      return err("TOKEN_INVALIDO", "Token inválido ou expirado");
    }
    const revogado = await service.verificarBlocklist(token);
    if (revogado) {
      set.status = 401;
      return err("TOKEN_INVALIDO", "Token inválido ou expirado");
    }

    if (payload.sub !== params.id) {
      set.status = 403;
      return err("ACESSO_NEGADO", "Acesso negado");
    }

    try {
      await service.deletar(params.id);
      return ok("OPERACAO_SUCESSO", "Usuário deletado com sucesso");
    } catch (e) {
      const codigo = (e as Error).message;
      set.status = ERRO_HTTP[codigo] ?? 500;
      return err(codigo, "Erro ao deletar usuário");
    }
  });
