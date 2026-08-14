# Implementation Baseline

**Captured:** 2026-08-14
**Scope:** T001–T002

## Toolchain

| Tool         | Baseline      |
| ------------ | ------------- |
| Node.js      | 22.15.0       |
| npm          | 10.9.2        |
| pnpm         | 10.32.1       |
| Docker CLI   | 29.2.1        |
| Supabase CLI | Not installed |

Docker CLI returned its version but warned that the current user could not read
`C:\Users\84812\.docker\config.json`. This is an environment issue and not an
application regression.

## Backend baseline

| Check                         | Result | Existing cause                                                                               |
| ----------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| `pnpm build`                  | Failed | Turbo cannot resolve the workspace because root `package.json` has no `packageManager` field |
| `pnpm lint`                   | Failed | Same Turbo workspace-resolution failure                                                      |
| `pnpm -r test -- --runInBand` | Passed | Six generated NestJS Hello World suites pass; these do not represent domain coverage         |

## Web baseline

| Check           | Result | Existing cause                                                                                        |
| --------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| `npm run build` | Failed | `next/font` cannot download Plus Jakarta Sans from Google Fonts in the restricted/offline environment |
| `npm run lint`  | Failed | 13 errors and 22 warnings existed before implementation                                               |

Important lint categories:

- Unescaped quote characters in JSX.
- Synchronous `setState` inside effects in admin/partner sidebars.
- Explicit `any` in partner and trip-planning components.
- Unused imports/variables.
- Raw image warnings.

These baseline failures must not be attributed to later implementation. They
will be fixed only when their owning task brings the affected code into scope.

## Repository hygiene baseline

- `web/.env.local` exists locally and is ignored.
- No `.env`, `.env.*`, `.pem`, or `.key` file is present in the Git index.
- Generated `.next` and nested backend `node_modules` are ignored.
- Root ignore rules protect generated output and local secrets across packages.
- `.env.example` remains eligible for version control.
- Secret values were not printed or copied during the audit.
