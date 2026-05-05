import { app } from "./app";
import { PORT } from "./env";
import { healthRoutes } from "./modules/health/health.routes";
import { usuariosRoutes } from "./modules/usuarios/usuarios.routes";

app.use(healthRoutes).use(usuariosRoutes).listen(PORT);

export type App = typeof app;
