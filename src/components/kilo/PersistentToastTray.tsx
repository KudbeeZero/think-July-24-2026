import React from 'react';
import { Bell, Trash2, CheckCircle2 } from 'lucide-react';

interface ToastItem {
  id: string;
  title: string;
  desc: string;
  severity?: 'info' | 'warning' | 'critical' | 'escalation';
}

interface PersistentToastTrayProps {
  persistedToasts: ToastItem[];
  handleClearToasts: () => void;
  handleAddDemoToast: (title: string, desc: string, severity?: 'info' | 'warning' | 'critical' | 'escalation') => void;
}

export const PersistentToastTray: React.FC<PersistentToastTrayProps> = ({
  persistedToasts,
  handleClearToasts,
  handleAddDemoToast,
}) => {
  return (
    <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 sm:p-5 backdrop-blur-md shadow-xl hover:border-yellow-500/10 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
          <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Bell className="w-4 h-4 text-yellow-500 animate-pulse" />
            PERSISTENT TOAST EVENT LOG
          </span>
          <button 
            onClick={handleClearToasts}
            className="text-zinc-500 hover:text-red-400 transition-colors"
            title="Clear Persistent Events"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {persistedToasts.length === 0 ? (
          <div className="py-6 text-center text-[10px] text-zinc-500 font-mono space-y-2">
            <CheckCircle2 className="w-5 h-5 mx-auto text-zinc-600" />
            <p>No historical events logged in LocalStorage.</p>
            <button 
              onClick={() => handleAddDemoToast('Node Checkpoint Saved', 'Successfully committed local state chunk to memory ledger.', 'info')}
              className="text-yellow-400 hover:underline hover:text-yellow-300 font-bold"
            >
              Generate Test Event
            </button>
          </div>
        ) : (
          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {persistedToasts.map((t, i) => (
              <div 
                key={t.id || i}
                className={`p-2.5 rounded border font-mono text-[9px] space-y-0.5 leading-normal ${
                  t.severity === 'critical' || t.severity === 'escalation'
                    ? 'bg-red-500/5 border-red-500/20 text-red-300'
                    : (t.severity === 'warning' ? 'bg-yellow-500/5 border-yellow-500/10 text-yellow-300' : 'bg-zinc-900 border-zinc-800/80 text-zinc-300')
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="truncate">{t.title}</span>
                  <span className="text-[7px] uppercase tracking-wide px-1 py-0.25 bg-zinc-950 rounded border border-zinc-800">
                    {t.severity || 'info'}
                  </span>
                </div>
                <p className="text-[8px] text-zinc-400 leading-normal">{t.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-zinc-800/60 pt-3 mt-4 flex items-center justify-between text-[9px] text-zinc-500 font-mono shrink-0">
        <span>Durable Cache:</span>
        <span className="text-zinc-300 font-bold">{persistedToasts.length} Incidents</span>
      </div>
    </div>
  );
};
