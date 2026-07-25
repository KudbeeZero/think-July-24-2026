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
  AlertCircle,
  RefreshCw,
  Layers,
  Shield,
  Zap,
  Server,
  Plug
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
  const [isSyncing, setIsSyncing] = useState(false);

  const selectedMail = mailItems.find(m => m.id === selectedId) || mailItems[0];
  const unreadCount = mailItems.filter(m => m.unread).length;

  const handleSelectMail = (item: MailItem) => {
    setSelectedId(item.id);
    if (item.unread && onMarkAsRead) {
      onMarkAsRead(item.id);
    }
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1200);
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
    <div className="space-y-4 sm:space-y-6 max-w-[1600px] mx-auto pb-28 font-mono select-none px-2 sm:px-4">
      
      {/* 1. MAIL EXECUTIVE TRANSPORT & CONTROL BAR */}
      <div className="bg-[#121620] border-2 border-zinc-800 rounded-2xl p-3 sm:p-5 shadow-2xl flex flex-col xl:flex-row items-center justify-between gap-4 sm:gap-6 backdrop-blur-md">
        
        {/* Left: Branding & Counts */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-between xl:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/30 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xs sm:text-base font-extrabold text-zinc-100 tracking-wider uppercase">
                  INTER-AGENT MAIL & DISPATCH STREAM
                </h1>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-bold">
                  {unreadCount} UNREAD ALERTS
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                High-Priority Inter-Agent Communications & System Orchestration Dispatch V3.2
              </p>
            </div>
          </div>
        </div>

        {/* Center: Quick Stats Pills */}
        <div className="hidden lg:flex items-center gap-3 bg-zinc-950/60 border border-zinc-850 px-4 py-2.5 rounded-xl">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-zinc-400">Total Mail:</span>
            <span className="text-amber-400 font-bold">{mailItems.length}</span>
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-400">Stream Status:</span>
            <span className="text-emerald-400 font-bold">Synchronized</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full xl:w-auto justify-end">
          {onMarkAllAsRead && (
            <button
              onClick={onMarkAllAsRead}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 transition-all shadow-md cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-amber-400" />
              <span>Mark All Read</span>
            </button>
          )}

          {onSimulateAlert && (
            <button
              onClick={onSimulateAlert}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-extrabold text-xs transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simulate Alert</span>
            </button>
          )}

          <button
            onClick={handleManualSync}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 transition-all shadow-md cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {mailItems.length === 0 ? (
        <div className="bg-[#121620] border-2 border-zinc-800 rounded-2xl p-16 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500">
            <Inbox className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-300">No Mail Received</h3>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              Simulate an incoming alert above to observe the inter-agent message stream in real-time.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Left Column: Mail Message List */}
          <div className="lg:col-span-5 bg-[#121620] border-2 border-zinc-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Inbox Stream ({mailItems.length})</span>
              <span className="text-[10px] text-zinc-400 font-mono">{unreadCount} unread</span>
            </div>

            {mailItems.map((item) => {
              const style = getSeverityStyles(item.severity);
              const isSelected = selectedMail && selectedMail.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectMail(item)}
                  className={`p-3.5 rounded-xl border transition-all duration-200 text-left cursor-pointer flex gap-3 relative overflow-hidden group ${
                    isSelected
                      ? 'bg-zinc-900 border-amber-500/50 shadow-lg'
                      : item.unread
                      ? 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                      : 'bg-zinc-950/40 border-zinc-850 hover:bg-zinc-900/40'
                  }`}
                >
                  {item.unread && (
                    <span className="absolute left-0 inset-y-0 w-1 bg-amber-500 animate-pulse" />
                  )}

                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${style.bg}`}>
                    {item.from === 'Mayor' ? (
                      <Crown className="w-4 h-4 text-amber-400" />
                    ) : item.from === 'refinery' ? (
                      <Terminal className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Bot className="w-4 h-4 text-green-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-zinc-200 truncate">{item.from}</span>
                      <span className="text-[9px] text-zinc-400 font-mono">{item.time}</span>
                    </div>
                    <p className="text-xs font-semibold text-zinc-100 truncate mt-0.5 font-sans">{item.subject}</p>
                    <p className="text-[11px] text-zinc-400 truncate mt-1 font-sans">{item.preview}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Mail Detail Viewer */}
          <div className="lg:col-span-7 bg-[#121620] border-2 border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
            {selectedMail ? (
              <div className="space-y-5">
                <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-amber-400 font-mono uppercase">{selectedMail.from}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${getSeverityStyles(selectedMail.severity).badge}`}>
                        {selectedMail.severity || 'info'}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold text-zinc-100 font-sans">
                      {selectedMail.subject}
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-mono">Timestamp: {selectedMail.time}</p>
                  </div>
                </div>

                <div className="bg-zinc-950/80 border border-zinc-850 rounded-xl p-4 sm:p-5 text-xs text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap max-h-[40vh] overflow-y-auto custom-scrollbar">
                  {selectedMail.content || selectedMail.preview}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-zinc-500 font-mono py-20">
                Select a message to inspect full telemetry payload
              </div>
            )}

            <div className="border-t border-zinc-850 pt-3 mt-6 text-[10px] text-zinc-500 flex items-center justify-between font-mono">
              <span>Secure Dispatch Protocol</span>
              <span className="text-amber-400 font-bold">Encrypted End-to-End</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
