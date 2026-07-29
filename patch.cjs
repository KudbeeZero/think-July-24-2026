const fs = require('fs');
const content = fs.readFileSync('src/data.ts', 'utf8');

// Insert new agent into INITIAL_AGENTS array
const isingAgent = `
  { 
    id: 'a3', 
    name: 'Ising', 
    role: 'QPU Calibrator', 
    status: 'idle', 
    hooked: '19ab84f2...', 
    lastActive: 'standing by', 
    lastSleepTime: '1 min ago',
    currentAction: 'Agentic calibration workflow initialized.', 
    icon: 'cpu',
    model: 'NVIDIA Ising Calibration 1.5 (NVFP4)',
    reasoningTokensSpent: 42100,
    promptTokensSpent: 94000,
    completionTokensSpent: 12000,
    totalTasksCompleted: 9,
    temperature: 0.1,
    skills: ['Vision Language Diagnostics', 'Agentic Tuning', 'QPU Calibration'],
    plugins: ['NVFP4 Quantization Engine', 'DGX Spark Allocator'],
    tags: ['VLM', 'Diagnostics', 'QPU'],
    redisDbIndex: 3,
    inStandbyRoom: true,
    agentsMdSynced: true,
    latency: 8,
    healthScore: 100
  },`;

const updatedContent = content.replace(
  /export const INITIAL_AGENTS: Agent\[\] = \[\n/,
  `export const INITIAL_AGENTS: Agent[] = [\n${isingAgent}`
);

fs.writeFileSync('src/data.ts', updatedContent);
