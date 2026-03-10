# TODO

## Status

Current baseline:

- `pnpm` workspace scaffolded
- Ionic React mobile app scaffolded
- Cloudflare Worker API scaffolded with Hono
- REST auth routes scaffolded with OpenAPI generation
- GraphQL SDL split by domain
- GraphQL codegen wired for server and mobile
- ESLint, Prettier, Husky, and lint-staged configured
- `pnpm codegen`, `pnpm typecheck`, and `pnpm check` passing

## Key Decisions

- Auth for native mobile uses opaque server-side session tokens in secure storage
- Valid sessions should renew on activity
- REST is used for auth; GraphQL is used for app data
- OpenAPI should be generated from Hono route definitions
- GraphQL remains schema-first with SDL under `packages/graphql/schema`
- Apollo Client cache is client-only and normalized by `id`
- No Relay pagination for MVP
- Android-first geofencing is native mobile behavior, not backend-triggered

## Current Structure

- `apps/api`: Cloudflare Worker, Hono routes, GraphQL entrypoint
- `apps/mobile`: Ionic React app with Apollo Client
- `packages/auth`: session helpers
- `packages/core`: shared domain helpers
- `packages/db`: Drizzle schema
- `packages/graphql`: SDL and codegen config
- `AGENTS.md`: repo operating contract
- `.codex/skills/*`: repo-local skills for common work types

## Next Up

1. Replace placeholder auth logic with real D1-backed users and sessions.
2. Implement Drizzle tables and first migration set for users, sessions, lists, tasks, task updates, and task locations.
3. Build auth REST handlers for register, login, logout, and session lookup with sliding renewal.
4. Replace placeholder GraphQL handler with a real schema execution path.
5. Implement `viewer`, `list`, and `task` resolvers with strict `userId` scoping.
6. Add generated mobile hooks into actual screens instead of the placeholder app shell.
7. Add secure storage integration in the mobile app for session tokens.
8. Build the first list and task create/read flows.

## Known Follow-Ups

- Replace placeholder GraphQL and auth responses with real domain logic
- Add tests for session renewal and tenant isolation
- Decide exact Worker GraphQL execution library
- Add Drizzle migration workflow and local D1 dev setup
- Add Android geofencing implementation after core task flows exist

## Commands

- Install: `pnpm install`
- Generate GraphQL types: `pnpm codegen`
- Typecheck: `pnpm typecheck`
- Lint and format check: `pnpm check`
- API dev server: `pnpm dev:api`
- Mobile dev server: `pnpm dev:mobile`

## Handoff Notes

- Start with [`AGENTS.md`](/home/davidr/Development/todoabl/AGENTS.md) for repo rules.
- Use the local skills in [`.codex/skills`](/home/davidr/Development/todoabl/.codex/skills) when the task matches.
- The generated resolver stubs under `packages/graphql/schema/resolvers` are generated artifacts and should not be treated as hand-written source.
