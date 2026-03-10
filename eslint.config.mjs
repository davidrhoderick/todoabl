import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";
import importPlugin from "eslint-plugin-import";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const typeScriptFiles = ["**/*.ts", "**/*.tsx"];

export default [
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/node_modules/**",
      "apps/mobile/src/graphql/generated.ts",
      "packages/graphql/codegen/server/**",
      "packages/graphql/schema/resolvers/**"
    ]
  },
  js.configs.recommended,
  {
    files: typeScriptFiles,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.serviceworker
      },
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      "@typescript-eslint": tseslint,
      import: importPlugin,
      "simple-import-sort": simpleImportSort
    },
    rules: {
      complexity: ["error", 20],
      "max-lines": [
        "error",
        { max: 150, skipBlankLines: true, skipComments: true }
      ],
      "no-undef": "off",
      "no-unused-vars": "off",
      "simple-import-sort/exports": "error",
      "simple-import-sort/imports": "error",
      "@typescript-eslint/consistent-type-imports": "error"
    }
  }
];
