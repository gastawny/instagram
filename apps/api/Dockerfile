FROM oven/bun:1-alpine AS base
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/config/package.json ./packages/config/package.json

RUN bun install --frozen-lockfile

COPY apps/api ./apps/api
COPY packages ./packages

WORKDIR /app/apps/api

EXPOSE 3333
