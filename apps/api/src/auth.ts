import {
  renewSessionExpiration,
  shouldRenewSession
} from "@todoabl/auth/session";

export type SessionRecord = {
  expiresAt: number;
  token: string;
  userId: string;
};

export type SessionContext = {
  session: SessionRecord | null;
};

export async function resolveSession(
  header: string | undefined
): Promise<SessionContext> {
  const token = header?.replace(/^Bearer\s+/u, "").trim();
  const expiresAt = Date.now() + 60_000;

  if (!token) {
    return { session: null };
  }

  return {
    session: {
      expiresAt: shouldRenewSession(expiresAt)
        ? renewSessionExpiration(60 * 60 * 24 * 30)
        : expiresAt,
      token,
      userId: "placeholder-user-id"
    }
  };
}
