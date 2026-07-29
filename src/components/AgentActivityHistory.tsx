import React, { useState, useEffect } from 'react';
import { Activity, Radio, RefreshCw, CheckCircle2, Zap, Clock, Shield } from 'lucide-react';
import { Agent, TelemetryLog } from '../types';

interface AgentActivityHistoryProps {
  agent: Agent;
  liveFeed: TelemetryLog[];
  onTriggerHeartbeat?: (agentId: string) => void;
}

export function AgentActivityHistory({ agent, liveFeed, onTriggerHeartbeat }: AgentActivityHistoryProps) {
  const [heartbeatRecords, setHeartbeatRecords] = useState<Array<{ id: string; time: string; latency: number; status: string; health: number }>>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Load / simulate agent heartbeat history
  useEffect(() => {
    setIsLoadingHistory(true);
    const timer = setTimeout(() => {
      // Generate initial activity heartbeat history based on agent properties
      const initialRecords = [
        { id: 'hb-01', time: '2 mins ago', latency: agent.latency || 12, status: agent.status, health: agent.healthScore || 98 },
        { id: 'hb-02', time: '5 mins ago', latency: (agent.latency || 12) + 2, status: agent.status, health: (agent.healthScore || 98) - 1 },
        { id: 'hb-03', time: '10 mins ago', latency: (agent.latency || 12) - 1, status: agent.status, health: agent.healthScore || 98 },
        { id: 'hb-04', time: '15 mins ago', latency: (agent.latency || 12) + 4, status: agent.status, health: (agent.healthScore || 98) - 2 },
      ];
      setHeartbeatRecords(initialRecords);
      setIsLoadingHistory(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [agent.id, agent.status, agent.latency, agent.healthScore]);

  // Filter liveFeed logs specific to this agent
  const agentLogs = (liveFeed || []).filter(item =>
    (item.source && item.source.toLowerCase().includes(agent.name.toLowerCase())) ||
    (item.msg && item.msg.toLowerCase().includes(agent.name.toLowerCase())) ||
    (item.event && item.event.toLowerCase().includes(agent.name.toLowerCase()))
  ).slice(0, 6);

  const handlePulseTrigger = () => {
    if (onTriggerHeartbeat) {
      onTriggerHeartbeat(agent.id);
    }
    // Add new heartbeat record
    const newRecord = {
      id: `hb-${Date.now().toString().slice(-4)}`,
      time: 'just now',
      latency: Math.floor(Math.random() * 8) + 8,
      status: agent.status,
      health: agent.healthScore || 99
    };
    setHeartbeatRecords(prev => [newRecord, ...prev.slice(0, 7)]);
  };

  return (
    <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-4 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" /> Agent Heartbeat & Activity History
        </div>
        <button
          onClick={handlePulseTrigger}
          className="flex items-center gap-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-3 h-3 animate-spin-slow" /> Trigger Pulse
        </button>
      </div>

      {isLoadingHistory ? (
        <div className="py-6 text-center text-xs text-zinc-500 font-mono flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> Fetching agent telemetry & heartbeat traces...
        </div>
      ) : (
        <div className="space-y-3">
          {/* Heartbeat Status Timeline */}
          <div className="space-y-2">
            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Recent Heartbeat Ticks</span>
              <span className="text-emerald-400 font-mono">Status: {agent.status.toUpperCase()}</span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
              {heartbeatRecords.map((hb, index) => (
                <div 
                  key={hb.id || index}
                  className="bg-black/40 border border-zinc-800/80 rounded-lg p-2.5 flex items-center justify-between text-xs font-mono hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                    <div>
                      <div className="text-zinc-200 font-bold text-[11px] flex items-center gap-2">
                        <span>Heartbeat #{hb.id}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-normal">
                          {hb.status}
                        </span>
                      </div>
                      <div className="text-[9px] text-zinc-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> {hb.time}
                        </span>
                        <span>• Health: {hb.health}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-cyan-400 font-bold text-[11px]">{hb.latency}ms</div>
                    <div className="text-[8px] text-zinc-500">latency trace</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Telemetry Log Stream Integration */}
          <div className="bg-black/60 border border-zinc-850 rounded-lg p-3 space-y-2 font-mono text-[10px]">
            <div className="flex items-center justify-between text-[9px] text-zinc-400 font-bold uppercase border-b border-zinc-850 pb-1.5">
              <span className="flex items-center gap-1.5 text-yellow-400">
                <Radio className="w-3 h-3 animate-pulse" /> Agent Activity Log Stream
              </span>
              <span className="text-zinc-500">Live SSE Feed</span>
            </div>

            {agentLogs.length > 0 ? (
              <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                {agentLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-2 text-[10px] text-zinc-300 border-b border-zinc-900/50 pb-1 last:border-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate text-zinc-200">{log.msg || log.event}</span>
                    </div>
                    <span className="text-[9px] text-zinc-500 shrink-0 font-mono">{log.time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-zinc-500 italic text-[10px] py-2 text-center">
                Agent operating normally. Last active: {agent.lastActive}.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
