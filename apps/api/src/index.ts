import { Hono } from "hono";

import { createAppContext } from "./context";
import { handleGraphQL } from "./graphql";
import { buildOpenApiApp } from "./openapi";
import type { AppBindings } from "./types";

const app = new Hono<AppBindings>();
const authApp = buildOpenApiApp();

app.use("*", async (c, next) => {
  const appContext = await createAppContext(c);
  c.set("appContext", appContext);
  c.set("requestId", appContext.requestId);
  c.set("userId", appContext.userId);
  await next();
});

app.route("/", authApp);

app.all("/graphql", async (c) => {
  const context = c.get("appContext");
  return handleGraphQL(c.req.raw, context);
});

export default app;
