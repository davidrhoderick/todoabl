import { GraphQLError } from "graphql";

import type { AppContext } from "./context";

export function requireUserId(context: AppContext): string {
  if (!context.userId) {
    throw unauthorizedError();
  }

  return context.userId;
}

export function unauthorizedError() {
  return new GraphQLError("Unauthorized", {
    extensions: { code: "UNAUTHENTICATED", http: { status: 401 } }
  });
}

export function notImplementedError() {
  return new GraphQLError("Not implemented", {
    extensions: { code: "NOT_IMPLEMENTED", http: { status: 501 } }
  });
}

export function invalidInputError(message: string) {
  return new GraphQLError(message, {
    extensions: { code: "BAD_USER_INPUT", http: { status: 400 } }
  });
}
