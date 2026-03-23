# TODO

This file is the source of truth for current repo status, active branches, and the next implementation steps.

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
- D1-backed REST auth implemented with session renewal
- OpenAPI auth docs live at `/docs`
- GraphQL now runs through Apollo Server with the Cloudflare Workers adapter
- Apollo Sandbox landing page available at `/graphql`
- D1-backed `viewer`, `list`, and `task` GraphQL resolvers implemented with `userId` scoping
- Drizzle migrations and shared query helpers added for lists, tasks, and task updates
- `createList` and `createTask` GraphQL mutations implemented and verified against local D1

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

1. Add tests for GraphQL auth and tenant isolation beyond the current DB query coverage.
2. Add generated mobile hooks into actual screens instead of the placeholder app shell.
3. Add secure storage integration in the mobile app for session tokens.
4. Build the first list and task create/read flows end to end in the mobile app.
5. Add task updates and task location persistence/query flows on the API path.
6. Formalize the Drizzle migration workflow in Wrangler tooling and local D1 setup.

## Known Follow-Ups

- Add tests for GraphQL auth and tenant isolation beyond the current DB query coverage
- Formalize the Drizzle migration workflow in Wrangler tooling instead of manual local D1 reset/apply
- Add Android geofencing implementation after core task flows exist

## Branches

- `auth-d1-rest`: clean auth PR branch based on `main`
- `graphql-playground`: Apollo Server and landing page branch based on `auth-d1-rest`
- Next branch from here: capture the GraphQL list/task D1 slice and target `graphql-playground` as the PR base

## Review Workflow

- Check this file first at the start of a session.
- Update this file whenever a branch is pushed, a PR-ready slice is finished, or the next implementation target changes.
- If a PR has review comments, capture the follow-up plan here before making the fixes.

## Commands

- Install: `pnpm install`
- Generate GraphQL types: `pnpm codegen`
- Typecheck: `pnpm typecheck`
- Lint and format check: `pnpm check`
- API dev server: `pnpm dev:api`
- Mobile dev server: `pnpm dev:mobile`

## Handoff Notes

- Start here first: [`TODO.md`](/home/davidr/Development/todoabl/TODO.md).
- Start with [`AGENTS.md`](/home/davidr/Development/todoabl/AGENTS.md) for repo rules.
- Use the local skills in [`.codex/skills`](/home/davidr/Development/todoabl/.codex/skills) when the task matches.
- The generated resolver stubs under `packages/graphql/schema/resolvers` are generated artifacts and should not be treated as hand-written source.
