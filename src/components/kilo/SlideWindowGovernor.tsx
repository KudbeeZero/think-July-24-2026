import React, { useState, useEffect, useRef } from 'react';
import { Shield, Ban, Activity, Check } from 'lucide-react';

interface RequestItem {
  id: string;
  timestamp: number;
  status: 'accepted' | 'rejected';
}

interface SlideWindowGovernorProps {
  pulseTrigger: number;
  rateLimitStatus: 'nominal' | 'warning' | 'exceeded';
}

export const SlideWindowGovernor: React.FC<SlideWindowGovernorProps> = ({
  pulseTrigger,
  rateLimitStatus
}) => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const lastTriggerRef = useRef(pulseTrigger);

  // Poll-based window decay: requests expire after 10 seconds (10000ms)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setRequests(prev => prev.filter(r => now - r.timestamp < 10000));
    }, 400);

    return () => clearInterval(timer);
  }, []);

  // Capture simulated ingestion triggers
  useEffect(() => {
    if (pulseTrigger !== lastTriggerRef.current) {
      lastTriggerRef.current = pulseTrigger;
      
      const newReq: RequestItem = {
        id: `req-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        status: rateLimitStatus === 'exceeded' ? 'rejected' : 'accepted'
      };

      setRequests(prev => [...prev, newReq].slice(-16)); // Limit queue length for layout
    }
  }, [pulseTrigger, rateLimitStatus]);

  const activeCount = requests.filter(r => r.status === 'accepted').length;
  const capacityPct = Math.min(100, Math.round((activeCount / 10) * 100));

  return (
    <div className="mt-4 bg-black/40 border border-zinc-900 rounded-xl p-3.5 space-y-3 font-mono">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-zinc-400 font-semibold uppercase flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-blue-400" /> Ingress Slide Window (10s)
        </span>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
          capacityPct >= 80 ? 'text-red-400 bg-red-500/10' : 'text-blue-400 bg-blue-500/10'
        }`}>
          {capacityPct}% Capacity
        </span>
      </div>

      {/* Capacity Bar */}
      <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden relative">
        <div 
          className={`h-full rounded-full transition-all duration-300 ${
            capacityPct >= 80 
              ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' 
              : 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
          }`}
          style={{ width: `${capacityPct}%` }}
        />
      </div>

      {/* Sliding Request Grid */}
      <div className="grid grid-cols-8 gap-1.5 pt-1">
        {Array.from({ length: 16 }).map((_, i) => {
          const req = requests[i];
          if (!req) {
            // Render empty slot
            return (
              <div 
                key={i} 
                className="h-7 border border-dashed border-zinc-850 bg-zinc-950/20 rounded flex items-center justify-center text-[8px] text-zinc-700/60"
              >
                SLOT
              </div>
            );
          }

          const isRejected = req.status === 'rejected';

          return (
            <div 
              key={req.id} 
              className={`h-7 rounded border flex flex-col items-center justify-center transition-all animate-pulse relative ${
                isRejected 
                  ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                  : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
              }`}
              title={isRejected ? 'Rate limited request (429 Reject)' : 'Accepted telemetry log'}
            >
              {isRejected ? (
                <Ban className="w-3 h-3 text-red-500 animate-bounce" />
              ) : (
                <Check className="w-3 h-3 text-cyan-400" />
              )}
              <span className="text-[7px] font-bold text-zinc-500 mt-0.5 uppercase tracking-tighter">
                {isRejected ? '429' : 'OK'}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[8px] text-zinc-500 border-t border-zinc-900 pt-2 shrink-0">
        <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-500" /> Sliding Window Queue Governor</span>
        <span>Rejection: {requests.filter(r => r.status === 'rejected').length} dropped</span>
      </div>
    </div>
  );
};
