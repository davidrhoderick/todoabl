import { OpenAPIHono, z } from "@hono/zod-openapi";

import {
  loginRoute,
  logoutRoute,
  registerRoute,
  sessionRoute
} from "./routes/auth";
import type { AppBindings } from "./types";

const authResponse = z.object({
  sessionToken: z.string().uuid(),
  userId: z.string().uuid()
});

export function buildOpenApiApp() {
  const app = new OpenAPIHono<AppBindings>();

  app.openapi(registerRoute, (c) => {
    return c.json({
      sessionToken: crypto.randomUUID(),
      userId: crypto.randomUUID()
    });
  });

  app.openapi(loginRoute, (c) => {
    return c.json(
      authResponse.parse({
        sessionToken: crypto.randomUUID(),
        userId: crypto.randomUUID()
      })
    );
  });

  app.openapi(logoutRoute, (c) => {
    return c.json({}, 200);
  });

  app.openapi(sessionRoute, (c) => {
    const userId = c.get("userId") ?? null;
    return c.json({ authenticated: Boolean(userId), userId });
  });

  app.doc("/openapi.json", {
    info: { title: "todoabl auth api", version: "0.1.0" },
    openapi: "3.1.0"
  });

  return app;
}
