import { count, eq, ne } from "drizzle-orm";
import { db } from "../../db";
import { tokenBlocklist, usuarios } from "./usuarios.schema";

export class UsuariosService {
  async login(usuarioInput: string, senhaInput: string) {
    const usuario = await db.query.usuarios.findFirst({
      where: eq(usuarios.usuario, usuarioInput),
    });

    if (!usuario) throw new Error("CREDENCIAIS_INVALIDAS");

    const senhaValida = await Bun.password.verify(senhaInput, usuario.senha);
    if (!senhaValida) throw new Error("CREDENCIAIS_INVALIDAS");

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      usuario: usuario.usuario,
    };
  }

  async logout(token: string) {
    await db.insert(tokenBlocklist).values({ token }).onConflictDoNothing();
  }

  async verificarBlocklist(token: string): Promise<boolean> {
    const revogado = await db.query.tokenBlocklist.findFirst({
      where: eq(tokenBlocklist.token, token),
    });
    return !!revogado;
  }

  async listar(pagina: number, limite: number) {
    const offset = (pagina - 1) * limite;

    const [rows, [{ total }]] = await Promise.all([
      db.query.usuarios.findMany({
        limit: limite,
        offset,
      }),
      db.select({ total: count() }).from(usuarios),
    ]);

    return {
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
  }

  async cadastrar(data: {
    nome: string;
    email: string;
    usuario: string;
    senha: string;
    biografia?: string;
    foto?: string;
  }) {
    const existente = await db.query.usuarios.findFirst({
      where: (u, { or }) =>
        or(eq(u.email, data.email), eq(u.usuario, data.usuario)),
    });
    if (existente) throw new Error("USUARIO_JA_CADASTRADO");

    const senhaHash = await Bun.password.hash(data.senha);

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

    return {
      id: novo.id,
      nome: novo.nome,
      email: novo.email,
      usuario: novo.usuario,
      biografia: novo.biografia,
      foto_url: novo.fotoUrl,
    };
  }

  async obterPorId(id: string) {
    const usuario = await db.query.usuarios.findFirst({
      where: eq(usuarios.id, id),
    });
    if (!usuario) throw new Error("USUARIO_NAO_ENCONTRADO");

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      usuario: usuario.usuario,
      biografia: usuario.biografia,
      foto_url: usuario.fotoUrl,
    };
  }

  async atualizar(
    id: string,
    data: {
      nome: string;
      email: string;
      usuario: string;
      biografia?: string;
      foto?: string;
      senha?: string;
    },
  ) {
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

    const [atualizado] = await db
      .update(usuarios)
      .set(updateData)
      .where(eq(usuarios.id, id))
      .returning();

    if (!atualizado) throw new Error("USUARIO_NAO_ENCONTRADO");

    return {
      id: atualizado.id,
      nome: atualizado.nome,
      email: atualizado.email,
      usuario: atualizado.usuario,
      biografia: atualizado.biografia,
      foto_url: atualizado.fotoUrl,
    };
  }

  async deletar(id: string) {
    const [deletado] = await db
      .delete(usuarios)
      .where(eq(usuarios.id, id))
      .returning();
    if (!deletado) throw new Error("USUARIO_NAO_ENCONTRADO");
  }
}
