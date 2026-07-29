# ⚡ THINK OS Architecture & Multi-Agent Terminal Runtime Spec

## Executive Overview
The THINK Operating System is a self-bootstrapping, zero-setup, multi-agent AI environment. It operates on a dual-mode communication layer (Local File System for single-agent isolation; Upstash Redis Pub/Sub + Streams for distributed multi-container swarms).

The system continuously records agent execution trajectories, bus events, phone calls, and reasoning states to generate high-density, zero-waste training datasets for custom model fine-tuning (SFT & Direct Preference Optimization / DPO).

---

## 🛠️ System Topology & Tech Stack

- **Monorepo Engine:** Turbo / Bun / Node 22 ESM (type-stripping enabled)
- **Frontend / Control Tower:** React / Vite / Tailwind CSS (12-column DAW Grid Interface)
- **Persistence & Vector Memory:** Neon Postgres (`pgvector` for `think_tokens`), Local Git-backed `.kilo/memory/`
- **Pub/Sub & Distributed Bus:** Upstash Redis (real-time cross-container event bus & streams)
- **Quality Gates:** 46 Verified E2E Integration Checks, Strict 0-`any` TypeScript Policy

---

## 🚀 The 6 Integration Pipelines


┌───────────────────────────────────────────────────────────────────────────┐
│                       SESSION BOOTSTRAP SEQUENCE                          │
└─────────────────────────────────────┬─────────────────────────────────────┘
│
┌────────────────────────────────┼────────────────────────────────┐
▼                                ▼                                ▼
[ 1. State Recovery ]        [ 2. Auto-Discovery ]          [ 3. Voicemail Ingest ]
Reads .kilo/memory/          Globs .kilo/agents/*.agent     Ingests unread P2P
Bus/Calls/Decisions          Registers Fleet Nodes          messages on startup
│                                │                                │
└────────────────────────────────┼────────────────────────────────┘
│
▼
┌───────────────────────────────────────────────────────────────────────────┐
│                       LIVE RUNTIME INTER-BUS LOGIC                         │
└─────────────────────────────────────┬─────────────────────────────────────┘
│
┌─────────────────────────────────┼─────────────────────────────────┐
▼                                 ▼                                 ▼
[ 4. BUS→CACHE Bridge ]     [ 5. Think Token Forge ]      [ 6. Skill Auto-Import ]
12 Event-driven             Snippet recalls stream         Agents auto-export
L1/L2 Cache Flushes         into pgvector table            skills to .kilo/skill/
│                                 │                                 │
└─────────────────────────────────┼─────────────────────────────────┘
│
▼
┌───────────────────────────────────────────────────────────────────────────┐
│                   TOKEN COMPACTION & DPO GENERATION                       │
└─────────────────────────────────────┬─────────────────────────────────────┘
│
┌─────────────────────────────────┴─────────────────────────────────┐
▼                                                                   ▼
[ Semantic Compactor ]                                     [ DPO Preference Engine ]
compactTrajectory() minifies JSON metadata                OPTIMAL (direct call) vs.
& relative timestamps                                      ESCALATED (voicemail/interrupt)

### Pipeline 1: Session Checkpointing (`scripts/session-checkpoint.mjs`)
- Listens to system signals (`SIGINT`, `SIGTERM`, graceful exit).
- Automatically packages current session decision deltas, phone call logs, and bus events.
- Writes state to `.kilo/memory/` and commits directly to Git so any subsequent cloud agent boots up with fresh context without manual setup.

### Pipeline 2: Agent Auto-Registration (`scripts/session-bootstrap.mjs`)
- Dynamically globs `.kilo/agents/*.agent` at runtime.
- Uses strict try/catch fault isolation: malformed agent definition files output warnings to the serial bus without halting the system boot sequence.

### Pipeline 3: Event-Driven BUS→CACHE Bridge (`scripts/bus-to-cache.mjs`)
- Dynamically invalidates L1 (In-Memory) and L2 (Disk) cache layers based on 12 serial bus event topics:
  - `system:health` → Invalidates `agent-state` and dashboard UI caches.
  - `system:interrupt` → Flushes `agent-state`, `dashboard`, and `decisions-recent`.
  - `agent:decide` → Flushes `decisions-recent`.
  - `agent:recall` → Flushes `agent-memories`.
  - `agent:voicemail` / `agent:voicemail:replayed` → Invalidate `agent-state` & `agent-memories`.
  - `session:end` → Triggers full cache flush.

### Pipeline 4: Think Token Forge Live Feed (`scripts/think-forge-bridge.mjs`)
- Listens to `agent:recall` events on the bus.
- Streams recalled knowledge snippets directly into the `think_tokens` Neon Postgres `pgvector` table for real-time LLM context injection.

### Pipeline 5: Skill Auto-Import (`scripts/skill-auto-import.mjs`)
- Terminal agents autonomously export validated execution traces as `.kilo/skill/<agent_id>/` modules containing:
  - `SKILL.md` (Operational instructions)
  - `TRACES.md` (Verified execution paths)
  - `LEARNINGS.json` (Structured parameter mappings)
- Consumed on boot by KILO CLI agents.

### Pipeline 6: Inter-Agent Phone Tree, Voicemail & Emergency Interrupts (`scripts/cloud-agent.mjs`)
- **Direct P2P Calling:** 3000ms response timeout for live agent calls.
- **Voicemail Fallback:** On timeout or target offline status (>45s heartbeat gap), invokes `recordVoicemail()`. Stores payload at `.kilo/memory/voicemails/<agent_id>.json`.
- **Priority Protocol (`--priority=LOW|MEDIUM|HIGH|CRITICAL`):**
  - When priority is `CRITICAL` or `URGENT`:
    1. Fires real-time `agent:interrupt:<target_id>` over Upstash Redis Pub/Sub.
    2. Writes alert to `.kilo/memory/local-calls/interrupts.json`.
    3. Emits `system:interrupt` to the bus, triggering immediate cache flushes.

---

## 🗜️ Zero-Waste Token Compaction & Automated DPO Training Engine

### 1. Semantic Token Compactor (`scripts/think-compact.mjs`)
- Strips verbose JSON schema boilerplate (`callerId`, ISO-8601 formatting, structural redundancy).
- Converts timestamps to relative millisecond deltas (`+12ms`, `+450ms`).
- Reduces token footprint by **35% - 50%** before committing to `.kilo/memory/` or streaming to `pgvector`.

### 2. Bus Event Debouncer (`scripts/bus-debouncer.mjs`)
- Deduplicates repetitive bus queries (e.g., identical heartbeat sweeps or empty voicemail polling loops).
- Ensures only state transitions or actionable deltas reach the serial index.

### 3. Automated DPO Preference Pair Generation
Every interaction automatically generates preference pairs for fine-tuning:
- **`trajectory_quality: OPTIMAL` (Chosen Path):** Direct P2P call successful within 3000ms window.
- **`trajectory_quality: ESCALATED` (Rejected/Fallback Path):** Call timed out $\rightarrow$ written to voicemail $\rightarrow$ emergency interrupt fired.

---

## 💻 CLI Commands Matrix

```bash
# Agent Session Controls
node scripts/session-bootstrap.mjs           # Hydrates state, discoveries & voicemails
node scripts/cloud-agent.mjs start           # Begins live telemetry session
node scripts/cloud-agent.mjs status          # Fleet status & active heartbeat monitor

# Inter-Agent Phone Tree & Priority Calls
node scripts/cloud-agent.mjs call <agent_id> "msg"                    # Standard call
node scripts/cloud-agent.mjs call <agent_id> "msg" --priority=CRITICAL# Emergency call
node scripts/cloud-agent.mjs interrupt <agent_id> "URGENT ACTION"     # Preempt execution
node scripts/cloud-agent.mjs voicemail <agent_id>                    # Read agent voicemails

# Testing & Verification Gates
node scripts/cloud-agent.mjs test            # Runs 2-agent P2P scenario check
node scripts/cloud-agent.mjs test-voicemail  # Runs 7-stage Voicemail & Interrupt suite
node scripts/verify-e2e.mjs                  # Runs full 46-stage E2E test suite
npm run typecheck                            # Enforces 0-any TypeScript validation
```
