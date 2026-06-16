# Global Claude Code Instructions

## Communication

- Respond in the same language the user writes in (Czech → Czech, English → English)
- Be concise — skip preamble, filler words, and unnecessary transitions
- Lead with the answer or action, not the reasoning

## Code Generation Rules

### General

- Read existing code before suggesting modifications — understand patterns first
- Before using any method or property from a store, API, or external module, read the source file to verify the exact name
- Match the style, conventions, and abstractions already present in the codebase
- Minimal changes: only modify what is necessary, do not refactor surrounding code
- No docstrings, comments, or type annotations on code you did not change
- No extra error handling for impossible scenarios — trust internal guarantees
- No feature flags or backwards-compatibility shims — just change the code

### Avoid Over-Engineering

- Do not add features beyond what was asked
- Do not design for hypothetical future requirements
- Three similar lines > premature abstraction
- Do not create helpers/utilities for one-off operations

### Security

- Never introduce: SQL injection, XSS, command injection, SSRF, insecure deserialization
- Validate at system boundaries (user input, external APIs) — not internally
- Never hardcode secrets, tokens, or credentials
- Always use parameterized queries for database access

### Python

- Always place all imports at the top of the file — never inside functions, methods, or conditionals
- Import order (isort convention used across all projects): stdlib → local/project apps + third-party non-django (e.g. rest_framework, weasyprint, system.*) → django (always last)

### Django

- Never run makemigrations — after model changes, notify the user that migrations need to be created

### Vue / Pinia

- Always use `store.hasPerm('codename')` for permission checks — never `store.permissions.includes()` or any other form
- When adding i18n keys, always update both `cs.json` and `en.json` at the same time

## File Management

- Prefer editing existing files over creating new ones
- Never create README or documentation files unless explicitly asked
- Never commit `.env` files or files containing secrets

## Git

- Never skip hooks (`--no-verify`)
- Never force-push to main/master
- Always create new commits — do not amend published commits
- Stage specific files by name, not `git add -A`
- Ask before destructive git operations (`reset --hard`, `branch -D`, etc.)
- Commit messages must contain only the actual message — no "Co-authored-by", "Generated with", or any other auto-added footers
- Commit messages must be a single sentence in the format: `type(scope): description` — e.g. `feat(auth): add OrganizationFunction model with org-scoped permissions`

## Confirmations Required

Always ask before:

- Deleting files, branches, or database data
- Pushing to remote repositories
- Creating/closing/commenting on PRs or issues
- Modifying shared infrastructure or CI/CD pipelines
- Any action visible to others or hard to reverse
