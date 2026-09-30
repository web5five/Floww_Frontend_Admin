<img width="1672" height="941" alt="ChatGPT Image 2026년 9월 30일 오전 01_56_33" src="https://github.com/user-attachments/assets/25593ea2-ace8-4b5c-b300-8c4941ece10a" />

<div align="center">

# 🌊 Floww Admin

### The control room behind the flow.

**An authenticated, read-only view of Floww task and account records.**

[![Status](https://img.shields.io/badge/Status-In%20Progress-4261FF?style=for-the-badge)](#current-state)
[![Admin](https://img.shields.io/badge/Floww-Admin-FFFF5C?style=for-the-badge&labelColor=1E1E1E)](#what-is-floww-admin)

<br />

### 🔗 Live Admin

**[floww-admin-demo.vercel.app](https://floww-admin-demo.vercel.app)**

<br />

[Integration Hub](https://github.com/web5five/Floww) · [Server Integration Issue](https://github.com/web5five/Floww_Server/issues/1)

</div>

---

## ✨ What is Floww Admin?

Floww Admin is the operations workspace for the Floww platform.

It is intended to give authorized operators a clear view of platform activity and the tools needed to support the user journey—from request processing through completion and recovery.

> 🔐 Admin access and actions should be limited to authorized operators and handled with care.

---

## 🧭 Admin Responsibilities

| Area | Purpose |
|---|---|
| 📊 **Overview** | Review platform activity and operational status. |
| 📝 **Requests** | Inspect incoming user requests and their current state. |
| 🤝 **Mandates** | Review delegation details and related processing status. |
| 📦 **Orders** | Track quote selection and order progress. |
| 🧰 **Exceptions & recovery** | Find requests that need attention and support their recovery. |
| 👤 **Access control** | Make administrative capabilities available only to authorized users. |

---

## 🚧 Current State

<!-- Update this section to reflect what is implemented in this repository. -->
The audit console has a Next.js 16.3.6 / React 19.3.0 source implementation and pinned npm lockfile. It uses Node 24.19+ and npm 11.17+ within Node 24. It signs in through the existing server `POST /api/v1/admin/auth/signin` endpoint, stores the issued ADMIN JWT in an HttpOnly, same-site BFF cookie, and calls only the new read-only server audit routes. No admin account is created here. The deployment owner must provision an authorized ADMIN account and configure `FLOWW_SERVER_URL` on the server side of this app.

The audit list shows persisted Tasks, with status and user filters. Detail pages show safe mandate, attempt, event, and TaskAccount fields using the same `taskId` and `attemptId` as the client API. Event JSON payloads, approval signatures, raw transactions, and login secrets are excluded. The audit interface has no payment, signing, approval, or mutation action. A language setting on login and the audit header persists Korean or English in this browser. It changes display text and KST dates; API identifiers, addresses, hashes, reason codes, and request values stay canonical.

The local `feature/admin-operations-dashboard` branch adds an operations overview after ADMIN sign-in. It reads unfiltered and status-filtered Task totals through bounded list requests, shows up to five tasks from the first page ordered by creation time, and loads detail, first-page events, and account evidence only for the selected Task. Counts are separate reads, with refresh time and partial failures shown; null evidence is not reported as zero or completed. There is no server projection for global model usage, cost, revenue, or payment totals, so the overview does not claim them. The layout follows the supplied desktop/mobile concept without copying its illustrative people, dates, amounts, or events. [F040 local evidence](reports/F040_ADMIN_DASHBOARD.md) records the fixture and verification limits.

The `origin/main` release at `74fe6f40c263735c7cfb705eccb447e2c88bfbfb` was reported READY at the live URL above on 2026-09-30. A public GET returned HTTP 200 for `/login` and `/icon.svg`; an unauthenticated GET to `/api/audit/tasks` returned HTTP 401. The deployment owner subsequently reported an authorized ADMIN sign-in returning HTTP 200. Its audit request initially returned HTTP 503 on a cold path exceeding the BFF timeout; the deployment owner reported a direct backend HTTP 200 and retry HTTP 200. A reviewed timeout correction is integrated locally in this branch, with a 10.5-second fixture regression, but has not been deployed here. These observations do not establish stable hosted record browsing or operator acceptance. The dashboard and corrected locale work in this branch are local until separately reviewed and deployed.

[F038 local check record and 1440/390 screenshots](reports/F038_ADMIN_LOCALE.md) distinguish the production build, fixture-backed UI checks, live anonymous HTTP responses, and pending operator acceptance.

Local setup: copy `.env.example` to `.env.local` and set the backend URL, then run `npm ci`, `npm run typecheck`, `npm run lint`, and `npm run build`. The backend must have the matching F033C audit routes, a working database, and an ADMIN credential provisioned outside this repo. Deployment owns cloud variables and account creation. BFF checks in `scripts/test-bff.mjs` use a local fixture backend, so they do not establish authorized hosted access.

---

## 🗺️ Roadmap

- [x] Use the existing ADMIN role and ADMIN audience for sign-in and audit access.
- [x] Establish the read-only application structure and Node 24 runtime.
- [x] Pin dependencies and provide a lockfile for reproducible installation.
- [x] Add placeholder-only environment variable examples.
- [x] Implement task, attempt, event, and account inspection.
- [x] Keep all audit requests behind the admin BFF session.
- [x] Verify a clean locked install, standard build, lint, and BFF fixture checks on the earlier Admin release ([F034C controller verification](reports/F034C_BRAND_VECTOR.md)).
- [x] Verify the main release serves login and icon with HTTP 200 and rejects anonymous audit with HTTP 401.
- [x] Deploy the main release and add its live URL above.
- [ ] Independently verify stable authorized operator audit browsing after the deployment-owned timeout fix.
- [ ] Review, integrate, and deploy the dashboard and Korean/English Admin settings branch.

---

## 🧑‍💻 Starting a Component Task

1. Read [`AGENTS.md`](./AGENTS.md) and the latest shared architecture and API contract.
2. Fetch remote refs, preserve teammate work, and open a bounded issue and feature branch.
3. Pin the runtime and dependencies, and make installation reproducible.
4. Add placeholder-only environment examples; never commit secrets.
5. Add a real build/test job and verify startup and health in the intended environment.
6. Link actual results in a PR and a bilingual Confluence handoff.

---

## 🏗️ Architecture Notes

Redis, pgvector, Kafka, Eureka, and Config Server are deferred baseline services. Do not add them just to populate an empty repository. Add only the dependencies required by an implemented admin feature.

Keep secrets and private team sources out of Git.

---

## 🔗 Project Links

| Resource | Link |
|---|---|
| 🌐 Integration hub | [web5five/Floww](https://github.com/web5five/Floww) |
| ⚙️ Server integration issue | [Floww_Server — Issue #1](https://github.com/web5five/Floww_Server/issues/1) |
| 🚀 Live admin | [floww-admin-demo.vercel.app](https://floww-admin-demo.vercel.app) — audit browsing verification pending |

---

<div align="center">

### Better visibility. Smoother operations. 🌊

</div>
