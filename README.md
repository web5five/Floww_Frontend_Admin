<img width="1672" height="941" alt="ChatGPT Image 2026년 9월 30일 오전 01_56_33" src="https://github.com/user-attachments/assets/25593ea2-ace8-4b5c-b300-8c4941ece10a" />

<div align="center">

# 🌊 Floww Admin

### The control room behind the flow.

**A workspace for monitoring and managing Floww operations.**

[![Status](https://img.shields.io/badge/Status-In%20Progress-4261FF?style=for-the-badge)](#current-state)
[![Admin](https://img.shields.io/badge/Floww-Admin-FFFF5C?style=for-the-badge&labelColor=1E1E1E)](#what-is-floww-admin)

<br />

### 🔗 Live Admin

<!-- Add the deployed admin URL when it is available. -->
**Coming soon** · [Add live URL here](#)

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
**Implementation status: to be confirmed.**

Add a concise summary here describing the current application source, supported runtime, build and test setup, Docker runtime, and CI status.

---

## 🗺️ Roadmap

- [ ] Confirm the admin user roles and access boundaries.
- [ ] Establish the application structure and supported runtime.
- [ ] Pin dependencies and provide a reproducible installation flow.
- [ ] Add placeholder-only environment variable examples.
- [ ] Implement the operational overview and request/order views.
- [ ] Add access control for administrative actions.
- [ ] Add a real build and test workflow.
- [ ] Verify startup and health in the intended environment.
- [ ] Deploy the admin app and add its live URL above.

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
| 🚀 Live admin | **Coming soon** · [Add live URL here](#) |

---

<div align="center">

### Better visibility. Smoother operations. 🌊

</div>
