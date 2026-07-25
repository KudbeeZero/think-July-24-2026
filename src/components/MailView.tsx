import React from 'react';
import { Mail, Crown, Bot, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function MailView() {
  const mailItems = [
    {
      id: 'm1',
      from: 'Mayor',
      role: 'Orchestrator',
      subject: 'Phase 11 Convoy Staged & Ready for Dispatch',
      preview: 'Staged convoy "System Memory Sync, Redis Deprecation & Bugfixes" with 7 beads in review-then-land mode.',
      time: '10 mins ago',
      unread: true,
    },
    {
      id: 'm2',
      from: 'Toast',
      role: 'Polecat Worker',
      subject: 'Investigation: Persistent Black Screen Root Cause Identified',
      preview: 'Found services/agents/worker.ts:343 shouldFail production hook still forcing failure state on root startup.',
      time: '25 mins ago',
      unread: false,
    },
    {
      id: 'm3',
      from: 'refinery',
      role: 'Verification Agent',
      subject: 'Security Remediation Patch Verification Summary',
      preview: 'Remediation patch generated for tar 7.5.19 and postcss 8.5.18. Awaiting lockfile regeneration upon npm install.',
      time: '1 hour ago',
      unread: false,
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="pb-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          <Mail className="w-5 h-5 text-yellow-500" /> Inter-Agent Mail & Dispatch Feed
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          High-priority agent-to-agent communications, Mayor broadcasts, and escalation messages
        </p>
      </div>

      <div className="bg-[#161b22] border border-zinc-800/80 rounded-xl overflow-hidden divide-y divide-zinc-800/60">
        {mailItems.map((item) => (
          <div
            key={item.id}
            className={`p-5 hover:bg-zinc-800/40 transition-colors flex items-start gap-4 cursor-pointer ${
              item.unread ? 'bg-[#1c222b]' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-500 shrink-0">
              {item.from === 'Mayor' ? <Crown className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-200">{item.from}</span>
                  <span className="text-[10px] text-zinc-500 font-mono bg-zinc-800 px-1.5 py-0.5 rounded">
                    {item.role}
                  </span>
                  {item.unread && (
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  )}
                </div>
                <span className="text-xs text-zinc-500">{item.time}</span>
              </div>

              <h4 className="text-xs font-semibold text-zinc-300">{item.subject}</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-mono">{item.preview}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
