---
name: worker-api
description: Use when building or changing the Cloudflare Worker API, Hono routing, OpenAPI generation, REST auth, GraphQL server code, or D1-backed access control for todoabl.
---

# Worker API Skill

Use this skill for backend work in `apps/api` and shared server packages.

## Focus

- Cloudflare Worker request handling
- Hono route composition
- `@hono/zod-openapi` route definitions
- REST auth endpoints
- GraphQL resolvers and context
- D1 access control enforcement

## Rules

- Keep auth endpoints in REST
- Generate OpenAPI from the auth route definitions
- Renew valid sessions on authenticated requests
- Scope every tenant-owned query by authenticated `userId`
- Prefer small route and resolver files

## Checks

- Does the route or resolver enforce ownership?
- Is validation defined close to the transport boundary?
- Is business logic pushed into shared domain or service code?
