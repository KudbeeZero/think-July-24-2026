# Kilo Cloud Agent Prompting Guidelines

When generating prompts or instructions for the Kilo Cloud Agent, you MUST adhere to the following workflow and constraints:

## 1. Branch & PR Strategy (Cloud Agent Specifics)
- Cloud agents operate on their own branches (unlike terminal agents).
- **Rule**: Instruct the agent to immediately create a **Draft PR** at the start of its session.
- **Commit Frequency & Incremental Jobs**: Break the mission down into individual jobs. Each PR can contain up to **20 to 25 commits**. Emphasize committing and pushing after every completed sub-task so no context or work is lost.

## 2. Checkpoints & Documentation
- The agent must record its progress and findings at specific checkpoints throughout its run.
- It must follow a structured review process to ensure confidence before finalizing the PR.

## 3. CI Pipeline Awareness
- The agent must wait for CI checks to pass.
- **Rule**: If CI is running, instruct the agent to sleep (e.g., for 30 seconds) and re-check until CI is green.

## 4. Resource Constraints & Efficiency
- The environment uses a free tier of Kilo with a **250,000 token context window** and strict **rate limits**.
- **Tool Usage & Rate Limits**: Minimize unnecessary tool execution or polling loops to prevent rate-limit throttling (such as "Too Many Requests: Free model usage limit reached").
- **Batch Operations**: Group file reads/edits and stage multiple related changes in unified execution steps rather than invoking individual atomic tool calls in rapid succession.
- **Leverage Cache**: Once documents or information are in the context cache, it is cheaper to scan or verify. Instruct the agent to utilize cached context effectively.

## 5. Predictability & Pre-computation
- The agent's workflow must be highly predictable (e.g., Step A -> B -> C -> D).
- Instruct the agent to identify and install necessary dependencies upfront to prevent mid-task stalling.
- Eliminate "guessing" phases; give the agent a concrete, deterministic roadmap.

---

# Infrastructure & App Diagnostic Memory

- **CI Lint & Typecheck (RESOLVED in PR #175 & #177)**:
  - All 11 packages clean (`npm run lint` and `npm run typecheck` passing with 0 errors).
  - Empty object types (`{}`) replaced with `object` / `Record<string, unknown>`.
  - Re-exports added for `EngineBus` and `KudbeeEvents` in `@kudbee/opencode`.
- **Redis Connection & Worker Polling Loop Error (RESOLVED in PR #177, EXPANDED in PR #179)**:
  - `getBlockingRedisClient`, `getSlowRedisClient`, and `getRedisClient` updated with `enableOfflineQueue: true`, exponential backoff reconnection strategies, and 10s command timeouts.
  - **CRITICAL DEPLOYMENT ISSUE (Upstash Redis 500k Max Requests Exceeded)**: Heroku worker logs (`app[web.1]` and `app[monitor-worker.1]`) show `ERR max requests limit exceeded. Limit: 500000, Usage: 500000`. Tight `brpop` polling loops without backoff hit Upstash free tier request caps. Workers MUST implement exponential backoff (starting at 2s up to 30s) when `ERR max requests limit exceeded` or timeout occurs, and fallback to in-memory queueing.
- **Frontend Black Screen Issue (RESOLVED in PR #177)**:
  - Wrapped root initialization in top-level `<Suspense>` with loading fallback and `ErrorBoundary` in `apps/web` / `packages/kilo-web-ui`.

---

# Current Kudbee State & Memory (Post PR #181)

**Context**: PR #181 (`feat/kudbee-memory-seeding-and-mcp`) completed (22+ commits, E2E/Unit tests passing). The agent successfully implemented the live memory seeding pipeline (`seed-memory.ts`), `MemoryVault`, semantic recall, and UI components. Next focus is fixing the ingestion server rate limiter crash causing the deployment black screen.
- **Model / Environment**: DeepSeek V4 (1M token context window). High efficiency & context retention.
- **Current Status**: All 12 monorepo packages lint and typecheck green. E2E tests passing.

**Current Codebase State (What is done & fully verified)**:
- ✅ Redis resilience: URL sanitizer (`https` -> `rediss://`), exponential backoff, circuit breaker.
- ✅ Memory Pipeline: `MemoryVault` with storage, context window, and `semanticRecall` (cosine similarity) fully verified with 21 passing tests.
- ✅ Live Memory Seeding: `seed-memory.ts` script created, tests passing.
- ✅ Agent Native Tools & UI: `kudbee_store_memory` integrated, `MemoryPipelineView` desktop/mobile synced.
- ✅ **URGENT DIAGNOSIS (Black Screen on Heroku)**: The rate limiter middleware blocking the root `/` page load is actively being worked on and patched by a Kilo Agent ("Toast").

**Next Scope & Strategic Features (Phase 6: Ingestion Server Hardening & Fail-Open Rate Limiter)**:
1. **Fix Ingestion Server Black Screen**: Agent "Toast" (Polecat) is modifying `services/ingestion/server.js` to add `/` and static assets to the exclusion list and wrapping the Redis rate-limit check in a `try/catch` to fail-open. 
   - **Root Cause Identified by Mayor**: `/api/telemetry/poll` and `/api/telemetry/ingest` share the same `apiLimiter` (100 req/min). Polling burns the budget rapidly, resulting in 429s that cause the frontend components to fail silently. Furthermore, the Redis rate limiter currently has no in-memory fallback and the `MiddlewareGuard` wrapper was created but never wired.
   - **Staged Convoy Fixes**: Fix in-memory rate limiting, wire `MiddlewareGuard`, add in-memory sliding window, and harden rateLimit config.
2. **Ingestion Redis URL Sanitization**: Apply the same `https://` to `rediss://` sanitization logic to `REDIS_RATE_LIMIT_URL` in the ingestion server.
3. **Commit Campaign Discipline**: Agent is actively committing to the current PR pipeline.

---

# Kilo Platform Capabilities & Architecture Context
- **System Architecture**: The system utilizes a "Mayor" (Orchestrator) and "Polecat" agents (workers) acting on "Beads" (tickets) organized into "Convoys" (multi-step tasks).
- **Agent Autonomy**: **Agents have the capability to independently spin up and provision their own REDIS databases** on top of the existing infrastructure as needed. If resource limits or quotas (like the Upstash 500k limit) impede progress, the agent can autonomously build out independent database resources to circumvent these blockers.



---

<!-- AUTO-SYNC-START -->
## Current Active Roster & Work Items (Auto-Synced)
*Last Synced: 2026-07-25T14:33:36.307Z*

### 🤖 Agent Status (3 Total)
- **refinery** (`refinery`) - Status: **WORKING** [Hooked: `3935330d...`]
- **Toast** (`polecat`) - Status: **WORKING** — *Analyzing production hooks and persistent black screen issue...* [Hooked: `27ce33d3...`]
- **Maple** (`polecat`) - Status: **IDLE**

### 📿 Active & Open Beads Breakdown (16 Total)
- **Open (7):** `b1` Remove shouldFail hook in worker.ts [high], `b2` Implement Network Switch tab [medium], `b3` Add drag-and-drop & resize handles [medium], `b13` Add focus trapping & a11y [medium], `b14` Fix PCA reducer file not found [high], `b15` Atomic Redis EVAL for governance [high], `b16` Write 7 pending documentation items [low]
- **In Progress (2):** `b4` Review co... (Assigned: refinery), `b5` Investigate persistent black screen... (Assigned: Toast)
- **In Review (1):** `b6` Provision de... (Assigned: Maple)
- **Closed (6):** `b7`, `b8`, `b9`, `b10`, `b11`, `b12`

### 🚚 Active Convoys
- **Phase 11: Blockers & Persistent UI Hotfixes** (`convoy/phase-11-blockers-and-ui-hotfixes/1cd295...`) [0/5 Tasks Completed]
  - [ ] Diagnose black screen... (@Toast)
  - [ ] Remove shouldFail hook...
  - [ ] Implement Network Sw...
  - [ ] Fix PCA reducer...
  - [ ] Redis EVAL governance...
<!-- AUTO-SYNC-END -->
