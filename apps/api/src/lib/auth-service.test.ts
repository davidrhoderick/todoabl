import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthError, getSession, loginUser, registerUser } from "./auth-service";
import { createMockD1Database } from "./mock-d1";

describe("auth-service", () => {
  const userId = "11111111-1111-1111-1111-111111111111";
  const sessionId = "22222222-2222-2222-2222-222222222222";

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("registers a user and creates a session", async () => {
    vi.spyOn(crypto, "randomUUID")
      .mockReturnValueOnce(userId)
      .mockReturnValueOnce(sessionId);

    const db = createMockD1Database();
    const result = await registerUser(
      db,
      "TEST@example.com",
      "supersecure123",
      60
    );

    expect(result.userId).toBe(userId);
    expect(result.session.token).toBe(sessionId);

    const session = await getSession(db, sessionId, 60, Date.now());
    expect(session?.userId).toBe(userId);
  });

  it("rejects invalid login credentials", async () => {
    vi.spyOn(crypto, "randomUUID")
      .mockReturnValueOnce(userId)
      .mockReturnValueOnce(sessionId);

    const db = createMockD1Database();
    await registerUser(db, "test@example.com", "supersecure123", 60);

    await expect(
      loginUser(db, "test@example.com", "wrongpass", 60)
    ).rejects.toBeInstanceOf(AuthError);
  });

  it("renews sessions close to expiry", async () => {
    const db = createMockD1Database({
      sessions: [
        { id: sessionId, user_id: userId, expires_at: 20_000, created_at: 1 }
      ],
      users: [
        {
          id: userId,
          email: "test@example.com",
          password_hash: "hash",
          created_at: 1,
          updated_at: 1
        }
      ]
    });

    const now = 10_000;
    const renewed = await getSession(db, sessionId, 60, now);
    expect(renewed?.expiresAt).toBe(now + 60_000);
  });
});
