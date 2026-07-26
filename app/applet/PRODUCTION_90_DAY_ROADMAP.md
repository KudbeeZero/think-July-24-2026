# Kilo Cloud Production 90-Day Roadmap

## Phase 10: Kilo Sliding Right-Side Inspector Drawers (IN PROGRESS)
- **Objective**: Implement Kilo-style sliding right-side drawers for agent inspection, bead detail breakdowns, and convoy status views matching production UI screenshots.
- **Milestones**:
  - [x] Create slide-out drawer wrapper with backdrop blur and smooth slide-in animation from the right.
  - [ ] Implement rich agent breakdown views with event timelines and memory graphs.
  - [ ] Implement bead detail view with Root Cause, Specific Fixes, and Verification steps.

## Phase 11: Blockers & Persistent UI Hotfixes (COMPLETED)
- **Objective**: Fix the ingestion server rate limiter crash and telemetry polling loop.
- **Milestones**:
  - [x] PR #181: Memory seeding & MCP vault integration.
  - [x] PR #182: Fail-open rate limiter patch & Standby Polling Mode integration.
  - [x] PR #183: Parallel sub-agent server runner (local coder, GitHub sync).

## Phase 12: Real-time Telemetry Pipeline (IN PROGRESS)
- **Objective**: Introduce WebSocket streaming for real-time telemetry visualizer components.
- **Milestones**:
  - [x] Establish live polling endpoints `/api/agents/workers/mode` and `/api/think-tokens` with worker daemons.
  - [ ] Migrate telemetry polling to persistent SSE / WebSocket stream.

## Phase 13: Full Production Resilience (SQLite & WS)
- **Objective**: Move off memory-only fallback into persistent edge nodes (SQLite).
- **Milestones**:
  - [ ] Integrate local SQLite cache for token vault and agent memory.
  - [ ] Harden Redis retry loops with exponential backoff and circuit breaker fallback to SQLite.
