import * as schema from "@todoabl/db/schema";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import type { Context } from "hono";

import { resolveSession } from "./auth";
import type { AppBindings } from "./types";

export type AppContext = {
  db: DrizzleD1Database<typeof schema>;
  env: Env;
  requestId: string;
  sessionToken: string | null;
  userId: string | null;
};

export async function createAppContext(
  c: Context<AppBindings>
): Promise<AppContext> {
  return createAppContextFromAuthorization(
    c.env,
    c.req.header("authorization") ?? undefined
  );
}

export async function createAppContextFromRequest(
  env: Env,
  request: Request
): Promise<AppContext> {
  return createAppContextFromAuthorization(
    env,
    request.headers.get("authorization") ?? undefined
  );
}

async function createAppContextFromAuthorization(
  env: Env,
  authorization: string | undefined
): Promise<AppContext> {
  const { session } = await resolveSession(env, authorization);
  const db = drizzle(env.DB, { schema });

  return {
    db,
    env,
    requestId: crypto.randomUUID(),
    sessionToken: session?.token ?? null,
    userId: session?.userId ?? null
  };
}
