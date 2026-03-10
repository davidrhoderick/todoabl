import { defineConfig } from "@eddeee888/gcg-typescript-resolver-files";
import type { CodegenConfig } from "@graphql-codegen/cli";

const schema = ["packages/graphql/schema/**/*.graphql"];

const config: CodegenConfig = {
  generates: {
    "apps/mobile/src/graphql/generated.ts": {
      documents: ["apps/mobile/src/**/*.{ts,tsx,graphql}"],
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo"
      ],
      config: {
        reactApolloVersion: 3,
        withHooks: true
      }
    },
    "packages/graphql/codegen/server": defineConfig()
  },
  schema
};

export default config;
