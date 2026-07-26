import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

export interface ThinkTokenMintEvent {
  id: string;
  agentId?: string;
  agentName?: string;
  amount: number;
  reason: string;
  timestamp: string;
  totalTokensAfterMint: number;
  hash: string;
}

export interface ReconciledSystemState {
  lastUpdated: string;
  thinkTokenVault: {
    totalMinted: number;
    availableBalance: number;
    stakedBalance: number;
    mintEventsCount: number;
  };
  beadsCount: number;
  activeAgentsCount: number;
  activeConvoysCount: number;
  beadsSummary: Array<{ id: string; title: string; status: string; assignee?: string }>;
  agentStatesSummary: Array<{ id: string; name: string; status: string; hooked?: string }>;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const STATE_FILE = path.join(DATA_DIR, 'reconciled_state.json');
const TOKEN_MINTS_FILE = path.join(DATA_DIR, 'think_token_mints.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadReconciledState(): ReconciledSystemState {
  ensureDataDir();
  try {
    if (fs.existsSync(STATE_FILE)) {
      const content = fs.readFileSync(STATE_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('[stateSync] Error reading reconciled state:', err);
  }

  return {
    lastUpdated: new Date().toISOString(),
    thinkTokenVault: {
      totalMinted: 1420500,
      availableBalance: 1250000,
      stakedBalance: 170500,
      mintEventsCount: 14,
    },
    beadsCount: 15,
    activeAgentsCount: 5,
    activeConvoysCount: 2,
    beadsSummary: [],
    agentStatesSummary: [],
  };
}

export function saveReconciledState(state: Partial<ReconciledSystemState>): ReconciledSystemState {
  ensureDataDir();
  const current = loadReconciledState();
  const updated: ReconciledSystemState = {
    ...current,
    ...state,
    lastUpdated: new Date().toISOString(),
  };

  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(updated, null, 2));
  } catch (err) {
    console.error('[stateSync] Error writing reconciled state:', err);
  }

  return updated;
}

export function loadThinkTokenMints(): ThinkTokenMintEvent[] {
  ensureDataDir();
  try {
    if (fs.existsSync(TOKEN_MINTS_FILE)) {
      const content = fs.readFileSync(TOKEN_MINTS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('[stateSync] Error reading think token mints:', err);
  }
  return [
    {
      id: 'mint_init_1',
      agentId: 'refinery',
      agentName: 'refinery',
      amount: 50000,
      reason: 'PR #181 Memory Pipeline Seeding Verification',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      totalTokensAfterMint: 1420500,
      hash: '0x9a8f21c4e7b89d2'
    }
  ];
}

export function mintThinkTokens(
  amount: number,
  reason: string,
  agentId?: string,
  agentName?: string
): ThinkTokenMintEvent {
  ensureDataDir();
  const existingMints = loadThinkTokenMints();
  const currentState = loadReconciledState();

  const newTotal = currentState.thinkTokenVault.totalMinted + amount;
  const newAvailable = currentState.thinkTokenVault.availableBalance + amount;

  const mintEvent: ThinkTokenMintEvent = {
    id: `mint_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    agentId,
    agentName: agentName || 'Mayor Orchestrator',
    amount,
    reason,
    timestamp: new Date().toISOString(),
    totalTokensAfterMint: newTotal,
    hash: `0x${Math.random().toString(16).substring(2, 14)}`
  };

  existingMints.unshift(mintEvent);
  if (existingMints.length > 500) {
    existingMints.pop();
  }

  try {
    fs.writeFileSync(TOKEN_MINTS_FILE, JSON.stringify(existingMints, null, 2));
  } catch (err) {
    console.error('[stateSync] Error writing token mints:', err);
  }

  saveReconciledState({
    thinkTokenVault: {
      ...currentState.thinkTokenVault,
      totalMinted: newTotal,
      availableBalance: newAvailable,
      mintEventsCount: existingMints.length
    }
  });

  return mintEvent;
}

/**
 * Express middleware for state sync reconciliation logging
 */
export function stateSyncMiddleware(req: Request, res: Response, next: NextFunction) {
  // Pass through while making helper methods accessible if needed
  next();
}
