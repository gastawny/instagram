CREATE TABLE "token_blocklist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"revogado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "token_blocklist_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "usuarios_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"usuario" text NOT NULL,
	"senha" text NOT NULL,
	"biografia" text,
	"foto_url" text,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_email_unique" UNIQUE("email"),
	CONSTRAINT "usuarios_usuario_unique" UNIQUE("usuario")
);
