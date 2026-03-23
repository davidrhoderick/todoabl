const SESSION_TOKEN_KEY = "todoabl.sessionToken";

export function getStoredSessionToken() {
  return window.localStorage.getItem(SESSION_TOKEN_KEY);
}

export function setStoredSessionToken(token: string | null) {
  if (token) {
    window.localStorage.setItem(SESSION_TOKEN_KEY, token);
    return;
  }

  window.localStorage.removeItem(SESSION_TOKEN_KEY);
}
