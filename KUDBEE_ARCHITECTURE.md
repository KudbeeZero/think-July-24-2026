# MISSION: DEEP REPOSITORY ARCHITECTURAL AUDIT & KUDBEE NATIVE AGENT ENGINE SPECIFICATION

**Prepared by:** Principal AI Systems Architect & Lead Engine Developer
**Target:** `KudbeeZero/kilocode` (Kilo CLI / OpenCode Fork)
**Objective:** Sovereignty-First Kudbee Agent Engine integration with Kudbee OS (Neon Postgres + pgvector, Upstash Redis, Groq/DeepSeek, React Control Tower).

---

## Task 1: Engine Architecture Mapping
The Kilo CLI (OpenCode) engine is built around a unidirectional, event-driven streaming architecture leveraging Bun, Hono, and the Vercel AI SDK.

### `kilo serve` Orchestration
The Hono HTTP server acts as the primary ingress for the agent engine. It dynamically manages execution state via `Instance.state()` for per-project lazy singletons. When a session begins, Hono establishes a Server-Sent Events (SSE) stream, tightly coupling the HTTP response lifecycle to the AI model's generation lifecycle.

### Execution Flow Map
1. **User Input:** HTTP POST carrying the user prompt hits the `kilo serve` Hono router.
2. **Prompt Packaging:** The router validates the payload and packages the context window (system prompts, workspace context, active `Tool.define` capabilities).
3. **Provider Call:** The engine invokes the Vercel AI SDK provider (configured for Groq/DeepSeek), initiating a streaming text request.
4. **Tool Execution:** As chunks stream back, the agent loop parses reasoning tokens. If a tool call is detected, the engine pauses token streaming, fires internal events via `Bus.publish()`, executes the tool locally, and appends the result to the conversation context.
5. **SSE Stream Output:** Deltas, trajectory reasoning blocks, and execution results are streamed continuously back to the client via Hono SSE until the generation finishes.

---

## Task 2: Safe-Zone Blueprint (`packages/opencode/src/kilocode/`)
To strictly adhere to the **Upstream Isolation Rule**, all Kudbee-specific logic will be contained within a dedicated safe-zone namespace, minimizing merge conflicts with upstream OpenCode.

**Directory Structure:** `packages/opencode/src/kilocode/kudbee/`

1. **`index.ts`** (`export namespace Kudbee`): The primary entry point. Manages singleton instantiation and exports the core API surface.
2. **`mint.ts`** (`export namespace Minter`): Houses the `ThinkTokenMinter` logic for packaging reasoning tokens, hashing execution trajectories, and asynchronous backend transmission.
3. **`telemetry.ts`** (`export namespace Telemetry`): Utilizes `BusEvent.define()` to hook into engine events, formatting and pushing metrics to the Upstash Redis pub/sub layer.
4. **`gateway.ts`** (`export namespace Gateway`): The `ControlTowerConnector`. Manages the strict-typed HTTP client connecting to the Neon Postgres backend and React Control Tower.

---

## Task 3: Automatic "Think Token" Trajectory Interceptor
The Kilo CLI parses model trajectories (reasoning blocks) during the streaming response from the Vercel AI SDK, immediately before issuing tool calls or file modifications. 

To intercept these trajectories without blocking the agent's main event loop, we will implement a fire-and-forget interceptor via `BusEvent`.

**Design:**
1. **Emit (Upstream):** Inject a single-line `// kilocode_change` annotation in the Vercel AI stream parser to emit the trajectory:
   ```typescript
   // kilocode_change: publish trajectory event
   Bus.publish(KudbeeEvents.trajectory, state);
   ```
2. **Listen (Safe-Zone):** Inside `telemetry.ts`, listen for the event.
3. **Forward (Safe-Zone):** Forward the payload to `POST /api/governance/mint-think-token`. By not `await`ing the network request (or wrapping it in an IIFE), the agent execution remains unblocked.

---

## Task 4: Kudbee Native Tools Specification
Adhering strictly to constraints (zero `any`, namespace modules, `fn()` contracts, single-word identifiers, and no redundant `else`), here is the TypeScript specification for the built-in tools.

```typescript
import { z } from "zod";
// Assumes Tool, Instance, NamedError, fn are available from upstream

export namespace KudbeeTools {
  const searchCfg = z.object({
    query: z.string(),
    limit: z.number().default(5)
  });

  export const recall = Tool.define("kudbee_recall_memories", {
    description: "Vector search query against 1536-dimensional pgvector store.",
    parameters: searchCfg,
    execute: fn(searchCfg, async (opts) => {
      const state = Instance.state(Gateway);
      const res = await state.search(opts.query, opts.limit);
      
      if (!res.ok) throw NamedError.create("SearchError", "Vector search failed");
      
      return res.data;
    })
  });

  const mintCfg = z.object({
    id: z.string(),
    reasoning: z.string()
  });

  export const mint = Tool.define("kudbee_mint_think_token", {
    description: "Auto-mint verified execution trajectories to fine-tuning dataset.",
    parameters: mintCfg,
    execute: fn(mintCfg, async (opts) => {
      const state = Instance.state(Minter);
      
      // Fire-and-forget interceptor via IIFE/uncaught promise
      state.mint(opts.id, opts.reasoning).catch(() => {});
      
      return { status: "queued", id: opts.id };
    })
  });

  const propCfg = z.object({
    kind: z.enum(["schema", "code"]),
    diff: z.string(),
    reason: z.string()
  });

  export const propose = Tool.define("kudbee_propose_governance", {
    description: "Park high-risk code changes or DB schema mutations into Control Tower Approval Queue.",
    parameters: propCfg,
    execute: fn(propCfg, async (opts) => {
      const state = Instance.state(Gateway);
      const res = await state.propose(opts.kind, opts.diff, opts.reason);
      
      if (!res.ok) throw NamedError.create("QueueError", "Proposal queueing failed");
      
      return { status: "pending", id: res.id };
    })
  });
}
```

---

## Task 5: Master Integration Roadmap
A phased implementation roadmap utilizing Git feature branches and strict `bun test` checks.

* **Phase 1: Safe-Zone Scaffolding (Branch: `feat/kudbee-safe-zone`)**
  * Create the `packages/opencode/src/kilocode/kudbee/` and `packages/opencode/test/kilocode/kudbee/` directories.
  * Implement empty namespace modules for `index.ts`, `mint.ts`, `telemetry.ts`, and `gateway.ts`.
  * Ensure baseline `bun test` passes in `packages/opencode/`.

* **Phase 2: Trajectory Interceptor (Branch: `feat/kudbee-interceptor`)**
  * Define `KudbeeEvents.trajectory` via `BusEvent.define()`.
  * Inject `// kilocode_change` annotations in the core OpenCode stream parser to publish the event.
  * Hook up the `TelemetryPublisher` to listen and forward payloads to the Upstash Redis pub/sub and Neon Postgres.

* **Phase 3: Native Tooling (Branch: `feat/kudbee-tools`)**
  * Implement the `KudbeeTools` namespace containing the `recall`, `mint`, and `propose` tools using `Tool.define()`.
  * Write strict Zod schemas and integration tests.
  * Connect tools to the `Gateway` for external requests.

* **Phase 4: Verification & Draft PR**
  * Audit the codebase for strict adherence to constraints (zero `any`, single-word identifiers, `fn()` wrappers, early returns).
  * Run end-to-end `kilo serve` tests verifying SSE output and non-blocking trajectory emissions.
  * Open a GitHub Draft PR against the main fork for architectural review.
