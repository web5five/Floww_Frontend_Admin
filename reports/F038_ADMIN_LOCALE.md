# F038 Admin language and settings / 관리자 언어 설정 인계

- **Task / owner:** F038 (`task_7842f5d3b482`), Geondong Kim / dispatched Admin implementation worker. Recorded 2026-09-30 09:55 KST.
- **Source / decisions:** `/Users/geondongkim/Floww/control/F038_ADMIN_LOCALE_TASK.txt`, shared `/Users/geondongkim/Floww/AGENTS.md`, this repository's `AGENTS.md` policy `FLOWW-AGENT-2026-09-29-03`; current Confluence architecture `11960323` v5, superseded architecture `11927569` v12, engineering workflow `12517414` v4, read through Atlassian MCP. No new backend or product authority decision was made.
- **Repository / refs:** `web5five/Floww_Frontend_Admin`, branch `feature/admin-locale-settings`; fetched `origin/main` and base `74fe6f40c263735c7cfb705eccb447e2c88bfbfb`. The prior checkout `1dde6057b9712a79d3b98675940f808f1a5644ca` had an identical tracked tree to that squash commit (`git diff 1dde605 origin/main --exit-code`). Implementation and screenshot commit: `7cb2d2c0fa7f5dc99b2549ab77654c3c43f9b61a`; route metadata correction and browser assertion commit: `c5026754159b49cdfbe8cddad8e084613b4ac04e`. This report is committed separately after those source commits; the final branch head is provided in the worker handoff. No push, PR, merge or deploy by this worker.
- **Documentation:** `PENDING_SYNC` to the authorized team worklog location under Confluence page `12517414`. This dispatch authorized local code/report work and coordinator handoff; it did not authorize a Confluence write. No team acceptance or human review is claimed.

## Implemented / 구현

`src/lib/locale.ts` contains deterministic Korean and English interface text, known status display labels and KST date formatting. `src/components/language-provider.tsx` persists `floww_admin_language` in browser local storage, updates the HTML language, page title and description, and makes a language selector available on login and the authenticated audit header. Login, task list and task detail use it for labels, loading/empty/error states, status display and timestamps. The record's goal, IDs, addresses, hashes, reason codes and exact base-unit strings remain unmodified; filtering sends the original `ACTIVE` or other canonical status code to the API. Unknown status values display the original code rather than an invented translation.

Mobile task and attempt tables now scroll horizontally with a visible hint and keyboard-focusable region. Header, login and detail layout were checked at 1440, 390 and 320 px. `README.md` now links the deployed main release and separates its anonymous HTTP checks from an unprovisioned operator login. `scripts/test-locale.mjs` is a browser regression harness without a new dependency or manifest change. It uses an existing Client Playwright package and installed Chrome via environment paths.

No `src/app/api`, backend, account, schema, payment, signing, session cookie, or dependency manifest was changed. The existing HttpOnly ADMIN session and GET-only audit BFF remain the enforcement path. UI interception in the browser harness is a fixture for rendering only, not an authorization test.

## Checks and evidence / 검증

| Check | Exact command or evidence | Result |
| --- | --- | --- |
| Runtime | `/Users/geondongkim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --version` | `v24.19.0` |
| Static checks | `PATH=/Users/geondongkim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm run typecheck` and `npm run lint` with the same PATH | Both passed on final source |
| Production build | `PATH=/Users/geondongkim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm run build` | Passed on final source, Next 16.3.6; final build generated 8 static pages and all audit routes |
| BFF runtime fixture | `PATH=/Users/geondongkim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm run test:bff` | Passed: origin and body bounds, ADMIN role, redirect refusal, HttpOnly/SameSite/no-store cookie, bypass isolation, GET-only routes |
| Browser UI fixture | `PATH=/Users/geondongkim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH FLOWW_PLAYWRIGHT_MODULE=/Users/geondongkim/orca/workspaces/Floww_Frontend_Client/feature-scaffold-wallet-e2e/node_modules/playwright FLOWW_CHROME_EXECUTABLE='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node scripts/test-locale.mjs` | Passed: Korean/English persistence, title/description, translated sign-in and 401 errors, no session cookie on failed login, canonical `status=ACTIVE`, list/detail navigation, logout return, 1440/390/320 document width, scrollable mobile table |
| Live anonymous HTTP, 2026-09-30 | `curl -sS -o /dev/null -w '%{http_code}'` on `https://floww-admin-demo.vercel.app/login`, `/icon.svg`, `/api/audit/tasks` | `200`, `200`, `401` respectively; deployment owner reported main `74fe6f4` READY. This branch is not deployed. |
| Scope / cleanup | `git diff origin/main -- src/app/api src/lib/server.ts src/lib/validation.ts package.json package-lock.json`; `git diff --check`; `lsof -nP -iTCP:3005 -sTCP:LISTEN` | No API/security/dependency diff or whitespace error; no Admin server left listening on port 3005 |

The final-source build was the fourth production build during this task: the first preceded mobile visual inspection, the second checked a table layout correction, the third checked metadata localization, and the fourth checked a route-navigation metadata correction caught by a stronger browser assertion. All four builds passed. An early lint run failed on synchronous state initialization in an effect; `useSyncExternalStore` replaced it and final lint passed. An early typecheck caught an inferred `string` server snapshot; typing it as `Language` fixed it. The browser harness first tried unavailable cached Chromium 1243 paths; the installed system Chrome completed the checks without downloads. The first mobile screenshot exposed compressed table columns, fixed before final screenshots. A new route assertion found Next restoring the static English tab title after client navigation; the provider now reapplies localized metadata on pathname changes and the final browser run passed. No dependencies were installed and no cache was deleted.

### Screenshots / 화면

- [Korean login, 1440 px](F038_visual/login_ko_1440.png)
- [Korean task list, 1440 px](F038_visual/list_ko_1440.png)
- [Korean task list, 390 px](F038_visual/list_ko_390.png)
- [Korean task detail, 390 px](F038_visual/detail_ko_390.png)

List and detail screenshots use one browser-intercepted synthetic record. They prove local rendering and responsive behavior only. The login screenshot uses the local production server with no backend configured. The browser test confirms the anonymous 401 view separately. None of these images shows a real operator session or persisted live record.

## Remaining / 후속

- Controller: independently review this local branch, rerun required checks on the reviewed final head, and decide any PR, CI, merge and deployment steps. Check Korean and English with a real authorized operator once the deployment owner provisions the account.
- Deployment owner: configure authorized ADMIN credentials and cloud variables without exposing them to this repository or worker; verify deployed login and same-task audit records. A live login and operator acceptance are **pending**, not passed.
- Team documentation owner: sync this sanitized task-level worklog to the authorized Confluence location and read the persisted version before marking it `SYNCED`.

Status: **implemented and locally verified** for locale/UI and preserved BFF fixtures; **not integrated or deployed** for F038; **live anonymous boundary verified**, **authorized operator acceptance pending**.
