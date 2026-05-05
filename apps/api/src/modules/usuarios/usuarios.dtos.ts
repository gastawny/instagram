import { t } from "elysia";

export const loginBodyDto = t.Object({
  usuario: t.String(),
  senha: t.String(),
});

export const logoutBodyDto = t.Object({
  token: t.Optional(t.String()),
});

export const cadastroBodyDto = t.Object({
  nome: t.String(),
  email: t.String(),
  usuario: t.String(),
  senha: t.String(),
  biografia: t.Optional(t.String()),
  foto: t.Optional(t.String()),
});

export const atualizacaoBodyDto = t.Object({
  nome: t.String(),
  email: t.String(),
  usuario: t.String(),
  biografia: t.Optional(t.String()),
  foto: t.Optional(t.String()),
  senha: t.Optional(t.String()),
});

export const paginacaoQueryDto = t.Object({
  pagina: t.Optional(t.Numeric()),
  limite: t.Optional(t.Numeric()),
});
