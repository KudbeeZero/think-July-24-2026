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
