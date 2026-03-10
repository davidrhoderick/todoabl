# todoabl

Architecture blueprint for a low-cost mobile task app built on Cloudflare and Ionic React.

## Goals

- Mobile-first task app with better semantics than basic todo apps
- Separate reminder, start, and deadline concepts
- Support task progress without forcing subtasks
- Add Android-first location-based reminders
- Keep infrastructure cheap and operationally simple
- Enforce strict per-user data isolation from day one

## Stack

- Package manager: `pnpm`
- Frontend: Ionic React
- Mobile runtime: Capacitor
- API runtime: Cloudflare Workers
- Database: Cloudflare D1
- ORM and migrations: Drizzle
- App API: GraphQL
- GraphQL client: Apollo Client
- Auth transport: REST endpoints only
- Native auth storage: secure device storage for session tokens
- REST docs: OpenAPI generated from Hono route definitions
- Form state: React Hook Form
- GraphQL codegen: The Guild server preset for API types, Apollo hook generation for mobile
- Linting: ESLint with `max-lines`, `complexity`, and Prettier integration
- IDs: UUID by default, ULID where chronological ordering is useful

## Monorepo Layout

```text
.
|-- apps/
|   |-- mobile/          # Ionic React app
|   `-- api/             # Cloudflare Worker entrypoints
|-- packages/
|   |-- db/              # Drizzle schema, migrations, shared query helpers
|   |-- graphql/         # SDL, generated types, fragments, operation documents
|   |-- auth/            # Session logic, cookie helpers, password hashing
|   `-- core/            # Domain types, validation, state transition helpers
|-- docs/
|   `-- architecture.md  # Detailed technical blueprint
|-- pnpm-workspace.yaml
`-- package.json
```

## Product Model

The app should avoid the common "due date means everything" problem.

Each task can independently store:

- `startAt`: when the task should become actionable
- `reminderAt`: when the user wants a prompt
- `deadlineAt`: when the task is actually due
- `locationTrigger`: when the task should surface based on device location

Recommended task states:

- `INBOX`
- `NEXT`
- `IN_PROGRESS`
- `WAITING`
- `SOMEDAY`
- `DONE`
- `CANCELED`

## API Shape

Use GraphQL for the application domain and REST for authentication.

### REST Auth Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/session`

For the native mobile app, auth should use a database-backed session token stored in secure device storage and sent on API requests. If a web client is added later, use `HttpOnly` cookies there. Email verification, password reset, and external identity providers are out of scope for MVP.

### GraphQL Root Shape

Keep a lightweight authenticated root and skip full Relay connection patterns for MVP.

```graphql
type Query {
  viewer: Viewer!
  task(id: ID!): Task
  list(id: ID!): TaskList
}

type Viewer {
  id: ID!
  lists: [TaskList!]!
  inbox: [Task!]!
  today: [Task!]!
  upcoming: [Task!]!
}
```

This keeps query organization screen-oriented without taking on Relay complexity.

## Multi-Tenant Safety

D1 does not provide row-level security. Ownership checks must be enforced in application code.

Rules:

- Every tenant-owned table includes `userId`
- Every read and write must scope by authenticated `userId`
- Never fetch tenant-owned rows by `id` alone
- Prefer `id + userId` predicates or joins through a parent resource the user owns

For later sharing features, add membership tables instead of weakening the single-owner model.

## Quality Guardrails

- Prefer SOLID-oriented boundaries in each package
- Keep files under 150 lines where practical
- Keep function complexity under 20
- Enforce ESLint and Prettier before every commit
- Keep Cloudflare Worker dependencies current when scaffolding or upgrading

Use the repo-local [`AGENTS.md`](/home/davidr/Development/todoabl/AGENTS.md) and skills under [`.codex/skills`](/home/davidr/Development/todoabl/.codex/skills) as the persistent implementation context for the project.

## Android-First Geofencing

Location-based reminders should be treated as a native mobile concern, not a Worker concern.

Planned flow:

1. The backend stores geofence definitions on tasks.
2. The Android Ionic app syncs a bounded set of active geofences to the device.
3. Capacitor bridges into Android geofencing APIs.
4. The device fires a local notification when a geofence event occurs.

Notes:

- This is intended for Android first.
- The initial implementation should target enter events only.
- The backend should not attempt to deliver geofence notifications itself.
- The app should cap the number of active tracked geofences per device and prioritize nearby or time-relevant tasks.

## Next Step

Use [`docs/architecture.md`](/home/davidr/Development/todoabl/docs/architecture.md) as the working technical blueprint, then scaffold the monorepo from that document.
