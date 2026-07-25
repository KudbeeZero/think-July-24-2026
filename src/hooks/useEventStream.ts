import { useEffect, useState, useRef } from 'react';
import { TelemetryLog } from '../types';
import { TelemetryBatcher } from '../utils/telemetryBatcher';

export function useEventStream(onBatchReceived?: (logs: TelemetryLog[]) => void) {
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const batcherRef = useRef<TelemetryBatcher | null>(null);

  useEffect(() => {
    batcherRef.current = new TelemetryBatcher((batch) => {
      setLogs((prev) => [...batch.slice(-100), ...prev].slice(0, 200));
      if (onBatchReceived) onBatchReceived(batch);
    }, 200);

    let eventSource: EventSource | null = null;
    let isMounted = true;

    async function initStream() {
      try {
        // 1. Obtain single-use 30s TTL ticket via POST to /api/auth/stream-ticket
        const ticketRes = await fetch('/api/auth/stream-ticket', { method: 'POST' });
        if (!ticketRes.ok) {
          console.warn('[useEventStream] Ticket acquisition failed, status:', ticketRes.status);
          return;
        }

        const { ticket } = await ticketRes.json();
        if (!isMounted) return;

        // 2. Establish EventSource stream with ?ticket= parameter
        const streamUrl = `/api/telemetry/stream?ticket=${encodeURIComponent(ticket)}`;
        eventSource = new EventSource(streamUrl);

        eventSource.onopen = () => {
          if (isMounted) setConnected(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const data: TelemetryLog = JSON.parse(event.data);
            if (batcherRef.current) {
              batcherRef.current.push(data);
            }
          } catch (e) {
            console.error('[useEventStream] Error parsing SSE payload:', e);
          }
        };

        eventSource.onerror = (err) => {
          console.warn('[useEventStream] EventSource connection error:', err);
          if (isMounted) setConnected(false);
          eventSource?.close();
        };
      } catch (err) {
        console.error('[useEventStream] Lazy-init ticket error:', err);
      }
    }

    initStream();

    return () => {
      isMounted = false;
      if (eventSource) eventSource.close();
      if (batcherRef.current) batcherRef.current.destroy();
    };
  }, []);

  return { connected, logs };
}
