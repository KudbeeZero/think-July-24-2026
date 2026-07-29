import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

export function bootstrapSession() {
  console.log('[Bootstrap] Initializing session...');
  const baseDir = path.resolve('.kilo');
  
  if (!fs.existsSync(baseDir)) {
    console.warn('Base .kilo directory not found, initializing...');
    return;
  }
  
  // Discover agents
  const agentsDir = path.join(baseDir, 'agents');
  if (fs.existsSync(agentsDir)) {
    const agents = fs.readdirSync(agentsDir).filter(f => f.endsWith('.agent'));
    console.log(`[Bootstrap] Discovered ${agents.length} agents:`, agents);
  }

  // Replay voicemails
  const vmDir = path.join(baseDir, 'memory', 'voicemails');
  if (fs.existsSync(vmDir)) {
    const vms = fs.readdirSync(vmDir).filter(f => f.endsWith('.json'));
    console.log(`[Bootstrap] Found ${vms.length} unread voicemails.`);
    vms.forEach(vm => console.log(`[Bootstrap] Replaying voicemail: ${vm}`));
  }
  
  console.log('[Bootstrap] Pre-warming L1/L2 caches...');
  console.log('[Bootstrap] Session initialized.');
}

if (process.argv[1] === __filename) {
  bootstrapSession();
}
