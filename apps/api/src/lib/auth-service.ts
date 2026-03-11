import { hashPassword, verifyPassword } from "@todoabl/auth/password";
import {
  renewSessionExpiration,
  shouldRenewSession
} from "@todoabl/auth/session";

type Database = Env["DB"];

type UserRow = {
  id: string;
  password_hash: string;
};

type SessionRow = {
  expires_at: number;
  id: string;
  user_id: string;
};

export type AuthSession = {
  expiresAt: number;
  token: string;
  userId: string;
};

type AuthResult = {
  session: AuthSession;
  userId: string;
};

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

export async function registerUser(
  db: Database,
  email: string,
  password: string,
  sessionTtlSeconds: number
): Promise<AuthResult> {
  const normalizedEmail = normalizeEmail(email);

  if (await findUserByEmail(db, normalizedEmail)) {
    throw new AuthError("Email is already registered.", 409);
  }

  const now = Date.now();
  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  await db
    .prepare(
      "insert into users (id, email, password_hash, created_at, updated_at) values (?, ?, ?, ?, ?)"
    )
    .bind(userId, normalizedEmail, passwordHash, now, now)
    .run();

  const session = await createSession(db, userId, sessionTtlSeconds, now);
  return { session, userId };
}

export async function loginUser(
  db: Database,
  email: string,
  password: string,
  sessionTtlSeconds: number
): Promise<AuthResult> {
  const user = await findUserByEmail(db, normalizeEmail(email));

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw new AuthError("Invalid email or password.", 401);
  }

  const session = await createSession(db, user.id, sessionTtlSeconds);
  return { session, userId: user.id };
}

export async function getSession(
  db: Database,
  token: string,
  sessionTtlSeconds: number,
  now = Date.now()
): Promise<AuthSession | null> {
  const session = await db
    .prepare(
      "select id, user_id, expires_at from sessions where id = ? and expires_at > ?"
    )
    .bind(token, now)
    .first<SessionRow>();

  if (!session) {
    return null;
  }

  const expiresAt = shouldRenewSession(session.expires_at, now)
    ? renewSessionExpiration(sessionTtlSeconds, now)
    : session.expires_at;

  if (expiresAt !== session.expires_at) {
    await db
      .prepare("update sessions set expires_at = ? where id = ?")
      .bind(expiresAt, session.id)
      .run();
  }

  return { expiresAt, token: session.id, userId: session.user_id };
}

export async function invalidateSession(
  db: Database,
  token: string
): Promise<void> {
  await db.prepare("delete from sessions where id = ?").bind(token).run();
}

async function createSession(
  db: Database,
  userId: string,
  sessionTtlSeconds: number,
  now = Date.now()
): Promise<AuthSession> {
  const token = crypto.randomUUID();
  const expiresAt = renewSessionExpiration(sessionTtlSeconds, now);
  await db
    .prepare(
      "insert into sessions (id, user_id, expires_at, created_at) values (?, ?, ?, ?)"
    )
    .bind(token, userId, expiresAt, now)
    .run();

  return { expiresAt, token, userId };
}

async function findUserByEmail(
  db: Database,
  email: string
): Promise<UserRow | null> {
  return (
    (await db
      .prepare("select id, password_hash from users where email = ?")
      .bind(email)
      .first<UserRow>()) ?? null
  );
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
