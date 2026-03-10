# AGENTS.md

## Purpose

This repo is the working context for `todoabl`, a mobile-first task app built with Ionic React, Cloudflare Workers, D1, Drizzle, GraphQL, Apollo, and Hono.

Use this file as the top-level operating contract for work in this repository.

## Product Priorities

- Separate `startAt`, `reminderAt`, and `deadlineAt`
- Support in-progress work and task updates without forcing subtasks
- Keep infrastructure cheap and Cloudflare-native
- Treat Android geofencing as a native mobile capability
- Enforce strict per-user data isolation on every access path

## Architecture Rules

- Use `pnpm` workspaces
- Keep GraphQL schema SDL under `packages/graphql/schema`
- Use REST for auth and GraphQL for application data
- Use secure device storage for native session tokens
- Renew valid sessions on every authenticated request
- Use generated OpenAPI for REST auth endpoints
- Use generated GraphQL types on both API and mobile

## Quality Rules

- Favor SOLID-style boundaries and single-purpose modules
- Keep file length under 150 lines where practical
- Keep function complexity under 20
- Add tests for domain logic and access-control-sensitive code
- Run lint and format before commits

## Repo Skills

Use the local skills that match the task:

- [architecture-blueprint](.codex/skills/architecture-blueprint/SKILL.md): architecture, schema planning, repo structure
- [worker-api](.codex/skills/worker-api/SKILL.md): Cloudflare Worker, Hono, REST auth, GraphQL server work
- [mobile-ionic](.codex/skills/mobile-ionic/SKILL.md): Ionic React, Apollo Client, forms, Capacitor integration
- [quality-gates](.codex/skills/quality-gates/SKILL.md): ESLint, Prettier, hooks, file-size and complexity enforcement

## Security Rules

- Never query tenant-owned rows by `id` alone
- Always scope tenant-owned rows by authenticated `userId`
- Never trust client-supplied ownership fields
- Keep auth transport and app transport concerns separate

## Current Defaults

- GraphQL schema-first
- Apollo Client normalized cache
- UUIDs for most entities, ULIDs for time-ordered task-like entities
- No Relay pagination for MVP
- Android-first geofencing
