import React, { useEffect, useRef, useState } from 'react';
import { Network, Activity, ArrowRight, ShieldCheck, Zap, Layers, Cpu } from 'lucide-react';
import { SSEEventType, RoutingNode } from '../types';

interface Packet {
  id: string;
  type: SSEEventType;
  currentNodeIndex: number;
  progress: number; // 0 to 1 between nodes
  speed: number;
}

const NODES: RoutingNode[] = ['INGRESS', 'HERMES', 'GATEWAY', 'SENTINEL', 'CRUCIBLE', 'REDIS', 'LLM'];

const SSE_COLORS: Record<SSEEventType, { text: string; bg: string; border: string; hex: string }> = {
  governance: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', hex: '#c084fc' },
  telemetry: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', hex: '#60a5fa' },
  hermes_suggestion: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', hex: '#fbbf24' },
  triage: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', hex: '#22d3ee' },
  slow_brain: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', hex: '#34d399' },
  hermes: { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', hex: '#818cf8' }
};

export const RoutingVisualizer: React.FC = () => {
  const [activeType, setActiveType] = useState<SSEEventType>('governance');
  const [packets, setPackets] = useState<Packet[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Spawn new packet
  const handleInjectPacket = (type: SSEEventType) => {
    setActiveType(type);
    const newPacket: Packet = {
      id: `pkt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type,
      currentNodeIndex: 0,
      progress: 0,
      speed: 0.8 + Math.random() * 0.4
    };
    setPackets((prev) => [...prev.slice(-10), newPacket]);
  };

  // Discretized CfC Trajectory loop S_{t+1} = S_t + Phi(S_t, theta, delta_t)
  useEffect(() => {
    const updateTrajectory = (now: number) => {
      const deltaMs = Math.min(now - lastTimeRef.current, 50);
      lastTimeRef.current = now;
      const deltaSec = deltaMs / 1000;

      setPackets((prevPackets) => {
        return prevPackets
          .map((p) => {
            let nextProgress = p.progress + p.speed * deltaSec;
            let nextIndex = p.currentNodeIndex;

            if (nextProgress >= 1) {
              nextProgress = 0;
              nextIndex += 1;
            }

            return {
              ...p,
              progress: nextProgress,
              currentNodeIndex: nextIndex
            };
          })
          .filter((p) => p.currentNodeIndex < NODES.length - 1);
      });

      animFrameRef.current = requestAnimationFrame(updateTrajectory);
    };

    animFrameRef.current = requestAnimationFrame(updateTrajectory);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-5 shadow-xl font-mono">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              BraiNCA 7-Node Matrix & CfC Trajectory
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              S_(t+1) = S_t + Φ(S_t, θ, Δt) Continuous-Time Routing
            </p>
          </div>
        </div>

        {/* SSE Event Types selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(
            [
              'governance',
              'telemetry',
              'hermes_suggestion',
              'triage',
              'slow_brain',
              'hermes'
            ] as SSEEventType[]
          ).map((type) => (
            <button
              key={type}
              onClick={() => handleInjectPacket(type)}
              className={`px-2.5 py-1 text-[11px] rounded-lg border font-semibold transition-all ${
                SSE_COLORS[type].bg
              } ${SSE_COLORS[type].text} ${SSE_COLORS[type].border} hover:scale-105`}
            >
              + {type}
            </button>
          ))}
        </div>
      </div>

      {/* 7-Node Pipeline Visualization */}
      <div className="bg-[#0d1117] border border-zinc-800/80 rounded-xl p-4 overflow-x-auto relative custom-scrollbar">
        <div className="flex items-center justify-between min-w-[700px] relative py-4">
          {NODES.map((node, idx) => {
            const nodePackets = packets.filter((p) => p.currentNodeIndex === idx);

            return (
              <React.Fragment key={node}>
                {/* Node Box */}
                <div className="flex flex-col items-center z-10">
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold text-xs shadow-md transition-all ${
                      nodePackets.length > 0
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-cyan-500/10 scale-105'
                        : 'bg-[#161b22] border-zinc-700 text-zinc-300'
                    }`}
                  >
                    {node === 'INGRESS' ? (
                      <Zap className="w-5 h-5 text-yellow-400" />
                    ) : node === 'SENTINEL' ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    ) : node === 'REDIS' ? (
                      <Layers className="w-5 h-5 text-purple-400" />
                    ) : (
                      <Cpu className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400 mt-2 tracking-wider">{node}</span>
                </div>

                {/* Arrow Connector */}
                {idx < NODES.length - 1 && (
                  <div className="flex-1 flex items-center justify-center relative px-2">
                    <div className="h-0.5 w-full bg-zinc-800 relative">
                      {/* Animating packets along the connector */}
                      {packets
                        .filter((p) => p.currentNodeIndex === idx)
                        .map((p) => (
                          <div
                            key={p.id}
                            className="absolute -top-1.5 w-3 h-3 rounded-full shadow-lg border animate-pulse transition-all"
                            style={{
                              left: `${p.progress * 100}%`,
                              backgroundColor: SSE_COLORS[p.type].hex,
                              borderColor: '#ffffff'
                            }}
                          />
                        ))}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600 shrink-0 ml-1" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
