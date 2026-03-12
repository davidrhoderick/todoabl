type AuthResponse = {
  expiresAt: number;
  sessionToken: string;
  userId: string;
};

type SessionResponse = {
  authenticated: boolean;
  userId: string | null;
};

type Credentials = {
  email: string;
  password: string;
};

export async function login(credentials: Credentials) {
  return postAuth("/auth/login", credentials);
}

export async function register(credentials: Credentials) {
  return postAuth("/auth/register", credentials);
}

export async function getSession(
  sessionToken: string
): Promise<SessionResponse> {
  const response = await fetch("/auth/session", {
    headers: { authorization: `Bearer ${sessionToken}` }
  });

  if (!response.ok) {
    return { authenticated: false, userId: null };
  }

  return response.json() as Promise<SessionResponse>;
}

export async function logout(sessionToken: string) {
  await fetch("/auth/logout", {
    method: "POST",
    headers: { authorization: `Bearer ${sessionToken}` }
  });
}

async function postAuth(path: string, credentials: Credentials) {
  const response = await fetch(path, {
    body: JSON.stringify(credentials),
    headers: { "content-type": "application/json" },
    method: "POST"
  });

  if (!response.ok) {
    const error = (await response.json()) as { error?: string };
    throw new Error(error.error ?? "Authentication request failed.");
  }

  return response.json() as Promise<AuthResponse>;
}
