import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const usuarios = pgTable("usuarios", {
  id: uuid("id").defaultRandom().primaryKey(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  usuario: text("usuario").notNull().unique(),
  senha: text("senha").notNull(),
  biografia: text("biografia"),
  fotoUrl: text("foto_url"),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
  atualizadoEm: timestamp("atualizado_em").defaultNow().notNull(),
});

export const tokenBlocklist = pgTable("token_blocklist", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: text("token").notNull().unique(),
  revogadoEm: timestamp("revogado_em").defaultNow().notNull(),
});
