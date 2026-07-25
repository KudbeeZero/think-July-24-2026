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

# Current Kudbee State & Memory (Post PR #179)

**Context**: PR #179 (`feat/kudbee-telemetry-ops-and-mobile`) completed (22 commits, 75/75 tests passing, 36/36 E2E passing). Next focus is Upstash Redis request backoff, worker loop resilience, and 20+ commit campaign.
- **Model / Environment**: DeepSeek V4 (1M token context window). High efficiency & context retention.
- **Current Status**: All 11 monorepo packages lint and typecheck green. Tests passing. Upstash Redis request limit handling required.

**Current Codebase State (What is done & fully verified)**:
- ✅ `packages/opencode/src/kilocode/kudbee/` safe-zone namespace complete with native tools and upstream trajectory interceptor.
- ✅ Agent Dashboard UI & Centralized Zustand Store (`useControlTowerStore.ts`) in `apps/web`.
- ✅ Mobile Zustand Bridge & SQLite Cache in `@kudbee/mobile` (`useMobileTelemetryStore.ts`, `sqliteCache.ts`, `useMobileTelemetrySync.ts`).
- ✅ Sentinel Firewall Engine (`rateLimiter.ts`, `circuitBreaker.ts`, `anomalyEngine.ts`).
- ✅ Heroku postbuild script & lockfile synchronization verified.
- ❌ **URGENT**: Upstash Redis request limit exhaustion (`ERR max requests limit exceeded`). Workers spin infinitely on `brpop` errors without backoff.

**Next Scope & Strategic Features (Phase 4: Upstash Redis Rate-Limit Backoff, Worker Resilience, & Extended PR Commit Campaign)**:
1. **Upstash Redis Request Backoff & Error Handler**: Catch `ERR max requests limit exceeded` in worker loops (`brpop`, polling), trigger an automated 10s–30s backoff pause, and switch worker loops to in-memory local fallback queues.
2. **Sentinel Upstash Adaptive Circuit Breaker**: Auto-trip Sentinel circuit breaker when Redis reports quota exhaustion, silencing outbound polling until quota window resets.
3. **Commit Campaign Discipline**: Keep PR open and append at least 20 incremental, sub-task commits per PR cycle before submitting for final review.

