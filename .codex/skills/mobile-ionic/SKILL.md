---
name: mobile-ionic
description: Use when building or changing the Ionic React mobile app, Apollo Client usage, generated GraphQL hooks, React Hook Form integration, or Capacitor-based Android features for todoabl.
---

# Mobile Ionic Skill

Use this skill for `apps/mobile`.

## Focus

- Ionic React screens and flows
- Apollo Client queries, fragments, and mutations
- generated GraphQL hooks and typed operations
- React Hook Form integration with mutation inputs
- Capacitor integrations for secure storage, notifications, and Android geofencing

## Rules

- Keep screens query-driven and form submissions mutation-driven
- Prefer generated GraphQL types and hooks over hand-written request types
- Store native session tokens in secure device storage
- Treat geofencing as Android-native behavior behind a clean app boundary

## Checks

- Does the screen only request the data it renders?
- Does the form align cleanly to a single mutation input?
- Can Apollo cache update from normalized entities and returned parent objects?
