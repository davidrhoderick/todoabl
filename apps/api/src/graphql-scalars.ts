import { GraphQLScalarType, Kind } from "graphql";

import { toIsoString } from "./graphql-mappers";

export const DateTime = new GraphQLScalarType({
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
