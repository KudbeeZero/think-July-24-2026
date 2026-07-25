import crypto from 'crypto';

const STREAM_SECRET = process.env.STREAM_SECRET || 'kud_think_stream_secret_default_key_2026';

// Store tickets in memory with timestamp (30s TTL)
const activeTickets = new Map<string, { createdAt: number; used: boolean }>();

export function generateSSETicket(): { ticket: string; ttlSeconds: number } {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(8).toString('hex');
  const payload = `ticket:${timestamp}:${nonce}`;
  const hmac = crypto.createHmac('sha256', STREAM_SECRET).update(payload).digest('hex');
  const ticket = `${payload}.${hmac}`;

  activeTickets.set(ticket, { createdAt: timestamp, used: false });

  // Cleanup expired tickets
  const now = Date.now();
  for (const [t, info] of activeTickets.entries()) {
    if (now - info.createdAt > 30000) {
      activeTickets.delete(t);
    }
  }

  return { ticket, ttlSeconds: 30 };
}

export function validateAndConsumeSSETicket(ticket: string | undefined): boolean {
  if (!ticket) return false;

  const info = activeTickets.get(ticket);
  if (!info) {
    // If ticket isn't found in memory, attempt signature validation for single-node resilience
    try {
      const lastDot = ticket.lastIndexOf('.');
      if (lastDot === -1) return false;

      const payload = ticket.substring(0, lastDot);
      const signature = ticket.substring(lastDot + 1);

      const parts = payload.split(':');
      if (parts.length < 2) return false;
      const timestamp = parseInt(parts[1], 10);

      // Check 30s TTL
      if (Date.now() - timestamp > 30000) return false;

      const expectedHmac = crypto.createHmac('sha256', STREAM_SECRET).update(payload).digest('hex');
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedHmac));
    } catch {
      return false;
    }
  }

  if (info.used) return false; // Single-use ticket
  if (Date.now() - info.createdAt > 30000) {
    activeTickets.delete(ticket);
    return false;
  }

  info.used = true;
  activeTickets.set(ticket, info);
  return true;
}
