export type SessionToken = {
  expiresAt: number;
  token: string;
  userId: string;
};

export function shouldRenewSession(
  expiresAt: number,
  now = Date.now()
): boolean {
  const remainingMs = expiresAt - now;
  return remainingMs < 1000 * 60 * 60 * 24 * 7;
}

export function renewSessionExpiration(
  ttlSeconds: number,
  now = Date.now()
): number {
  return now + ttlSeconds * 1000;
}
