import { OpenAPIHono, z } from "@hono/zod-openapi";

import {
  AuthError,
  invalidateSession,
  loginUser,
  registerUser
} from "./lib/auth-service";
import {
  loginRoute,
  logoutRoute,
  registerRoute,
  sessionRoute
} from "./routes/auth";
import type { AppBindings } from "./types";

const authResponse = z.object({
  expiresAt: z.number().int().positive(),
  sessionToken: z.string().uuid(),
  userId: z.string().uuid()
});

export function buildOpenApiApp() {
  const app = new OpenAPIHono<AppBindings>();

  app.get("/docs", (c) => {
    return c.html(buildDocsPage());
  });

  app.get("/openapi.json", (c) => {
    return c.json(buildOpenApiDocument(app));
  });

  app.openapi(registerRoute, async (c) => {
    try {
      const payload = c.req.valid("json");
      const result = await registerUser(
        c.env.DB,
        payload.email,
        payload.password,
        Number.parseInt(c.env.SESSION_TTL_SECONDS, 10)
      );
      return c.json(
        authResponse.parse({
          expiresAt: result.session.expiresAt,
          sessionToken: result.session.token,
          userId: result.userId
        }),
        200
      );
    } catch (error) {
      if (error instanceof AuthError) {
        return c.json({ error: error.message }, 409);
      }

      throw error;
    }
  });

  app.openapi(loginRoute, async (c) => {
    try {
      const payload = c.req.valid("json");
      const result = await loginUser(
        c.env.DB,
        payload.email,
        payload.password,
        Number.parseInt(c.env.SESSION_TTL_SECONDS, 10)
      );
      return c.json(
        authResponse.parse({
          expiresAt: result.session.expiresAt,
          sessionToken: result.session.token,
          userId: result.userId
        }),
        200
      );
    } catch (error) {
      if (error instanceof AuthError) {
        return c.json({ error: error.message }, 401);
      }

      throw error;
    }
  });

  app.openapi(logoutRoute, async (c) => {
    const authorization = c.req.header("authorization");
    const token = authorization?.replace(/^Bearer\s+/u, "").trim();

    if (token) {
      await invalidateSession(c.env.DB, token);
    }

    return c.json({}, 200);
  });

  app.openapi(sessionRoute, (c) => {
    const userId = c.get("userId") ?? null;
    return c.json({ authenticated: Boolean(userId), userId });
  });

  return app;
}

function buildOpenApiDocument(app: OpenAPIHono<AppBindings>) {
  const document = app.getOpenAPI31Document({
    info: { title: "todoabl auth api", version: "0.1.0" },
    openapi: "3.1.0"
  });

  return {
    ...document,
    components: {
      ...document.components,
      securitySchemes: {
        ...document.components?.securitySchemes,
        bearerAuth: {
          bearerFormat: "UUID session token",
          scheme: "bearer",
          type: "http"
        }
      }
    }
  };
}

function buildDocsPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>todoabl auth api docs</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
    />
    <style>
      body {
        margin: 0;
        background: #f5f5f0;
      }

      .topbar {
        display: none;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        dom_id: "#swagger-ui",
        docExpansion: "list",
        persistAuthorization: true,
        presets: [SwaggerUIBundle.presets.apis],
        url: "/openapi.json"
      });
    </script>
  </body>
</html>`;
}
