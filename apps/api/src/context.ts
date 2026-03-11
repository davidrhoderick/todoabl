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
  const authorization = c.req.header("authorization");
  const { session } = await resolveSession(c.env, authorization);

  return {
    env: c.env,
    requestId: crypto.randomUUID(),
    sessionToken: session?.token ?? null,
    userId: session?.userId ?? null
  };
}
