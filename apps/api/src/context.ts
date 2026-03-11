import type { Context } from "hono";

import { resolveSession } from "./auth";
import type { AppBindings } from "./types";

export type AppContext = {
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

  return {
    env,
    requestId: crypto.randomUUID(),
    sessionToken: session?.token ?? null,
    userId: session?.userId ?? null
  };
}
