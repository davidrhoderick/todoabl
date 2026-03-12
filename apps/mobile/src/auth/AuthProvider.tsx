import { useApolloClient } from "@apollo/client";
import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";
import { startTransition, useEffect, useState } from "react";

import { getSession, login, logout, register } from "./auth-api";
import { getStoredSessionToken, setStoredSessionToken } from "./session-token";

type Credentials = {
  email: string;
  password: string;
};

type AuthContextValue = {
  errorMessage: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login(credentials: Credentials): Promise<void>;
  logout(): Promise<void>;
  register(credentials: Credentials): Promise<void>;
  sessionToken: string | null;
  userId: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const apolloClient = useApolloClient();
  const [isReady, setIsReady] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredSessionToken();

    if (!token) {
      setIsReady(true);
      return;
    }

    void getSession(token)
      .then((session) => {
        if (!session.authenticated || !session.userId) {
          clearSession();
          return;
        }

        setSessionToken(token);
        setUserId(session.userId);
      })
      .catch(() => {
        clearSession();
      })
      .finally(() => setIsReady(true));
  }, []);

  async function handleLogin(credentials: Credentials) {
    setErrorMessage(null);

    try {
      const result = await login(credentials);
      startTransition(() => {
        setStoredSessionToken(result.sessionToken);
        setSessionToken(result.sessionToken);
        setUserId(result.userId);
      });
      await apolloClient.clearStore();
    } catch (error) {
      setErrorMessage(toMessage(error));
      throw error;
    }
  }

  async function handleRegister(credentials: Credentials) {
    setErrorMessage(null);

    try {
      const result = await register(credentials);
      startTransition(() => {
        setStoredSessionToken(result.sessionToken);
        setSessionToken(result.sessionToken);
        setUserId(result.userId);
      });
      await apolloClient.clearStore();
    } catch (error) {
      setErrorMessage(toMessage(error));
      throw error;
    }
  }

  async function handleLogout() {
    const token = sessionToken;
    clearSession();
    await apolloClient.clearStore();

    if (token) {
      await logout(token);
    }
  }

  function clearSession() {
    startTransition(() => {
      setStoredSessionToken(null);
      setSessionToken(null);
      setUserId(null);
      setErrorMessage(null);
    });
  }

  return (
    <AuthContext.Provider
      value={{
        errorMessage,
        isAuthenticated: Boolean(sessionToken && userId),
        isReady,
        login: handleLogin,
        logout: handleLogout,
        register: handleRegister,
        sessionToken,
        userId
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}

function toMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}
