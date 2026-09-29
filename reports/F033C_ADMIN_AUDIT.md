# F033C Admin audit handoff / 관리자 감사 조회 인계

- Task: F033C (`task_c9dfa8ff387e`); owner: Geondong Kim's controller / dispatched Admin worker; recorded 2026-09-30 07:03 KST.
- Decision and source: F033 frontend plan `/Users/geondongkim/Floww/control/F033_FRONTEND_MULTISESSION.md`; primary architecture Confluence page `11960323` v5; workflow page `12517414` v4; repository policy `FLOWW-AGENT-2026-09-29-03`. Pages were read through Atlassian MCP; no Confluence write was authorized in this dispatch. Worklog sync: **PENDING_SYNC**, intended team workflow/worklog under page `12517414`.
- Admin repository: `Floww_Frontend_Admin`, branch `feature/admin-audit-console`, base `74468d783095d7d31dd76d46a01f45c23936af68`, implementation head `d790b089bf3cc613fbd4961b96779bd07f792b12`.
- Server repository: `Floww_Server`, branch `feature/admin-audit-read`, base `a8ffb9b1baa75d1482a12801ad58a18f6f42c88c`, implementation commit `59d409a619b629d8db8c2175a71d0b2a78452d29`, final test head `e5176e639b439a7767146753729250c3ec9e490b`.
- Latest `origin/main` was fetched in both checkouts before implementation and again on 2026-09-30 07:03 KST. It remained at the respective base commit. No push, PR, merge or deploy occurred.

## Implemented / 구현

Admin `package.json`/lockfile, Next configuration, strict TypeScript/lint setup, `.env.example`, `src/app`, `src/components`, `src/lib`, and `scripts/test-bff.mjs` establish a read-only console. Admin sign-in calls the existing server endpoint from a Next route, verifies the ADMIN response shape, sets an HttpOnly/SameSite=Strict cookie, and sends the JWT only to the configured backend. The BFF accepts only local HTTP or remote HTTPS, refuses redirects, limits sign-in JSON to 4 KiB read from the actual stream, validates origin and fixed route inputs, and does not expose the token or optional protected Preview proof to browser JSON. The optional `FLOWW_SERVER_VERCEL_BYPASS_SECRET` is a server-only header for protected Preview; provisioning remains with the deployment owner.

Server `src/main/java/com/floww/server/adminaudit/` adds four GET routes under `/api/v1/admin/audit/tasks`: paginated list with status/user filters, detail with attempts, cursor events, and account summary. `docs/F033C_ADMIN_AUDIT_API.md` gives the route/field contract. These select actual persisted Task, mandate, attempt, event, wallet identity and TaskAccount records with stable client `taskId`/`attemptId`; exact amounts are decimal base-unit strings. The unchanged `JwtAuthFilter` requires both ADMIN role and admin audience. Explicit DTOs omit event payload, typed data, approvals/signatures, raw transactions, password hashes and configuration. No schema, user owner-scoped API, payment or signing behavior changed.

화면은 실제 조회의 로딩·빈 결과·세션 만료·권한 거부·오류를 표시합니다. 작업·시도 ID는 클라이언트와 동일합니다. 쓰기·결제·서명 버튼은 없습니다.

## Checks and evidence / 검증

| Scope | Command / environment | Result |
| --- | --- | --- |
| Server compile | Java 21 `./mvnw -q -DskipTests compile` | Passed |
| Server focused HTTP | `./mvnw -q -Dtest=AdminAuditHttpTest test` | 3 passed: anonymous/client rejection, admin success, no-store, limits, 405, DTO exclusion |
| Server actual DB route | `./mvnw -q -Dtest=AdminAuditDatabaseIntegrationTest test` with disposable native PostgreSQL database `f033c_admin_audit_test` | Passed with real Spring JWT filter and persisted synthetic Task/attempt/account/event rows; secret marker excluded |
| Server full regression | `./mvnw -q -DargLine=-Xmx512m test` with the same disposable DB and bounded JVM | One complete run passed 197/197 (35 suites). A later full rerun after a test-only assertion edit had one unrelated time-sensitive `ExecutionIntegrationTest.finalCallRechecksQuoteAndMandateExpiry` failure; all 197 ran. |
| Server final focused check | `./mvnw -q -DargLine=-Xmx512m -Dtest=AdminAuditHttpTest,AdminAuditDatabaseIntegrationTest,ExecutionIntegrationTest test` | 14/14 passed including all changed audit tests and the previously failing timing test |
| Admin typecheck | Node 24.21.0, `npm run typecheck` | Passed |
| Admin lint | `npm run lint` | Passed without warnings after script cleanup |
| Admin default build | `npm run build` with temporary shared `node_modules` symlink | Failed: Turbopack rejects a symlink outside the project root. This is a test setup limitation, not a passing default build. |
| Admin production build | `./node_modules/.bin/next build --webpack` using the approved temporary shared dependencies | Passed; all audit routes and pages compiled |
| Admin production BFF | `npm run test:bff` against one isolated `next start` and a local fake backend | Passed origin, 4 KiB body including chunked transport, non-admin role, redirect refusal, HttpOnly/strict/no-store, protected Preview header forwarding/isolation, GET-only and input checks; server stopped afterward |
| Repository checks | `git diff --cached --check`, `git diff --check`, forbidden-copy search in Admin source | Passed |

The disposable database ran PostgreSQL 16.13 on localhost; Java was 21.0.11 and Next was 16.3.6 / React 19.3.0. The temporary Admin `node_modules` symlink was removed after checks. `npm install --package-lock-only --ignore-scripts --no-audit --no-fund --engine-strict` generated the lockfile, but **`npm ci` was not run** under the controller's disk instruction. Two early full-suite attempts failed inside the new integration fixture because its wallet address was reused and then because its pagination count assumed an empty database; the fixture now uses a unique address and owner-scoped count. The later single unrelated timer failure resolved in the focused rerun; it was not changed by F033C. The server tests use synthetic data; the BFF test uses a fake upstream. Neither establishes hosted admin access, a live wallet transaction, payment fulfillment or user acceptance.

## Remaining / 후속

- Deployment owner: provision an authorized ADMIN account without exposing credentials, set server-only `FLOWW_SERVER_URL` and optional Preview protection proof, and test the deployed Admin against the intended protected backend. No credential was created or read by this worker.
- Controller: independently review both commits, run a clean locked Admin install/default build in sufficient disk space, verify same-task Admin/client data in browser, and handle PR/CI/integration. Controller owns any push, merge or deploy decision.
- Team documentation owner: sync this sanitized task-level record to the authorized Confluence worklog location and read it back before changing `PENDING_SYNC` to `SYNCED`.
