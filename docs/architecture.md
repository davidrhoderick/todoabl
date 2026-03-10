# Architecture Blueprint

## Principles

- Keep infrastructure cheap enough to run comfortably on Cloudflare's low-cost tiers.
- Keep API contracts explicit and schema-driven.
- Keep auth simple and separate from GraphQL.
- Keep tenant isolation strict even before collaboration features exist.
- Model task semantics clearly so the UI does not overload one date field with multiple meanings.

## Scope

### MVP In

- Session-based auth with email and password
- Task lists
- Tasks with reminder, start, and deadline fields
- Task state transitions including in-progress
- Subtasks
- Task updates or progress notes
- Inbox, Today, and Upcoming views
- Location trigger storage and Android-only native geofencing integration later

### MVP Out

- Email verification
- Password reset
- Shared lists or collaborative editing
- Attachments
- Recurring tasks
- Server-side push notifications
- Full GTD review workflows

## Monorepo Design

### `apps/mobile`

Responsibilities:

- Ionic React UI
- Apollo Client
- React Hook Form usage
- Secure storage for native session credentials
- Capacitor native integration for Android notifications and geofencing

Suggested internal structure:

```text
apps/mobile/src/
|-- app/
|-- features/
|   |-- auth/
|   |-- inbox/
|   |-- today/
|   |-- upcoming/
|   |-- lists/
|   `-- tasks/
|-- graphql/
|-- components/
|-- lib/
`-- native/
```

### `apps/api`

Responsibilities:

- Cloudflare Worker request handling
- REST auth endpoints
- OpenAPI generation from route definitions
- GraphQL endpoint
- Context construction from session cookies
- Rate limiting and error translation later if needed

Suggested internal structure:

```text
apps/api/src/
|-- index.ts
|-- routes/
|   `-- auth/
|-- graphql/
|   |-- schema/
|   `-- resolvers/
|-- context/
`-- lib/
```

### `packages/db`

Responsibilities:

- Drizzle schema definitions
- Migrations
- Database query helpers
- Shared table metadata and indexes

### `packages/graphql`

Responsibilities:

- GraphQL SDL split by domain
- Operation documents
- Shared fragments
- Code generation config
- Generated TypeScript types for app and API usage

Suggested internal structure:

```text
packages/graphql/
|-- schema/
|   |-- scalars.graphql
|   |-- viewer.graphql
|   |-- lists.graphql
|   |-- tasks.graphql
|   `-- task-updates.graphql
|-- operations/
|   `-- mobile/
|-- fragments/
`-- codegen/
```

### `packages/auth`

Responsibilities:

- Password hashing
- Session creation and invalidation
- Cookie serialization
- Session lookup helpers

### `packages/core`

Responsibilities:

- Shared domain enums
- Validation helpers
- State transition rules
- Date semantics helpers

## Data Model

### Users

`users`

- `id` `text` primary key, UUID
- `email` `text` unique not null
- `password_hash` `text` not null
- `display_name` `text`
- `created_at` `integer` not null
- `updated_at` `integer` not null

Indexes:

- unique index on `email`

### Sessions

`sessions`

- `id` `text` primary key, UUID
- `user_id` `text` not null
- `expires_at` `integer` not null
- `created_at` `integer` not null

Indexes:

- index on `user_id`
- index on `expires_at`

Session IDs can be opaque UUIDs. No need for JWTs here.

### Lists

`task_lists`

- `id` `text` primary key, UUID
- `user_id` `text` not null
- `name` `text` not null
- `color` `text`
- `archived_at` `integer`
- `created_at` `integer` not null
- `updated_at` `integer` not null

Indexes:

- index on `user_id`
- index on `(user_id, archived_at)`

### Tasks

`tasks`

- `id` `text` primary key, ULID
- `user_id` `text` not null
- `list_id` `text` not null
- `parent_task_id` `text`
- `title` `text` not null
- `notes` `text`
- `state` `text` not null
- `priority` `text`
- `start_at` `integer`
- `reminder_at` `integer`
- `deadline_at` `integer`
- `completed_at` `integer`
- `sort_order` `real`
- `created_at` `integer` not null
- `updated_at` `integer` not null

Indexes:

- index on `user_id`
- index on `(user_id, list_id, state)`
- index on `(user_id, reminder_at)`
- index on `(user_id, deadline_at)`
- index on `(user_id, start_at)`
- index on `(user_id, parent_task_id)`
- index on `(user_id, completed_at)`

Why ULID for tasks:

- Tasks are commonly listed in creation order
- ULIDs preserve rough time ordering while staying non-sequential enough for product needs

### Task Updates

`task_updates`

- `id` `text` primary key, ULID
- `task_id` `text` not null
- `user_id` `text` not null
- `body` `text` not null
- `created_at` `integer` not null

Indexes:

- index on `(user_id, task_id, created_at)`

This supports progress notes without requiring subtasks.

### Task Locations

`task_locations`

- `id` `text` primary key, UUID
- `task_id` `text` not null
- `user_id` `text` not null
- `label` `text`
- `latitude` `real` not null
- `longitude` `real` not null
- `radius_meters` `integer` not null
- `trigger_on` `text` not null
- `created_at` `integer` not null
- `updated_at` `integer` not null

Indexes:

- index on `(user_id, task_id)`

The first version only needs `ENTER` triggers, but the schema can allow future expansion.

## Domain Rules

### Date Semantics

- `startAt`: do not surface as actionable before this time unless explicitly requested
- `reminderAt`: notify or highlight around this time
- `deadlineAt`: the hard due date
- `completedAt`: immutable completion timestamp once done, unless reopened

### State Rules

Allowed states:

- `INBOX`
- `NEXT`
- `IN_PROGRESS`
- `WAITING`
- `SOMEDAY`
- `DONE`
- `CANCELED`

Example transition rules:

- `DONE` sets `completedAt`
- reopening from `DONE` clears `completedAt`
- `CANCELED` is terminal for MVP unless restored explicitly
- `IN_PROGRESS` does not imply a subtask model

State transitions should live in `packages/core` so both API and client use the same rules.

## Auth Design

Use REST endpoints for auth and database-backed sessions.

### Endpoints

#### `POST /auth/register`

Input:

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

Behavior:

- create user
- create session
- return session token and sanitized current user payload

#### `POST /auth/login`

Input:

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

Behavior:

- validate credentials
- create session
- return session token and sanitized current user payload

#### `POST /auth/logout`

Behavior:

- invalidate current session
- revoke the active session token

#### `GET /auth/session`

Behavior:

- validate the current session token
- renew the session expiration when valid
- return current session state and user summary

### Native Session Storage

For the native Ionic app:

- store the opaque session token in secure device storage
- send it on each request using an authorization header
- renew the session expiration on every valid authenticated request

This keeps the Lucia-style sliding session behavior while fitting a native mobile client better than browser cookies.

If a browser client is added later:

- use `HttpOnly`, `Secure`, `SameSite=Lax` cookies for web auth
- keep the same server-side session table and renewal behavior

No JWTs are required for MVP. Server-stored sessions are simpler to revoke and reason about.

### Auth Route Implementation

Use Hono with `@hono/zod-openapi` so the REST auth routes are:

- validated with Zod
- documented from the same source
- exported as an OpenAPI document for Swagger UI or generated clients later

## GraphQL Design

### Philosophy

- Queries should map to screens and UI sections
- Mutation inputs should map to form submissions
- Every exposed object should have an `id`
- Cache normalization happens only in Apollo Client
- Schema files should stay split by domain so server codegen stays maintainable

### Root Types

```graphql
type Query {
  viewer: Viewer!
  list(id: ID!): TaskList
  task(id: ID!): Task
}

type Mutation {
  createList(input: CreateListInput!): CreateListPayload!
  updateList(input: UpdateListInput!): UpdateListPayload!
  createTask(input: CreateTaskInput!): CreateTaskPayload!
  updateTask(input: UpdateTaskInput!): UpdateTaskPayload!
  deleteTask(input: DeleteTaskInput!): DeleteTaskPayload!
  completeTask(input: CompleteTaskInput!): CompleteTaskPayload!
  reopenTask(input: ReopenTaskInput!): ReopenTaskPayload!
  addTaskUpdate(input: AddTaskUpdateInput!): AddTaskUpdatePayload!
}
```

### Viewer

```graphql
type Viewer {
  id: ID!
  email: String!
  lists: [TaskList!]!
  inbox: [Task!]!
  today: [Task!]!
  upcoming: [Task!]!
}
```

This keeps the root authenticated and simple without requiring Relay's full node or connection conventions.

### Core Object Types

```graphql
type TaskList {
  id: ID!
  name: String!
  color: String
  tasks(state: TaskState, includeCompleted: Boolean = false): [Task!]!
}

type Task {
  id: ID!
  listId: ID!
  parentTaskId: ID
  title: String!
  notes: String
  state: TaskState!
  priority: TaskPriority
  startAt: DateTime
  reminderAt: DateTime
  deadlineAt: DateTime
  completedAt: DateTime
  subtasks: [Task!]!
  updates: [TaskUpdate!]!
  locationTrigger: TaskLocation
}

type TaskUpdate {
  id: ID!
  taskId: ID!
  body: String!
  createdAt: DateTime!
}

type TaskLocation {
  id: ID!
  label: String
  latitude: Float!
  longitude: Float!
  radiusMeters: Int!
  triggerOn: LocationTriggerOn!
}
```

### Form Alignment

Each form should submit one mutation.

Examples:

- task create form -> `createTask`
- task edit form -> `updateTask`
- add progress note form -> `addTaskUpdate`

Use GraphQL Code Generator so React Hook Form can rely on generated variable and input types.

Practical rule:

- Use generated mutation variable types as the default form contract
- Add thin view-model adapters only when UI values differ from API values

Likely cases needing adapters:

- date and time pickers
- nullable text fields
- map or location picker values

## GraphQL Codegen Plan

Split codegen by target.

### Server Codegen

Use The Guild server preset against the SDL in `packages/graphql/schema`.

Goal:

- generate resolver signatures
- generate parent and context types
- keep schema ownership in SDL files rather than code-first definitions

Recommended inputs:

- schema: `packages/graphql/schema/**/*.graphql`
- documents: none required for server preset

Recommended outputs:

- generated server types colocated under `packages/graphql/codegen/server/`

### Mobile Codegen

Use operation-based generation for the Ionic app.

Goal:

- generate typed query and mutation results
- generate typed variables
- generate Apollo hooks where practical

Recommended inputs:

- schema: `packages/graphql/schema/**/*.graphql`
- documents: `apps/mobile/src/**/*.{ts,tsx,graphql}`

Recommended outputs:

- generated mobile types and hooks under `apps/mobile/src/graphql/generated.ts`

Implementation note:

If the chosen client preset does not generate Apollo hooks directly, prefer an Apollo-compatible plugin configuration that does. The priority is preserving typed operations and generated hooks for the mobile app.

### Cache Design

Apollo cache rules:

- every object includes `id`
- use `__typename:id` cache keys
- favor mutation payloads that include changed parent objects when useful
- prefer fragment-driven UI composition

No server-side cache layer is needed for MVP.

## Code Quality Rules

Enforce baseline quality through ESLint, Prettier, and commit hooks.

Lint rules to enable:

- `max-lines`: 150
- `complexity`: 20
- `max-lines-per-function`: 150 as a guardrail, while keeping actual functions much smaller
- import ordering and unused import cleanup

Formatting:

- use Prettier for consistent formatting
- run format and lint on every commit through a git hook

Recommended commit-time tooling:

- Husky
- lint-staged

SOLID cannot be fully linted, but package boundaries and small files should reinforce it:

- one clear responsibility per module
- keep domain rules out of transport layers
- prefer dependency boundaries through package APIs rather than ad hoc imports

## Resolver Safety Rules

Every resolver that touches tenant-owned data must:

1. Require an authenticated session
2. Scope the query by authenticated `userId`
3. Avoid returning rows that were not filtered by ownership

Examples:

- `task(id)` must query `where id = ? and user_id = ?`
- `list(id)` must query `where id = ? and user_id = ?`
- nested list tasks must inherit user scoping from the parent or re-check it

Never rely on the client to pass a user ID.

## Android Geofencing Boundary

### Backend Responsibilities

- Store geofence configuration on tasks
- Expose active location-triggered tasks via GraphQL
- Support updates when tasks change, complete, or move out of relevance

### Mobile Responsibilities

- Request location permission on Android
- Sync eligible geofences from the backend
- Register or unregister geofences through Capacitor-native code
- Trigger local notifications when enter events occur

### Eligibility Strategy

Do not sync every geofence indefinitely. Keep a bounded active set.

Initial heuristic:

- only tasks not in `DONE` or `CANCELED`
- only tasks with a location trigger
- prioritize tasks with the nearest `deadlineAt` or `reminderAt`
- cap tracked geofences per device to a practical number

### Implementation Note

There may not be a plugin that fits the exact requirements cleanly. A custom Capacitor plugin for Android geofencing is an acceptable design choice if existing plugins are incomplete or unmaintained.

## Initial Build Order

1. Initialize `pnpm` workspace and package boundaries
2. Scaffold the Cloudflare Worker app
3. Scaffold the Ionic React mobile app
4. Implement Drizzle schema and first migrations
5. Implement REST auth endpoints and session handling
6. Implement GraphQL schema and list/task resolvers
7. Wire Apollo Client and generated GraphQL types in the mobile app
8. Build the task create/edit/detail flows
9. Add task updates
10. Add location trigger UI and Android geofencing integration

## Open Design Choices

Choices to settle before scaffolding:

- whether to generate GraphQL schema from SDL or code-first definitions
- exact password hashing library and Worker compatibility
- whether task ordering uses manual `sort_order` only or a hybrid of date and order

Recommended defaults:

- Hono for Worker routing, with `@hono/zod-openapi` for REST auth routes
- schema-first GraphQL with SDL
- an argon2-compatible Worker-safe solution if practical, otherwise a strong fallback supported by the runtime
- `sort_order` for list ordering with date-derived views calculated separately
