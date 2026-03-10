---
name: architecture-blueprint
description: Use when planning or changing repo structure, domain models, GraphQL schema boundaries, D1 schema, package layout, or technical blueprints for todoabl.
---

# Architecture Blueprint Skill

Use this skill for structural design work in this repo.

## Focus

- monorepo package boundaries
- D1 schema and indexes
- GraphQL SDL organization
- auth/session architecture
- access control rules

## Repo Rules

- Keep GraphQL SDL under `packages/graphql/schema`
- Keep auth as REST and app data as GraphQL
- Preserve separate `startAt`, `reminderAt`, and `deadlineAt` semantics
- Do not weaken single-owner data isolation for convenience

## Outputs

Prefer updating:

- `README.md`
- `docs/architecture.md`

When design choices affect implementation, record the rule in `AGENTS.md` too.
