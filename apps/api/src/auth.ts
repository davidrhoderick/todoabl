import { getSession } from "./lib/auth-service";

export type SessionRecord = {
  expiresAt: number;
  token: string;
  userId: string;
};

export type SessionContext = {
  session: SessionRecord | null;
};

export async function resolveSession(
  env: Env,
  header: string | undefined
): Promise<SessionContext> {
  const token = header?.replace(/^Bearer\s+/u, "").trim();

  if (!token) {
    return { session: null };
  }

  const ttlSeconds = Number.parseInt(env.SESSION_TTL_SECONDS, 10);
  const session = await getSession(env.DB, token, ttlSeconds);

  return { session };
}
