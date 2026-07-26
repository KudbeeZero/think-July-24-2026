import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { Sparkles, RefreshCw, Zap, Sliders, ChevronDown, ChevronUp } from 'lucide-react';

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

  const { playBeep, playHum, playTwist, playPlug, playFlip } = useSoundEffects();

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
                  onClick={handleFlip}
                  className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[9px] font-bold text-zinc-500 uppercase tracking-wider hover:text-zinc-300 transition-colors"
                >
                  REAR
                </button>
              </div>
            </div>
          )}

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

          {/* ================== DYNAMIC SYNTHESIZER OSCILLOSCOPE CONTROL DECK ================== */}
          <AnimatePresence>
            {showFrontInstruments && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 bg-zinc-950 border border-zinc-850 rounded-xl p-3 grid grid-cols-1 md:grid-cols-12 gap-3 overflow-hidden select-none z-20 relative"
              >
                {/* 1. Oscilloscope Screen */}
                <div className="md:col-span-5 bg-[#070b10] border border-emerald-950 rounded-lg p-2 flex flex-col justify-between relative overflow-hidden h-24">
                  {/* Scope Grid lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
                  
                  <div className="flex items-center justify-between text-[8px] font-mono text-emerald-600 tracking-wider z-10 border-b border-emerald-950 pb-0.5">
                    <span>KUDBEE ANALOG WAVE ANALYZER</span>
                    <span className="animate-pulse text-emerald-400 font-bold uppercase">{waveType}</span>
                  </div>

                  {/* Wave Canvas SVG */}
                  <div className="flex-1 w-full flex items-center justify-center relative mt-1">
                    <svg className="w-full h-12 overflow-visible">
                      <path 
                        d={getWavePath()}
                        fill="transparent"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]"
                      />
                    </svg>
                  </div>

                  <div className="text-[7px] font-mono text-emerald-800 flex justify-between z-10 pt-0.5 border-t border-emerald-950">
                    <span>RATE: {oscRate}Hz</span>
                    <span>AMP: {oscAmp}%</span>
                  </div>
                </div>

                {/* 2. Wave selector buttons */}
                <div className="md:col-span-3 flex flex-col justify-between gap-1">
                  <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest text-center md:text-left">WAVE TYPE</span>
                  <div className="grid grid-cols-2 gap-1.5 flex-1">
                    {(['sine', 'square', 'triangle', 'noise'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => {
                          playPlug();
                          setWaveType(type);
                        }}
                        className={`text-[9px] font-bold py-1 px-1 rounded uppercase tracking-tighter transition-colors border ${
                          waveType === type 
                            ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-black shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Rotary Dials */}
                <div className="md:col-span-4 flex items-center justify-around bg-zinc-900 border border-zinc-850 rounded-lg p-1">
                  
                  {/* Knob 1: RATE */}
                  <div className="flex flex-col items-center select-none w-16">
                    <span className="text-[7px] text-zinc-500 uppercase font-black tracking-widest mb-1">RATE</span>
                    <div 
                      className="relative w-10 h-10 rounded-full bg-zinc-850 border border-zinc-950 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-pointer group hover:border-zinc-700 transition-colors"
                      onClick={() => {
                        const nextVal = oscRate >= 100 ? 10 : oscRate + 10;
                        setOscRate(nextVal);
                        playTwist(250 + nextVal * 3);
                      }}
                    >
                      {/* Rotary Line */}
                      <div 
                        className="absolute w-1 h-3 bg-emerald-500 rounded-full top-1 origin-bottom transition-transform duration-300"
                        style={{ transform: `rotate(${((oscRate - 10) / 90) * 270 - 135}deg)` }}
                      />
                      <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 shadow-inner" />
                    </div>
                    <span className="text-[9px] font-mono text-zinc-300 font-extrabold mt-1">{oscRate}Hz</span>
                  </div>

                  {/* Knob 2: AMPLITUDE */}
                  <div className="flex flex-col items-center select-none w-16">
                    <span className="text-[7px] text-zinc-500 uppercase font-black tracking-widest mb-1">AMP</span>
                    <div 
                      className="relative w-10 h-10 rounded-full bg-zinc-850 border border-zinc-950 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-pointer group hover:border-zinc-700 transition-colors"
                      onClick={() => {
                        const nextVal = oscAmp >= 100 ? 10 : oscAmp + 15;
                        setOscAmp(nextVal);
                        playTwist(200 + nextVal * 2);
                      }}
                    >
                      {/* Rotary Line */}
                      <div 
                        className="absolute w-1 h-3 bg-amber-500 rounded-full top-1 origin-bottom transition-transform duration-300"
                        style={{ transform: `rotate(${((oscAmp - 10) / 90) * 270 - 135}deg)` }}
                      />
                      <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 shadow-inner" />
                    </div>
                    <span className="text-[9px] font-mono text-zinc-300 font-extrabold mt-1">{oscAmp}%</span>
                  </div>

                </div>

              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-2 relative z-20">
            {children}
          </div>
        </div>

        {/* ==================== REAR PANEL (FLIPPED BACK PANEL) ==================== */}
        <div 
          className="absolute inset-0 w-full bg-[#0a0a0d] border-t-2 border-l-2 border-zinc-700 border-b-2 border-r-2 border-zinc-950 rounded-lg p-5 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.8)] [backface-visibility:hidden] [transform:rotateY(180deg)] z-30 overflow-hidden flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Custom Ventilation Slots */}
          <div className="flex flex-col gap-1.5 opacity-20 w-1/3 absolute top-6 left-6 pointer-events-none">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="h-1 bg-zinc-400 rounded w-full" />
            ))}
          </div>

          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-500" />
              <div>
                <h3 className="text-xs font-black text-zinc-400 font-mono tracking-widest uppercase">
                  REAR MODULATION & CV MATRIX
                </h3>
                <span className="text-[8px] text-zinc-600 font-mono">CHANNEL ISOLATION IMPEDANCE: 50Ω</span>
              </div>
            </div>

            {/* Back Panel Control switches */}
            <div className="flex items-center gap-2">
              <button
                onClick={triggerCableWobble}
                className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-yellow-500 font-bold text-[9px] uppercase tracking-wider shadow-sm transition-all active:scale-95"
              >
                ⚡ Shake Cables
              </button>

              <button
                onClick={handleFlip}
                className="px-2.5 py-1 rounded bg-gradient-to-r from-zinc-800 to-zinc-900 border border-zinc-700 hover:from-zinc-750 text-yellow-500 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-md transition-all hover:scale-105 active:scale-95"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Front View</span>
              </button>
            </div>
          </div>

          {/* Swinging Patch Cables & Sockets Area */}
          <div className="relative flex-1 w-full flex items-center justify-around my-4 min-h-[140px]">
            {/* SVG Cable Overlay with Wobble Animations */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              
              {/* Cable 1: Yellow (CV Out to LFO In) */}
              <motion.path 
                key={`cable-yellow-${cableShakeKey}`}
                d="M 60,60 C 100,180 180,180 220,60"
                fill="transparent"
                stroke="#eab308"
                strokeWidth="5"
                strokeLinecap="round"
                initial={{ d: "M 60,60 C 100,180 180,180 220,60" }}
                animate={{ 
                  d: [
                    "M 60,60 C 100,210 180,210 220,60",
                    "M 60,60 C 95,160 185,160 220,60",
                    "M 60,60 C 105,190 175,190 220,60",
                    "M 60,60 C 100,180 180,180 220,60"
                  ]
                }}
                transition={{ 
                  type: 'tween', 
                  ease: 'easeInOut',
                  duration: 0.5 
                }}
                className="opacity-90 cursor-pointer pointer-events-auto"
                onClick={triggerCableWobble}
              />
              <path d="M 60,60 C 100,180 180,180 220,60" fill="transparent" stroke="#ca8a04" strokeWidth="1.5" strokeLinecap="round" className="opacity-50 pointer-events-none" />

              {/* Cable 2: Pink (Sync Out to Rate In) */}
              <motion.path 
                key={`cable-pink-${cableShakeKey}`}
                d="M 140,60 C 110,230 250,230 300,60"
                fill="transparent"
                stroke="#ec4899"
                strokeWidth="5"
                strokeLinecap="round"
                initial={{ d: "M 140,60 C 110,230 250,230 300,60" }}
                animate={{ 
                  d: [
                    "M 140,60 C 100,270 260,270 300,60",
                    "M 140,60 C 120,200 240,200 300,60",
                    "M 140,60 C 115,245 245,245 300,60",
                    "M 140,60 C 110,230 250,230 300,60"
                  ]
                }}
                transition={{ 
                  type: 'tween', 
                  ease: 'easeInOut',
                  duration: 0.6
                }}
                className="opacity-80 cursor-pointer pointer-events-auto"
                onClick={triggerCableWobble}
              />
              <path d="M 140,60 C 110,230 250,230 300,60" fill="transparent" stroke="#be185d" strokeWidth="1.5" strokeLinecap="round" className="opacity-40 pointer-events-none" />

              {/* Cable 3: Emerald (Aux Out to Extra Gate) */}
              <motion.path 
                key={`cable-green-${cableShakeKey}`}
                d="M 220,60 C 260,190 320,190 380,60"
                fill="transparent"
                stroke="#10b981"
                strokeWidth="5"
                strokeLinecap="round"
                initial={{ d: "M 220,60 C 260,190 320,190 380,60" }}
                animate={{ 
                  d: [
                    "M 220,60 C 270,220 310,220 380,60",
                    "M 220,60 C 250,170 330,170 380,60",
                    "M 220,60 C 265,200 315,200 380,60",
                    "M 220,60 C 260,190 320,190 380,60"
                  ]
                }}
                transition={{ 
                  type: 'tween', 
                  ease: 'easeInOut',
                  duration: 0.4
                }}
                className="opacity-80 cursor-pointer pointer-events-auto"
                onClick={triggerCableWobble}
              />
              <path d="M 220,60 C 260,190 320,190 380,60" fill="transparent" stroke="#047857" strokeWidth="1.5" strokeLinecap="round" className="opacity-40 pointer-events-none" />

            </svg>

            {/* Rear Jack Sockets (aligned with cable ends above) */}
            <div className="absolute top-4 left-0 w-full flex justify-around px-8 z-20">
              {[
                { label: "CV In 1", color: "border-yellow-500" },
                { label: "CV In 2", color: "border-pink-500" },
                { label: "LFO Out", color: "border-yellow-500" },
                { label: "Gate In", color: "border-emerald-500" },
                { label: "Sync Out", color: "border-pink-500" },
                { label: "Aux Out", color: "border-emerald-500" }
              ].map((jack, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div 
                    onClick={triggerCableWobble}
                    className={`w-9 h-9 rounded-full bg-zinc-900 border-4 ${jack.color} shadow-[inset_0_4px_8px_rgba(0,0,0,1),0_2px_4px_rgba(255,255,255,0.05)] flex items-center justify-center cursor-pointer hover:bg-zinc-800 transition-colors`}
                  >
                    {/* Metal center nut */}
                    <div className="w-4 h-4 rounded-full bg-zinc-700 border-2 border-zinc-950 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-black" />
                    </div>
                  </div>
                  <span className="text-[7px] font-mono text-zinc-500 uppercase tracking-tighter">{jack.label}</span>
                </div>
              ))}
            </div>

          </div>

          {/* Back Chassis lower bar with specifications */}
          <div className="border-t border-zinc-900/60 pt-2 flex items-center justify-between text-[8px] font-mono text-zinc-600">
            <span>MODEL: KUD-THINK-X900</span>
            <span className="text-amber-500 font-bold">WARNING: DISCONNECT POWER BEFORE SERVICING</span>
            <span>MANUFACTURED IN SWEDEN</span>
          </div>

        </div>

      </motion.div>
    </div>
  );
}
