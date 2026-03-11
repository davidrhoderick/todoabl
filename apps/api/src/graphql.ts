import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { startServerAndCreateCloudflareWorkersHandler } from "@as-integrations/cloudflare-workers";
import { typeDefs } from "@todoabl/graphql/server";

import type { AppContext } from "./context";
import { createAppContextFromRequest } from "./context";
import { graphqlResolvers } from "./graphql-resolvers";

const server = new ApolloServer<AppContext>({
  introspection: true,
  plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
  resolvers: graphqlResolvers,
  typeDefs
});

export const handleGraphQL = startServerAndCreateCloudflareWorkersHandler<
  Env,
  AppContext
>(server, {
  context: async ({ env, request }) => createAppContextFromRequest(env, request)
});
