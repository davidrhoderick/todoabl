import type { Resolvers } from "@todoabl/graphql/server";
import { GraphQLError, GraphQLScalarType, Kind } from "graphql";

import type { AppContext } from "./context";

type UserRow = {
  email: string;
  id: string;
};

const DateTime = new GraphQLScalarType({
  name: "DateTime",
  serialize: (value) => toIsoString(value),
  parseLiteral: (ast) =>
    ast.kind === Kind.STRING || ast.kind === Kind.INT ? ast.value : null,
  parseValue: (value) => {
    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "number") {
      return new Date(value).toISOString();
    }

    return null;
  }
});

export const graphqlResolvers: Resolvers<AppContext> = {
  DateTime,
  Mutation: {
    createList: async (_parent, _args, context) => {
      requireUserId(context);
      throw notImplementedError();
    },
    createTask: async (_parent, _args, context) => {
      requireUserId(context);
      throw notImplementedError();
    }
  },
  Query: {
    list: async (_parent, _args, context) => {
      requireUserId(context);
      return null;
    },
    task: async (_parent, _args, context) => {
      requireUserId(context);
      return null;
    },
    viewer: async (_parent, _args, context) => {
      const userId = requireUserId(context);
      const user = await context.env.DB.prepare(
        "select id, email from users where id = ?"
      )
        .bind(userId)
        .first<UserRow>();

      if (!user) {
        throw unauthorizedError();
      }

      return {
        email: user.email,
        id: user.id,
        inbox: [],
        lists: [],
        today: [],
        upcoming: []
      };
    }
  }
};

function requireUserId(context: AppContext): string {
  if (!context.userId) {
    throw unauthorizedError();
  }

  return context.userId;
}

function unauthorizedError() {
  return new GraphQLError("Unauthorized", {
    extensions: { code: "UNAUTHENTICATED", http: { status: 401 } }
  });
}

function notImplementedError() {
  return new GraphQLError("Not implemented", {
    extensions: { code: "NOT_IMPLEMENTED", http: { status: 501 } }
  });
}

function toIsoString(value: unknown): string | null {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "number") {
    return new Date(value).toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return null;
}
