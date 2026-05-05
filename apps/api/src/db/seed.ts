import { eq } from "drizzle-orm";
import { usuarios } from "../modules/usuarios/usuarios.schema";
import { db } from ".";

if (process.env.NODE_ENV === "production") {
  throw new Error("Seed must not run in production");
}

const seedUsuarios = [
  {
    nome: "João da Silva",
    email: "joao@example.com",
    usuario: "joao",
    senha: "senha123",
    biografia: "Desenvolvedor apaixonado por tecnologia.",
  },
  {
    nome: "Maria Oliveira",
    email: "maria@example.com",
    usuario: "maria",
    senha: "senha123",
    biografia: "Designer e entusiasta de UX.",
  },
  {
    nome: "Carlos Souza",
    email: "carlos@example.com",
    usuario: "carlos",
    senha: "senha123",
  },
];

for (const data of seedUsuarios) {
  const existente = await db.query.usuarios.findFirst({
    where: eq(usuarios.usuario, data.usuario),
  });

  if (!existente) {
    await db.insert(usuarios).values({
      ...data,
      senha: await Bun.password.hash(data.senha),
    });
    console.log(`Usuário criado: ${data.usuario}`);
  } else {
    console.log(`Usuário já existe: ${data.usuario}`);
  }
}

process.exit(0);
