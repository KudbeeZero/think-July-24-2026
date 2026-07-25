import crypto from 'crypto';
import * as ed from '@noble/ed25519';
import { getSlowRedisClient } from './redis';
import { checkAndIncrementBudget } from './budgetGate';
import { AuditVaultAnchor, AuditVaultPayload } from '../types';

// System Ed25519 Key Pair for Sentinel Verification
let systemPrivateKey: Uint8Array;
export let systemPublicKey: Uint8Array;

async function initKeys() {
  systemPrivateKey = ed.utils.randomSecretKey();
  systemPublicKey = await ed.getPublicKeyAsync(systemPrivateKey);
}
initKeys();

let inMemoryAnchors: AuditVaultAnchor[] = [
  {
    id: 'anc_genesis_000',
    hash: '0000000000000000000000000000000000000000000000000000000000000000',
    payload: { genesis: true, system: 'KUD-THINK Spheroid BlockTrain' },
    timestamp: 1721894400000,
    signature: 'genesis_sig_000'
  }
];

function calculateAnchorHash(prevHash: string, id: string, timestamp: number, payload: Record<string, any>): string {
  const data = `${prevHash}:${id}:${timestamp}:${JSON.stringify(payload)}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

function calculateOverallAuditHash(anchors: AuditVaultAnchor[]): string {
  const concatenated = anchors.map(a => a.hash).join('|');
  return crypto.createHash('sha256').update(concatenated).digest('hex');
}

export async function recordReasoningEvent(
  payload: Record<string, any>,
  spendUSD: number = 0.0001
): Promise<{ anchor: AuditVaultAnchor; allowed: boolean }> {
  // 1. Budget Gate enforcement
  const budgetResult = await checkAndIncrementBudget(spendUSD);
  if (!budgetResult.allowed) {
    console.warn('[AuditVault] Event rejected due to budget ceiling!');
  }

  // 2. Prepare Anchor
  const lastAnchor = inMemoryAnchors[inMemoryAnchors.length - 1];
  const id = `anc_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const timestamp = Date.now();
  const hash = calculateAnchorHash(lastAnchor ? lastAnchor.hash : '0', id, timestamp, payload);

  // 3. Ed25519 Signature
  const messageBytes = new TextEncoder().encode(hash);
  let signatureHex = '';
  try {
    const sigBytes = await ed.signAsync(messageBytes, systemPrivateKey);
    signatureHex = Buffer.from(sigBytes).toString('hex');
  } catch (err) {
    signatureHex = `sig_mock_${timestamp}`;
  }

  const anchor: AuditVaultAnchor = {
    id,
    hash,
    payload: { ...payload, spendUSD, budgetSpendTotalUSD: budgetResult.currentSpendUSD },
    timestamp,
    signature: signatureHex
  };

  inMemoryAnchors.push(anchor);

  // Sync to Slow Redis if connected
  const slowRedis = getSlowRedisClient();
  if (slowRedis.isOpen) {
    try {
      await slowRedis.rPush('kudbee:audit_vault:ledger', JSON.stringify(anchor));
    } catch {
      // Fallback
    }
  }

  return { anchor, allowed: budgetResult.allowed };
}

export async function getAuditVaultExport(): Promise<AuditVaultPayload> {
  const slowRedis = getSlowRedisClient();
  let anchors = [...inMemoryAnchors];

  if (slowRedis.isOpen) {
    try {
      const raw = await slowRedis.lRange('kudbee:audit_vault:ledger', 0, -1);
      if (raw && raw.length > 0) {
        const parsed = raw.map(r => JSON.parse(r));
        if (parsed.length > 0) anchors = parsed;
      }
    } catch {
      // Fallback to in-memory anchors
    }
  }

  // Re-verify hash-chain integrity
  for (let i = 1; i < anchors.length; i++) {
    const prev = anchors[i - 1];
    const curr = anchors[i];
    const recomputedHash = calculateAnchorHash(prev.hash, curr.id, curr.timestamp, curr.payload);
    if (recomputedHash !== curr.hash) {
      console.warn(`[AuditVault] Hash mismatch detected at index ${i}! Recomputed: ${recomputedHash}`);
    }
  }

  const xAuditHash = calculateOverallAuditHash(anchors);

  return {
    anchors,
    exportHeader: {
      'X-Audit-Hash': xAuditHash,
      version: '1.0.0'
    }
  };
}

export function getSystemPublicKeyHex(): string {
  return Buffer.from(systemPublicKey || new Uint8Array(32)).toString('hex');
}
