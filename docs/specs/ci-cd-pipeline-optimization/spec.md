# CI/CD Pipeline Optimization Specification

## Goal

Make pull-request validation fast, diagnosable, and deterministic, then deploy
automatically after merges to the development and production branches.

## Required behaviour

- Every pull request must report independent results for backend quality, web
  quality, database migration/RLS validation, service E2E validation, and web
  journey E2E validation.
- A failure must identify the failed phase and expose the relevant logs and
  test artifacts without waiting for an unrelated phase to finish.
- A stalled phase must fail within its own bounded time limit; it must not
  consume the whole workflow timeout.
- Normal PR validation should complete within 15 minutes when dependency and
  image caches are warm. The pipeline should still fail safely when external
  registries are slow or rate limited.
- No PR may merge while any required validation is failed, cancelled, or
  incomplete.
- A merge to `dev` must automatically deploy the validated revision to
  staging, run smoke checks, and report the deployment result.
- A merge to `main` must automatically deploy the validated revision to
  production, run smoke checks, and report the deployment result.
- Failed deployment or smoke checks must preserve diagnostics and clearly mark
  the deployment as failed. Production deployment must only use repository
  secrets and deployment configuration already approved for that environment.

## Non-goals

- Introducing or operating a self-hosted runner.
- Changing application business behaviour.
- Adding or exposing new deployment credentials.

## Acceptance criteria

- CI phases run independently where their inputs permit parallel execution.
- Each E2E service has a phase-specific timeout and cleanup path.
- Database/RLS tests run independently of generated E2E fixture data.
- Dependency, browser, and container build caching are used where safe.
- Failure artifacts include Docker diagnostics and Playwright output where
  applicable.
- Automatic staging and production workflows are branch-scoped and only deploy
  a revision that has passed required validation.
