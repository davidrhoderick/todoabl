---
name: quality-gates
description: Use when setting up or updating linting, formatting, commit hooks, file-size limits, complexity limits, or code quality guardrails for todoabl.
---

# Quality Gates Skill

Use this skill for repo-wide quality tooling.

## Focus

- ESLint
- Prettier
- Husky
- lint-staged
- file size and complexity guardrails

## Rules

- Keep file length under 150 lines where practical
- Keep function complexity under 20
- Enforce lint and format before commit
- Prefer fixes that improve structure rather than silencing rules

## Checks

- Are the limits strict enough to shape behavior without becoming noise?
- Are generated files excluded from the right rules?
- Are hooks fast enough to stay usable?
