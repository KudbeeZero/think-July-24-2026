import React from 'react';
import { useKilo } from '../../context/KiloContext';

export function ModelUsageMeter() {
  const { modelUsage } = useKilo();
  return (
    <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
      {modelUsage.map(m => (
        <div key={m.modelName} className="space-y-1">
          <div className="flex justify-between text-[10px] text-zinc-400">
            <span className="font-bold">{m.modelName}</span>
            <span className="font-mono text-zinc-200">{Math.round((m.usageTokens / m.limitTokens) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className={`h-full ${m.usageTokens / m.limitTokens > 0.8 ? 'bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]' : 'bg-yellow-500 shadow-[0_0_4px_rgba(234,179,8,0.5)]'}`}
              style={{ width: `${Math.min(100, (m.usageTokens / m.limitTokens) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
