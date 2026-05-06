import { count, eq, ne } from "drizzle-orm";
import { db } from "../../db";
import { logger } from "../../lib/logger";
import { tokenBlocklist, usuarios } from "./usuarios.schema";

export class UsuariosService {
  async login(usuarioInput: string, senhaInput: string) {
    logger.payload("login", { usuario: usuarioInput, senha: senhaInput });

    logger.dbQuery("login", "usuarios.findFirst", { usuario: usuarioInput });
    const usuario = await db.query.usuarios.findFirst({
      where: eq(usuarios.usuario, usuarioInput),
    });
    logger.dbResult(
      "login",
      usuario ? { encontrado: true, id: usuario.id } : { encontrado: false },
    );

    if (!usuario) throw new Error("CREDENCIAIS_INVALIDAS");

    const senhaValida = await Bun.password.verify(senhaInput, usuario.senha);
    if (!senhaValida) throw new Error("CREDENCIAIS_INVALIDAS");

    const resposta = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      usuario: usuario.usuario,
    };
    logger.response("login", resposta);
    return resposta;
  }

  async logout(token: string) {
    logger.payload("logout", { token });

    logger.dbQuery("logout", "tokenBlocklist.insert", { token });
    await db.insert(tokenBlocklist).values({ token }).onConflictDoNothing();
    logger.dbResult("logout", { inserido: true });
  }

  async verificarBlocklist(token: string): Promise<boolean> {
    logger.payload("verificarBlocklist", { token });

    logger.dbQuery("verificarBlocklist", "tokenBlocklist.findFirst", { token });
    const revogado = await db.query.tokenBlocklist.findFirst({
      where: eq(tokenBlocklist.token, token),
    });
    const resultado = !!revogado;
    logger.dbResult("verificarBlocklist", { revogado: resultado });

    return resultado;
  }

  async listar(pagina: number, limite: number) {
    logger.payload("listar", { pagina, limite });

    logger.dbQuery("listar", "usuarios.findMany + count", { pagina, limite });
    const offset = (pagina - 1) * limite;
    const [rows, [{ total }]] = await Promise.all([
      db.query.usuarios.findMany({ limit: limite, offset }),
      db.select({ total: count() }).from(usuarios),
    ]);
    logger.dbResult("listar", { total: Number(total), registros: rows.length });

    const resposta = {
      total: Number(total),
      pagina,
      limite,
      usuarios: rows.map((u) => ({
        id: u.id,
        nome: u.nome,
        email: u.email,
        usuario: u.usuario,
        biografia: u.biografia,
        foto_url: u.fotoUrl,
      })),
    };
    logger.response("listar", resposta);
    return resposta;
  }

  async cadastrar(data: {
    nome: string;
    email: string;
    usuario: string;
    senha: string;
    biografia?: string;
    foto?: string;
  }) {
    logger.payload("cadastrar", data);

    logger.dbQuery("cadastrar", "usuarios.findFirst (duplicidade)", {
      email: data.email,
      usuario: data.usuario,
    });
    const existente = await db.query.usuarios.findFirst({
      where: (u, { or }) =>
        or(eq(u.email, data.email), eq(u.usuario, data.usuario)),
    });
    logger.dbResult("cadastrar", { duplicado: !!existente });
    if (existente) throw new Error("USUARIO_JA_CADASTRADO");

    const senhaHash = await Bun.password.hash(data.senha);

    logger.dbQuery("cadastrar", "usuarios.insert", {
      nome: data.nome,
      email: data.email,
      usuario: data.usuario,
    });
    const [novo] = await db
      .insert(usuarios)
      .values({
        nome: data.nome,
        email: data.email,
        usuario: data.usuario,
        senha: senhaHash,
        biografia: data.biografia,
        fotoUrl: data.foto,
      })
      .returning();
    logger.dbResult("cadastrar", { id: novo.id, usuario: novo.usuario });

    const resposta = {
      id: novo.id,
      nome: novo.nome,
      email: novo.email,
      usuario: novo.usuario,
      biografia: novo.biografia,
      foto_url: novo.fotoUrl,
    };
    logger.response("cadastrar", resposta);
    return resposta;
  }

  async obterPorId(id: number) {
    logger.payload("obterPorId", { id });

    logger.dbQuery("obterPorId", "usuarios.findFirst", { id });
    const usuario = await db.query.usuarios.findFirst({
      where: eq(usuarios.id, id),
    });
    logger.dbResult(
      "obterPorId",
      usuario ? { encontrado: true, id: usuario.id } : { encontrado: false },
    );

    if (!usuario) throw new Error("USUARIO_NAO_ENCONTRADO");

    const resposta = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      usuario: usuario.usuario,
      biografia: usuario.biografia,
      foto_url: usuario.fotoUrl,
    };
    logger.response("obterPorId", resposta);
    return resposta;
  }

  async atualizar(
    id: number,
    data: {
      nome: string;
      email: string;
      usuario: string;
      biografia?: string;
      foto?: string;
      senha?: string;
    },
  ) {
    logger.payload("atualizar", { id, ...data });

    logger.dbQuery("atualizar", "usuarios.findFirst (duplicidade)", {
      id,
      email: data.email,
      usuario: data.usuario,
    });
    const existente = await db.query.usuarios.findFirst({
      where: (u, { or, and: andFn }) =>
        andFn(
          ne(u.id, id),
          or(
            eq(u.email, data.email),
            eq(u.usuario, data.usuario),
          ) as ReturnType<typeof or>,
        ),
    });
    logger.dbResult("atualizar", { duplicado: !!existente });
    if (existente) throw new Error("USUARIO_JA_CADASTRADO");

    const updateData: Partial<typeof usuarios.$inferInsert> = {
      nome: data.nome,
      email: data.email,
      usuario: data.usuario,
      biografia: data.biografia,
      fotoUrl: data.foto,
      atualizadoEm: new Date(),
    };

    if (data.senha) {
      updateData.senha = await Bun.password.hash(data.senha);
    }

    logger.dbQuery("atualizar", "usuarios.update", {
      id,
      campos: Object.keys(updateData),
    });
    const [atualizado] = await db
      .update(usuarios)
      .set(updateData)
      .where(eq(usuarios.id, id))
      .returning();
    logger.dbResult(
      "atualizar",
      atualizado
        ? { atualizado: true, id: atualizado.id }
        : { atualizado: false },
    );

    if (!atualizado) throw new Error("USUARIO_NAO_ENCONTRADO");

    const resposta = {
      id: atualizado.id,
      nome: atualizado.nome,
      email: atualizado.email,
      usuario: atualizado.usuario,
      biografia: atualizado.biografia,
      foto_url: atualizado.fotoUrl,
    };
    logger.response("atualizar", resposta);
    return resposta;
  }

  async deletar(id: number) {
    logger.payload("deletar", { id });

    logger.dbQuery("deletar", "usuarios.delete", { id });
    const [deletado] = await db
      .delete(usuarios)
      .where(eq(usuarios.id, id))
      .returning();
    logger.dbResult("deletar", { deletado: !!deletado, id: deletado?.id });

    if (!deletado) throw new Error("USUARIO_NAO_ENCONTRADO");
  }
}
