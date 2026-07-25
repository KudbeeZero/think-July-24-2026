import React, { useState } from 'react';
import { 
  Mail, 
  Crown, 
  Bot, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Check, 
  Sparkles, 
  Terminal, 
  ArrowRight, 
  User,
  Inbox,
  AlertCircle
} from 'lucide-react';
import { MailItem } from '../types';

interface MailViewProps {
  mailItems?: MailItem[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onSimulateAlert?: () => void;
}

export function MailView({ 
  mailItems = [], 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onSimulateAlert 
}: MailViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(mailItems[0]?.id || null);

  const selectedMail = mailItems.find(m => m.id === selectedId) || mailItems[0];

  const handleSelectMail = (item: MailItem) => {
    setSelectedId(item.id);
    if (item.unread && onMarkAsRead) {
      onMarkAsRead(item.id);
    }
  };

  const getSeverityStyles = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-500/10 border-red-500/30 text-red-400',
          badge: 'bg-red-500/20 text-red-300 border-red-500/40',
          icon: <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
        };
      case 'escalation':
        return {
          bg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
          badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          icon: <AlertCircle className="w-4 h-4 text-orange-400 shrink-0" />
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
          badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
          icon: <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
        };
      default:
        return {
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          icon: <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
        };
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-28 lg:pb-8 h-full flex flex-col">
      {/* Mail View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <Mail className="w-5 h-5 text-yellow-500" /> Inter-Agent Mail &amp; Dispatch Feed
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            High-priority inter-agent communications, system-wide orchestrations, and critical exceptions
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {onMarkAllAsRead && (
            <button
              onClick={onMarkAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 text-xs font-medium transition-all"
            >
              <Check className="w-3.5 h-3.5" /> Mark All as Read
            </button>
          )}

          {onSimulateAlert && (
            <button
              onClick={onSimulateAlert}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-zinc-950 text-xs font-semibold transition-all shadow-lg shadow-yellow-500/10 animate-pulse"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" /> Simulate Live Alert
            </button>
          )}
        </div>
      </div>

      {mailItems.length === 0 ? (
        <div className="bg-[#161b22] border border-zinc-800/80 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-zinc-800/40 border border-zinc-700/50 flex items-center justify-center text-zinc-500">
            <Inbox className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-300">No Mail Received</h3>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              Simulate a new incoming alert above to see the interactive message stream in real-time.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1">
          {/* Left Column: Scrollable List of Mail */}
          <div className="lg:col-span-5 flex flex-col gap-3 max-h-[750px] overflow-y-auto pr-1">
            {mailItems.map((item) => {
              const style = getSeverityStyles(item.severity);
              const isSelected = selectedMail && selectedMail.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectMail(item)}
                  className={`p-4 rounded-xl border transition-all duration-200 text-left cursor-pointer flex gap-3 relative overflow-hidden group ${
                    isSelected
                      ? 'bg-[#1c222b] border-yellow-500/50 shadow-md shadow-yellow-500/5'
                      : item.unread
                      ? 'bg-[#141921] border-zinc-800/80 hover:bg-[#161c24]'
                      : 'bg-[#0d1117] border-zinc-800/50 hover:bg-zinc-800/20'
                  }`}
                >
                  {/* Left Active/Unread Line Indicator */}
                  {item.unread && (
                    <span className="absolute left-0 inset-y-0 w-1 bg-yellow-500 animate-pulse" />
                  )}

                  {/* Icon Avatar */}
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${style.bg}`}>
                    {item.from === 'Mayor' ? (
                      <Crown className="w-4 h-4 text-yellow-400" />
                    ) : item.from === 'refinery' ? (
                      <Terminal className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Bot className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>

                  {/* Mail metadata and title */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-semibold text-zinc-200 truncate">{item.from}</span>
                        <span className="text-[9px] text-zinc-500 font-mono px-1 bg-zinc-800 rounded truncate max-w-[80px]">
                          {item.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-500 shrink-0 font-mono">{item.time}</span>
                    </div>

                    <h4 className={`text-xs truncate transition-colors ${item.unread ? 'font-bold text-zinc-100' : 'text-zinc-300'} ${isSelected ? 'text-yellow-400' : ''}`}>
                      {item.subject}
                    </h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed font-mono">
                      {item.preview}
                    </p>

                    <div className="flex items-center gap-1.5 pt-1.5">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold font-mono ${style.badge}`}>
                        {item.severity || 'info'}
                      </span>
                      {item.unread && (
                        <span className="px-1 text-[8px] font-bold bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded font-sans animate-pulse">
                          UNREAD
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Complete Selected Mail Viewer (Terminal Display) */}
          <div className="lg:col-span-7 bg-[#161b22] border border-zinc-800/80 rounded-2xl flex flex-col overflow-hidden max-h-[750px]">
            {selectedMail ? (
              <div className="flex flex-col h-full overflow-y-auto">
                {/* Header Metadata Section */}
                <div className="p-5 border-b border-zinc-800/80 bg-[#1d242f]/30 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center">
                        {selectedMail.from === 'Mayor' ? (
                          <Crown className="w-5 h-5 text-yellow-400" />
                        ) : (
                          <Bot className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-zinc-100">{selectedMail.from}</h3>
                          <span className="text-[10px] text-zinc-400 font-mono bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/40">
                            {selectedMail.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono">Sent: {selectedMail.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold uppercase ${getSeverityStyles(selectedMail.severity).badge}`}>
                        {selectedMail.severity || 'info'}
                      </span>
                    </div>
                  </div>

                  <h1 className="text-sm font-bold text-zinc-100 leading-snug">
                    {selectedMail.subject}
                  </h1>
                </div>

                {/* Long-form Message Body */}
                <div className="p-6 flex-1 space-y-6">
                  <div className="text-xs text-zinc-300 leading-relaxed font-mono whitespace-pre-line">
                    {selectedMail.content || selectedMail.preview}
                  </div>

                  {/* Code Diff Block */}
                  {selectedMail.diff && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>INTER-AGENT STAGED CODE DIFF</span>
                      </div>
                      
                      <div className="bg-[#0d1117] border border-zinc-800 rounded-xl overflow-hidden font-mono text-[11px] leading-relaxed shadow-inner">
                        <div className="bg-[#161b22] px-4 py-2 border-b border-zinc-800 text-zinc-400 flex items-center justify-between">
                          <span>Console Sandbox View</span>
                          <span className="text-[9px] px-1 py-0.5 bg-zinc-800 text-zinc-500 rounded">PATCH STAGED</span>
                        </div>
                        <div className="p-4 overflow-x-auto max-h-[300px] whitespace-pre text-left">
                          {selectedMail.diff.split('\n').map((line, idx) => {
                            const isAdded = line.startsWith('+');
                            const isRemoved = line.startsWith('-');
                            const isHeading = line.startsWith('@@') || line.startsWith('+++') || line.startsWith('---');

                            return (
                              <div 
                                key={idx} 
                                className={`px-2 py-0.5 rounded ${
                                  isAdded 
                                    ? 'bg-emerald-950/40 text-emerald-400 border-l-2 border-emerald-500/80' 
                                    : isRemoved 
                                    ? 'bg-red-950/40 text-red-400 border-l-2 border-red-500/80' 
                                    : isHeading
                                    ? 'text-purple-400 font-semibold'
                                    : 'text-zinc-400'
                                }`}
                              >
                                {line}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer / Acknowledgement Area */}
                <div className="p-4 border-t border-zinc-800 bg-[#0d1117]/40 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-mono">MESSAGE LOCK ID: {selectedMail.id.toUpperCase()}</span>
                  <div className="flex items-center gap-2">
                    {selectedMail.unread && onMarkAsRead ? (
                      <button
                        onClick={() => onMarkAsRead(selectedMail.id)}
                        className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" /> Acknowledge Alert
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold font-mono bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ACKNOWLEDGED
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500 gap-2">
                <Mail className="w-8 h-8 text-zinc-600" />
                <p className="text-xs">Select an inter-agent mail item from the left stream to view full telemetry and diff payloads.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
