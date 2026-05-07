# Instagram

## Pré-requisitos

- [Bun](https://bun.sh) >= 1.0
- [Docker](https://docs.docker.com/get-docker/) e Docker Compose

---

## 1. Instalar dependências

```bash
bun install
```

---

## 2. Subir o banco de dados (Docker)

O arquivo `docker/docker-compose.dev.yml` sobe apenas o PostgreSQL:

```bash
docker compose -f docker/docker-compose.dev.yml up -d
```

Isso inicia o Postgres na porta **5432** com as credenciais:

| variável | valor |
|---|---|
| `POSTGRES_USER` | `user` |
| `POSTGRES_PASSWORD` | `password` |
| `POSTGRES_DB` | `mydb` |

Para parar:

```bash
docker compose -f docker/docker-compose.dev.yml down
```

---

## 3. Configurar variáveis de ambiente

### API (`apps/api`)

```bash
cp apps/api/.env.example apps/api/.env
```

Valores padrão já apontam para o banco local do passo anterior.

### WWW (`apps/www`)

```bash
cp apps/www/.env.example apps/www/.env
```

Ajuste `VITE_API_URL` caso a API rode em porta diferente de `3333`.

---

## 4. Rodar a API

```bash
# Aplicar migrations
bun run db:migrate

# Subir em modo watch
cd apps/api && bun run dev
```

A API fica disponível em `http://localhost:3333`.  
Documentação OpenAPI: `http://localhost:3333/swagger`.

---

## 5. Rodar o frontend (www)

```bash
cd apps/www && bun run dev
```

O frontend fica disponível em `http://localhost:5173`.

---

## 6. Rodar tudo junto (stack completa via Docker)

O `docker/docker-compose.yml` sobe banco + API juntos em containers:

```bash
docker compose -f docker/docker-compose.yml up --build
```

---

## Scripts úteis (raiz do monorepo)

| comando | descrição |
|---|---|
| `bun run dev` | Sobe todos os apps em modo dev |
| `bun run build` | Build de todos os pacotes |
| `bun run typecheck` | Typecheck em todos os pacotes |
| `bun run lint` | Lint com Biome |
| `bun run db:generate` | Gera migrations a partir do schema |
| `bun run db:migrate` | Aplica migrations pendentes |
| `bun run db:studio` | Abre o Drizzle Studio |
| `bun run api:gen` | Regenera hooks Orval a partir do OpenAPI |
