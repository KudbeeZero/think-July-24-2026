import React from 'react';
import { Laptop, Smartphone, Tablet } from 'lucide-react';

export interface DeviceSyncNode {
  id: string;
  type: 'laptop' | 'phone' | 'tablet';
  name: string;
  ping: number;
  status: 'online' | 'synced' | 'syncing' | 'offline';
  angle: number;
}

interface DeviceSyncTopologyProps {
  devices: DeviceSyncNode[];
}

export const DeviceSyncTopology: React.FC<DeviceSyncTopologyProps> = ({ devices }) => {
  return (
    <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 sm:p-5 backdrop-blur-md shadow-xl hover:border-blue-500/10 transition-all">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3 shrink-0">
        <div>
          <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Laptop className="w-4 h-4 text-blue-400 animate-pulse" />
            KUDBEE MULTI-DEVICE DB SYNC MESH
          </h3>
          <p className="text-[10px] text-zinc-500 font-mono">
            Real-time status of cache-synchronized edge nodes mapped to active Redis storage blocks.
          </p>
        </div>
        <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono font-bold border border-blue-500/20">
          6 Active Clients
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {devices.map(dev => (
          <div 
            key={dev.id} 
            className={`p-3 rounded-lg border font-mono text-[10px] space-y-1.5 relative overflow-hidden transition-all hover:scale-[1.02] ${
              dev.status === 'synced' 
                ? 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700' 
                : (dev.status === 'syncing' ? 'bg-blue-500/5 border-blue-500/20 hover:border-blue-500/30' : 'bg-red-500/5 border-red-500/20 hover:border-red-500/30')
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 uppercase text-[9px] font-semibold">Client Node</span>
              <span className={`w-1.5 h-1.5 rounded-full ${
                dev.status === 'synced' ? 'bg-green-500 shadow-sm shadow-green-500' : (dev.status === 'syncing' ? 'bg-blue-500 animate-ping' : 'bg-red-500')
              }`} />
            </div>

            <div className="font-bold text-zinc-200 flex items-center gap-1.5">
              {dev.type === 'laptop' && <Laptop className="w-3.5 h-3.5 text-zinc-400" />}
              {dev.type === 'phone' && <Smartphone className="w-3.5 h-3.5 text-zinc-400" />}
              {dev.type === 'tablet' && <Tablet className="w-3.5 h-3.5 text-zinc-400" />}
              <span className="truncate">{dev.name}</span>
            </div>

            <div className="flex items-center justify-between text-[9px] text-zinc-500 pt-1 border-t border-zinc-800/50">
              <span>Ping Rate: <strong className="text-zinc-400">{dev.ping}ms</strong></span>
              <span className={dev.status === 'synced' ? 'text-green-400 font-bold' : (dev.status === 'syncing' ? 'text-blue-400' : 'text-red-400')}>
                {dev.status.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
