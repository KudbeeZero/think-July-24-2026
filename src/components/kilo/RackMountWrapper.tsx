import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { Sparkles, RefreshCw, Zap, Sliders, ChevronDown, ChevronUp, Flame } from 'lucide-react';
import { DigitalSpectrumAnalyzer } from './DigitalSpectrumAnalyzer';

interface RackMountWrapperProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  showAgentStatus?: boolean;
}

export function RackMountWrapper({ children, title, className = '', showAgentStatus = false }: RackMountWrapperProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [activeText, setActiveText] = useState('KUDBEE thinking...');
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'warning'>('healthy');
  const [isFlipped, setIsFlipped] = useState(false);
  const [cableShakeKey, setCableShakeKey] = useState(0);
  const [activeConnections, setActiveConnections] = useState<Record<string, boolean>>({});
  const [showFrontInstruments, setShowFrontInstruments] = useState(true);

  // Front Panel Analog Instrument States
  const [waveType, setWaveType] = useState<'sine' | 'square' | 'triangle' | 'noise'>('sine');
  const [oscRate, setOscRate] = useState(40);
  const [oscAmp, setOscAmp] = useState(50);
  const [graphTime, setGraphTime] = useState(0);

  // Thermal Analysis Overlay States & Simulated Heat Load
  const [showThermal, setShowThermal] = useState(false);
  const [cpuLoadPreset, setCpuLoadPreset] = useState<number>(68); // 0 - 100%
  const [thermalJitter, setThermalJitter] = useState<number>(0);

  const { playBeep, playHum, playTwist, playPlug, playFlip } = useSoundEffects();

  useEffect(() => {
    let animId: number;
    let count = 0;
    const loop = () => {
      count++;
      if (count % 12 === 0) {
        setThermalJitter((Math.random() - 0.5) * 2.2);
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Hotspot Temperatures based on simulated CPU load
  const cpu0Temp = Number((32 + (cpuLoadPreset * 0.52) + thermalJitter).toFixed(1));
  const vrmTemp = Number((38 + (cpuLoadPreset * 0.58) + (thermalJitter * 1.2)).toFixed(1));
  const ramTemp = Number((28 + (cpuLoadPreset * 0.28) + (thermalJitter * 0.5)).toFixed(1));
  const psuTemp = Number((35 + (cpuLoadPreset * 0.45) + (thermalJitter * 0.8)).toFixed(1));
  const intakeTemp = Number((22 + (cpuLoadPreset * 0.08)).toFixed(1));

  const toggleConnection = (id: string) => {
    playPlug();
    setActiveConnections(prev => ({ ...prev, [id]: !prev[id] }));
    setCableShakeKey(k => k + 1);
  };

  // Handle live clock ticks for the front oscilloscope wave
  useEffect(() => {
    let animationId: number;
    const tick = () => {
      setGraphTime(prev => (prev + 0.1) % (Math.PI * 2));
      animationId = requestAnimationFrame(tick);
    };
    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      // Faster, more erratic blink
      if (Math.random() > 0.4) setIsBlinking(prev => !prev);
      // Toggle text
      if (Math.random() > 0.5) {
        setActiveText(prev => prev === 'KUDBEE thinking...' ? 'KUDBEE flabbergasted...' : 'KUDBEE thinking...');
      }
      if (Math.random() > 0.8) {
        setHealthStatus(prev => prev === 'healthy' ? 'warning' : 'healthy');
      }
    }, 1500);
    playHum();
    return () => clearInterval(interval);
  }, [playHum]);

  const handleFlip = () => {
    playFlip();
    setIsFlipped(prev => !prev);
    // Trigger cable wobble automatically on flip
    setCableShakeKey(k => k + 1);
  };

  const triggerCableWobble = () => {
    playPlug();
    setCableShakeKey(k => k + 1);
  };

  // SVG Wave path generation for Oscilloscope
  const getWavePath = () => {
    const width = 160;
    const height = 50;
    const points: string[] = [];
    const step = 2;

    for (let x = 0; x <= width; x += step) {
      let y = height / 2;
      const angle = (x / width) * (oscRate * 0.4) + graphTime * 5;

      if (waveType === 'sine') {
        y += Math.sin(angle) * (oscAmp * 0.35);
      } else if (waveType === 'square') {
        y += (Math.sin(angle) >= 0 ? 1 : -1) * (oscAmp * 0.3);
      } else if (waveType === 'triangle') {
        y += (Math.abs((angle % (Math.PI * 2)) - Math.PI) / Math.PI - 0.5) * 2 * (oscAmp * 0.35);
      } else if (waveType === 'noise') {
        y += (Math.random() - 0.5) * (oscAmp * 0.5);
      }

      points.push(`${x},${y}`);
    }

    return `M ${points.join(' L ')}`;
  };

  return (
    <div 
      className="relative w-full [perspective:1500px]"
      onMouseEnter={() => playBeep(220)}
    >
      <motion.div
        className="w-full relative [transform-style:preserve-3d] transition-all duration-700"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        
        {/* ==================== FRONT PANEL ==================== */}
        <div 
          className={`w-full bg-zinc-700 border-t-2 border-l-2 border-zinc-500 border-b-2 border-r-2 border-zinc-900 rounded-lg p-4 sm:p-5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_10px_15px_-3px_rgba(0,0,0,0.5)] [backface-visibility:hidden] ${className}`}
        >
          {/* Ribbon Cable Animation */}
          <div className="absolute top-0 left-0 w-full h-1 overflow-hidden z-0 pointer-events-none">
            <div className="w-10 h-1 bg-emerald-500 animate-flow shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>

          {/* Input/Output Jacks */}
          <div className="absolute top-2 left-2 flex flex-col items-center gap-1 z-20">
            <span className="text-[8px] font-mono text-zinc-400 uppercase">CV In</span>
            <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-950 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9),0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center cursor-pointer hover:bg-zinc-700 transition-colors" onClick={() => playBeep(880)}>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            </div>
          </div>
          <div className="absolute top-2 right-2 flex flex-col items-center gap-1 z-20">
            <span className="text-[8px] font-mono text-zinc-400 uppercase">Out 1</span>
            <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-950 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9),0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center cursor-pointer hover:bg-zinc-700 transition-colors" onClick={() => playBeep(880)}>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            </div>
          </div>
          <div className="absolute bottom-2 left-2 flex flex-col items-center gap-1 z-20">
            <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-950 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9),0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center cursor-pointer hover:bg-zinc-700 transition-colors" onClick={() => playBeep(880)}>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            </div>
            <span className="text-[8px] font-mono text-zinc-400 uppercase">Aux In</span>
          </div>
          <div className="absolute bottom-2 right-2 flex flex-col items-center gap-1 z-20">
            <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-950 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9),0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center cursor-pointer hover:bg-zinc-700 transition-colors" onClick={() => playBeep(880)}>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            </div>
            <span className="text-[8px] font-mono text-zinc-400 uppercase">Out 2</span>
          </div>

          {/* System Health LED Strip */}
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col gap-0.5 p-1 bg-zinc-900 rounded-sm border border-zinc-800 z-10">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-0.5 rounded-sm transition-colors duration-300 ${
                  healthStatus === 'healthy' 
                    ? 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]' 
                    : i > 3 ? 'bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]' : 'bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.5)]'
                }`} 
                style={{ opacity: isBlinking ? 1 : 0.4 }}
              />
            ))}
          </div>

          {/* Cooling Fans */}
          <div className="absolute left-1/2 bottom-2 transform -translate-x-1/2 flex gap-4 opacity-30 pointer-events-none">
            <div className="w-8 h-8 rounded-full border-2 border-zinc-800 flex items-center justify-center bg-zinc-900 overflow-hidden relative">
              <div className="absolute inset-0 border-[3px] border-zinc-700 border-dashed rounded-full animate-[spin_1s_linear_infinite]" />
              <div className="w-2 h-2 bg-zinc-600 rounded-full z-10 shadow-lg" />
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-zinc-800 flex items-center justify-center bg-zinc-900 overflow-hidden relative">
              <div className="absolute inset-0 border-[3px] border-zinc-700 border-dashed rounded-full animate-[spin_0.8s_linear_infinite]" />
              <div className="w-2 h-2 bg-zinc-600 rounded-full z-10 shadow-lg" />
            </div>
          </div>

          {/* Rack mount ears */}
          <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-3 h-10 bg-zinc-600 rounded-r border-r border-zinc-900 shadow-lg flex flex-col justify-between p-0.5 z-20">
            <div className="w-2 h-2 rounded-full bg-zinc-950 border border-zinc-800 shadow-[inset_0_1px_2px_rgba(0,0,0,1)]" />
            <div className="w-2 h-2 rounded-full bg-zinc-950 border border-zinc-800 shadow-[inset_0_1px_2px_rgba(0,0,0,1)]" />
          </div>
          <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-3 h-10 bg-zinc-600 border-l border-zinc-900 shadow-lg flex flex-col justify-between p-0.5 z-20">
            <div className="w-2 h-2 rounded-full bg-zinc-950 border border-zinc-800 shadow-[inset_0_1px_2px_rgba(0,0,0,1)]" />
            <div className="w-2 h-2 rounded-full bg-zinc-950 border border-zinc-800 shadow-[inset_0_1px_2px_rgba(0,0,0,1)]" />
          </div>

          {/* Engraved Metal Title Plate */}
          {title && (
            <div className="relative mb-4 flex items-center justify-between p-3 bg-zinc-800 border-t border-l border-zinc-600 border-r-zinc-900 border-b-zinc-900 rounded shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_2px_4px_rgba(255,255,255,0.05)]">
              <div className="font-mono text-zinc-300 font-bold uppercase tracking-[0.2em] text-[11px] drop-shadow-[0_1px_0_rgba(255,255,255,0.2)]" style={{ textShadow: '0 1px 1px rgba(0,0,0,0.8)' }}>
                {title}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playBeep(showThermal ? 300 : 700);
                    setShowThermal(prev => !prev);
                  }}
                  className={`px-2.5 py-1 rounded border text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    showThermal
                      ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white border-amber-300 shadow-[0_0_12px_rgba(239,68,68,0.6)] font-black'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-amber-400 hover:border-amber-500/50'
                  }`}
                >
                  <Flame className={`w-3 h-3 ${showThermal ? 'animate-bounce text-yellow-200' : 'text-amber-500'}`} />
                  <span>{showThermal ? 'THERMAL ON' : 'THERMAL'}</span>
                </button>
                <button
                  onClick={handleFlip}
                  className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-[9px] font-bold text-zinc-500 uppercase tracking-wider hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  REAR
                </button>
              </div>
            </div>
          )}

          {/* Thermal Analysis FLIR Gradient Overlay */}
          <AnimatePresence>
            {showThermal && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="relative my-3 p-3 bg-black/90 border-2 border-red-500/60 rounded-xl overflow-hidden shadow-[0_0_25px_rgba(239,68,68,0.35)] font-mono select-none z-30"
              >
                {/* Background FLIR Thermal Multi-radial Heatmap Gradients */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-85 transition-all duration-500"
                  style={{
                    background: `
                      radial-gradient(circle at 25% 35%, rgba(255, 255, 255, ${Math.min(0.95, cpu0Temp / 85)}), rgba(239, 68, 68, ${Math.min(0.85, cpu0Temp / 70)}), rgba(245, 158, 11, 0.6), transparent 45%),
                      radial-gradient(circle at 75% 25%, rgba(220, 38, 38, ${Math.min(0.95, vrmTemp / 80)}), rgba(234, 88, 12, 0.7), rgba(234, 179, 8, 0.4), transparent 40%),
                      radial-gradient(circle at 50% 65%, rgba(234, 179, 8, ${Math.min(0.7, ramTemp / 60)}), rgba(34, 197, 94, 0.5), transparent 35%),
                      radial-gradient(circle at 85% 75%, rgba(239, 68, 68, ${Math.min(0.8, psuTemp / 75)}), rgba(245, 158, 11, 0.5), transparent 40%),
                      radial-gradient(circle at 12% 80%, rgba(59, 130, 246, 0.75), rgba(6, 182, 212, 0.4), transparent 35%),
                      linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 27, 75, 0.8) 50%, rgba(67, 24, 255, 0.25) 100%)
                    `
                  }}
                />

                {/* Grid Scanlines & HUD overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-40" />
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.4)_50%)] bg-[size:100%_4px] pointer-events-none opacity-30" />

                {/* FLIR Header Controls */}
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-red-500/40 mb-3 text-[10px]">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="font-black text-amber-300 tracking-wider uppercase">
                      THERMAL ANALYSIS OVERLAY [FLIR OPTICS]
                    </span>
                    <span className="bg-red-950/90 border border-red-600/80 text-red-300 text-[8px] font-bold px-2 py-0.5 rounded shadow-sm">
                      HEAT DISTRIBUTION
                    </span>
                  </div>

                  {/* Load Preset Selector */}
                  <div className="flex items-center gap-1.5 bg-black/80 border border-zinc-800 px-2 py-1 rounded-lg">
                    <span className="text-[9px] text-zinc-400 font-bold uppercase mr-1">LOAD SIM:</span>
                    {[
                      { label: 'IDLE (20%)', load: 20 },
                      { label: 'NOMINAL (55%)', load: 55 },
                      { label: 'HIGH (85%)', load: 85 },
                      { label: 'MAX (100%)', load: 100 }
                    ].map(p => (
                      <button
                        key={p.load}
                        onClick={() => {
                          playBeep(400 + p.load * 3);
                          setCpuLoadPreset(p.load);
                        }}
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                          cpuLoadPreset === p.load
                            ? 'bg-amber-400 text-black font-black shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                            : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Thermal HUD Target Reticles & Temperature Callouts */}
                <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 my-2">
                  {/* Hotspot 1: CPU0 CORE */}
                  <div className="bg-black/70 border border-red-500/60 rounded-lg p-2.5 backdrop-blur-sm relative overflow-hidden">
                    <div className="flex items-center justify-between text-[8px] text-zinc-400 mb-1">
                      <span className="font-bold uppercase text-amber-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        CPU0 CORE
                      </span>
                      <span className="text-zinc-500">ZONE 1</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-lg font-black font-mono ${cpu0Temp >= 80 ? 'text-red-400 animate-pulse' : cpu0Temp >= 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {cpu0Temp}°C
                      </span>
                      <span className="text-[9px] text-zinc-500">({(cpu0Temp * 1.8 + 32).toFixed(0)}°F)</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-1.5 rounded-full mt-1.5 overflow-hidden border border-zinc-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          cpu0Temp >= 80 ? 'bg-gradient-to-r from-amber-500 to-red-600' : 'bg-gradient-to-r from-emerald-500 to-amber-400'
                        }`}
                        style={{ width: `${Math.min(100, (cpu0Temp / 100) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Hotspot 2: VRM POWER */}
                  <div className="bg-black/70 border border-orange-500/60 rounded-lg p-2.5 backdrop-blur-sm relative overflow-hidden">
                    <div className="flex items-center justify-between text-[8px] text-zinc-400 mb-1">
                      <span className="font-bold uppercase text-orange-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                        VRM POWER
                      </span>
                      <span className="text-zinc-500">ZONE 2</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-lg font-black font-mono ${vrmTemp >= 80 ? 'text-red-400' : 'text-orange-400'}`}>
                        {vrmTemp}°C
                      </span>
                      <span className="text-[9px] text-zinc-500">({(vrmTemp * 1.8 + 32).toFixed(0)}°F)</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-1.5 rounded-full mt-1.5 overflow-hidden border border-zinc-800">
                      <div 
                        className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-yellow-500 to-orange-600"
                        style={{ width: `${Math.min(100, (vrmTemp / 100) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Hotspot 3: RAM BANKS */}
                  <div className="bg-black/70 border border-yellow-500/60 rounded-lg p-2.5 backdrop-blur-sm relative overflow-hidden">
                    <div className="flex items-center justify-between text-[8px] text-zinc-400 mb-1">
                      <span className="font-bold uppercase text-yellow-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                        RAM MODULES
                      </span>
                      <span className="text-zinc-500">ZONE 3</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black font-mono text-yellow-400">
                        {ramTemp}°C
                      </span>
                      <span className="text-[9px] text-zinc-500">({(ramTemp * 1.8 + 32).toFixed(0)}°F)</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-1.5 rounded-full mt-1.5 overflow-hidden border border-zinc-800">
                      <div 
                        className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-emerald-400 to-yellow-400"
                        style={{ width: `${Math.min(100, (ramTemp / 100) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Hotspot 4: COOL INTAKE */}
                  <div className="bg-black/70 border border-cyan-500/60 rounded-lg p-2.5 backdrop-blur-sm relative overflow-hidden">
                    <div className="flex items-center justify-between text-[8px] text-zinc-400 mb-1">
                      <span className="font-bold uppercase text-cyan-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        FAN INTAKE
                      </span>
                      <span className="text-zinc-500">ZONE 4</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black font-mono text-cyan-400">
                        {intakeTemp}°C
                      </span>
                      <span className="text-[9px] text-zinc-500">({(intakeTemp * 1.8 + 32).toFixed(0)}°F)</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-1.5 rounded-full mt-1.5 overflow-hidden border border-zinc-800">
                      <div 
                        className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-blue-500 to-cyan-400"
                        style={{ width: `${Math.min(100, (intakeTemp / 100) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* FLIR Spectrum Heat Legend Bar */}
                <div className="relative z-10 pt-2 border-t border-red-500/30 flex flex-wrap items-center justify-between gap-2 text-[8px] text-zinc-400">
                  <span className="font-bold text-zinc-300">FLIR PALETTE SCALE:</span>
                  <div className="flex-1 min-w-[120px] h-2.5 rounded border border-zinc-700 overflow-hidden bg-gradient-to-r from-purple-900 via-blue-600 via-emerald-500 via-yellow-400 via-orange-500 to-red-600 shadow-inner" />
                  <div className="flex items-center gap-2 font-mono font-bold">
                    <span className="text-blue-400">20°C COLD</span>
                    <span className="text-amber-400">60°C WARM</span>
                    <span className="text-red-400">95°C HOT</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Patch Bay */}
          <div className="mb-4 bg-zinc-950 border-t border-l border-zinc-900 border-r border-b border-zinc-700 rounded p-2 flex gap-2">
            {['In-A', 'In-B', 'Out-A', 'Out-B'].map(port => (
              <div key={port} className="flex flex-col items-center gap-1">
                <button 
                  onClick={() => toggleConnection(port)}
                  className={`w-6 h-6 rounded-full border-2 ${activeConnections[port] ? 'bg-emerald-600 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-800 border-zinc-600'}`}
                />
                <span className="text-[7px] font-mono text-zinc-500 uppercase">{port}</span>
              </div>
            ))}
          </div>

          {/* ================== DYNAMIC DIGITAL DSP RACK ANALYZER DECK ================== */}
          <AnimatePresence>
            {showFrontInstruments && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <DigitalSpectrumAnalyzer agentName={title || 'KUDBEE RACK NODE'} />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-2 relative z-20">
            {children}
          </div>
        </div>

        {/* ==================== REAR PANEL (FLIPPED BACK PANEL) ==================== */}
        <div 
          className="absolute inset-0 w-full bg-[#111215] border-2 border-zinc-800 rounded-lg p-4 sm:p-5 shadow-[0_25px_30px_-5px_rgba(0,0,0,0.9)] [backface-visibility:hidden] [transform:rotateY(180deg)] z-30 overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Inner Wrapper flipped horizontally [scaleX(-1)] to fix rear view text mirroring */}
          <div className="w-full h-full flex flex-col justify-between [transform:scaleX(-1)] select-none">
            
            {/* Corner Industrial Chassis Screws (Screenshot 2 Match) */}
            <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-zinc-600 border border-zinc-950 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-0.5 bg-zinc-900 rotate-45" />
            </div>
            <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-zinc-600 border border-zinc-950 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-0.5 bg-zinc-900 -rotate-12" />
            </div>
            <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-zinc-600 border border-zinc-950 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-0.5 bg-zinc-900 rotate-90" />
            </div>
            <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-zinc-600 border border-zinc-950 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-0.5 bg-zinc-900 rotate-30" />
            </div>

            {/* Custom Ventilation Slots */}
            <div className="flex flex-col gap-1.5 opacity-15 w-1/4 absolute top-10 left-6 pointer-events-none">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="h-1 bg-zinc-400 rounded w-full" />
              ))}
            </div>

            {/* Rear Panel Metal Header Bar */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5 px-2 relative z-20">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <div>
                  <h3 className="text-xs font-black text-zinc-300 font-mono tracking-widest uppercase">
                    REAR MODULATION & CV MATRIX
                  </h3>
                  <span className="text-[8px] text-zinc-500 font-mono">CHANNEL ISOLATION IMPEDANCE: 50Ω | BALANCED AUDIO/CV</span>
                </div>
              </div>

              {/* Back Panel Control Buttons */}
              <div className="flex items-center gap-2 z-30">
                <button
                  onClick={triggerCableWobble}
                  className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-400 font-bold text-[9px] uppercase tracking-wider shadow transition-all active:scale-95"
                >
                  ⚡ Shake Cables
                </button>

                <button
                  onClick={handleFlip}
                  className="px-2.5 py-1 rounded bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-md transition-all active:scale-95"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>Front View</span>
                </button>
              </div>
            </div>

            {/* Rear Hardware Module Panels with Metallic Hex Nuts & Cables */}
            <div className="relative flex-1 w-full my-2 min-h-[160px] flex items-center justify-center px-4">
              
              {/* Scaled SVG Cable Overlay */}
              <svg 
                viewBox="0 0 600 160" 
                preserveAspectRatio="none" 
                className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20"
              >
                <defs>
                  {/* Chrome Metal Jack Plug Gradient */}
                  <linearGradient id="chromeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#71717a" />
                    <stop offset="30%" stopColor="#e4e4e7" />
                    <stop offset="70%" stopColor="#a1a1aa" />
                    <stop offset="100%" stopColor="#3f3f46" />
                  </linearGradient>
                </defs>

                {/* Cable 1: Yellow (CV In 1 -> LFO Out) Jack 0 -> Jack 2 */}
                <motion.path 
                  key={`cable-yellow-${cableShakeKey}`}
                  d="M 50,30 C 80,150 220,150 250,30"
                  fill="transparent"
                  stroke="#eab308"
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={{ d: "M 50,30 C 80,150 220,150 250,30" }}
                  animate={{ 
                    d: [
                      "M 50,30 C 80,175 220,175 250,30",
                      "M 50,30 C 75,130 225,130 250,30",
                      "M 50,30 C 85,155 215,155 250,30",
                      "M 50,30 C 80,150 220,150 250,30"
                    ]
                  }}
                  transition={{ type: 'tween', ease: 'easeInOut', duration: 0.5 }}
                  className="opacity-95 cursor-pointer pointer-events-auto filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]"
                  onClick={triggerCableWobble}
                />
                <path d="M 50,30 C 80,150 220,150 250,30" fill="transparent" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" className="opacity-60 pointer-events-none" />

                {/* Cable 2: Pink (CV In 2 -> Sync Out) Jack 1 -> Jack 4 */}
                <motion.path 
                  key={`cable-pink-${cableShakeKey}`}
                  d="M 150,30 C 180,185 420,185 450,30"
                  fill="transparent"
                  stroke="#ec4899"
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={{ d: "M 150,30 C 180,185 420,185 450,30" }}
                  animate={{ 
                    d: [
                      "M 150,30 C 170,210 430,210 450,30",
                      "M 150,30 C 190,160 410,160 450,30",
                      "M 150,30 C 175,195 425,195 450,30",
                      "M 150,30 C 180,185 420,185 450,30"
                    ]
                  }}
                  transition={{ type: 'tween', ease: 'easeInOut', duration: 0.6 }}
                  className="opacity-90 cursor-pointer pointer-events-auto filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]"
                  onClick={triggerCableWobble}
                />
                <path d="M 150,30 C 180,185 420,185 450,30" fill="transparent" stroke="#fbcfe8" strokeWidth="1.5" strokeLinecap="round" className="opacity-50 pointer-events-none" />

                {/* Cable 3: Emerald (Gate In -> Aux Out) Jack 3 -> Jack 5 */}
                <motion.path 
                  key={`cable-green-${cableShakeKey}`}
                  d="M 350,30 C 380,140 520,140 550,30"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={{ d: "M 350,30 C 380,140 520,140 550,30" }}
                  animate={{ 
                    d: [
                      "M 350,30 C 390,165 510,165 550,30",
                      "M 350,30 C 370,120 530,120 550,30",
                      "M 350,30 C 385,148 515,148 550,30",
                      "M 350,30 C 380,140 520,140 550,30"
                    ]
                  }}
                  transition={{ type: 'tween', ease: 'easeInOut', duration: 0.4 }}
                  className="opacity-90 cursor-pointer pointer-events-auto filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]"
                  onClick={triggerCableWobble}
                />
                <path d="M 350,30 C 380,140 520,140 550,30" fill="transparent" stroke="#a7f3d0" strokeWidth="1.5" strokeLinecap="round" className="opacity-50 pointer-events-none" />

                {/* Metallic Chrome 1/4" Phone Jack Plug Barrels over plugged sockets */}
                {[50, 150, 250, 350, 450, 550].map((x, idx) => (
                  <g key={idx} transform={`translate(${x - 6}, 16)`}>
                    {/* Metal Plug Body Barrel */}
                    <rect x="1" y="0" width="10" height="20" rx="2" fill="url(#chromeGradient)" stroke="#27272a" strokeWidth="0.5" />
                    {/* Strain Relief Ribs */}
                    <line x1="2" y1="5" x2="10" y2="5" stroke="#18181b" strokeWidth="1" />
                    <line x1="2" y1="8" x2="10" y2="8" stroke="#18181b" strokeWidth="1" />
                    <line x1="2" y1="11" x2="10" y2="11" stroke="#18181b" strokeWidth="1" />
                    {/* Cable exit collar */}
                    <circle cx="6" cy="20" r="3" fill="#09090b" />
                  </g>
                ))}

              </svg>

              {/* Hardware Hex-Nut Sockets Panel (Matched with Reference Screenshot 2) */}
              <div className="w-full flex justify-around px-2 z-10 relative">
                {[
                  { label: "CV In 1", group: "CV Input", color: "border-yellow-500" },
                  { label: "CV In 2", group: "CV Input", color: "border-pink-500" },
                  { label: "LFO Out", group: "CV Output", color: "border-yellow-500" },
                  { label: "Gate In", group: "External FX", color: "border-emerald-500" },
                  { label: "Sync Out", group: "External FX", color: "border-pink-500" },
                  { label: "Aux Out", group: "External FX", color: "border-emerald-500" }
                ].map((jack, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <span className="text-[7px] font-mono font-bold text-zinc-400 uppercase tracking-tight">{jack.group}</span>
                    
                    {/* Photorealistic Metallic 6-Sided Hex Nut Base */}
                    <div 
                      onClick={triggerCableWobble}
                      className="relative w-10 h-10 flex items-center justify-center cursor-pointer group"
                    >
                      {/* Hex Nut Outer Metal Shell */}
                      <div className="absolute inset-0 bg-gradient-to-b from-zinc-300 via-zinc-500 to-zinc-700 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.8)] border border-zinc-400 flex items-center justify-center p-0.5">
                        <div className="w-full h-full bg-zinc-900 rounded-full border-2 border-zinc-950 flex items-center justify-center shadow-inner">
                          {/* Inner Dark Jack Hole */}
                          <div className={`w-4 h-4 rounded-full bg-black border-2 ${jack.color} flex items-center justify-center`}>
                            <div className="w-2 h-2 rounded-full bg-zinc-950 border border-zinc-700" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <span className="text-[8px] font-mono text-zinc-300 font-bold uppercase">{jack.label}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* Back Chassis Lower Spec Bar */}
            <div className="border-t border-zinc-800/80 pt-2 flex items-center justify-between text-[8px] font-mono text-zinc-500 px-2 z-20">
              <span>MODEL: KUD-THINK-X900</span>
              <span className="text-amber-400 font-bold tracking-wider">CAUTION: HIGH VOLTAGE / DISCONNECT BEFORE SERVICING</span>
              <span>ENGINEERED FOR DECENTRALIZED COMPUTE</span>
            </div>

          </div>
        </div>

      </motion.div>
    </div>
  );
}
