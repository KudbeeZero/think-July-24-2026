import React, { useState, useEffect } from 'react';
import { Activity, Radio, Cpu, BarChart2, Shield, Zap, RefreshCw, Volume2, Sliders, Power, Disc } from 'lucide-react';
import { useSoundEffects } from '../../hooks/useSoundEffects';

interface DigitalSpectrumAnalyzerProps {
  agentName?: string;
  latencyMs?: number;
  status?: string;
  className?: string;
  compact?: boolean;
}

export function DigitalSpectrumAnalyzer({
  agentName = 'KUDBEE NODE',
  latencyMs = 12,
  status = 'working',
  className = '',
  compact = false
}: DigitalSpectrumAnalyzerProps) {
  const [analyzerMode, setAnalyzerMode] = useState<'fft' | 'scope' | 'vector' | 'logic'>('fft');
  const [gain, setGain] = useState<number>(75);
  const [timebase, setTimebase] = useState<number>(40);
  const [fftSize, setFftSize] = useState<'1024' | '2048' | '4096'>('2048');
  const [decaySpeed, setDecaySpeed] = useState<'fast' | 'med' | 'slow'>('med');
  const [powerOn, setPowerOn] = useState<boolean>(true);
  const [bypassMode, setBypassMode] = useState<boolean>(false);
  
  const [phaseTime, setPhaseTime] = useState<number>(0);
  const [peakLevels, setPeakLevels] = useState<number[]>([ -3.2, -4.1 ]);
  
  // Array of 24 frequency band bars
  const [fftBars, setFftBars] = useState<number[]>(() => Array(24).fill(20));
  const [peakHolds, setPeakHolds] = useState<number[]>(() => Array(24).fill(20));

  const { playPlug, playTwist, playBeep, playFlip } = useSoundEffects();

  // Real-time animation loop for spectrum & scope
  useEffect(() => {
    if (!powerOn) return;
    let animId: number;
    let stepCount = 0;

    const updateVisuals = () => {
      stepCount++;
      setPhaseTime(prev => (prev + 0.08) % (Math.PI * 2));

      // Fluctuate FFT bars dynamically
      setFftBars(prevBars => {
        return prevBars.map((oldVal, idx) => {
          if (bypassMode) return Math.max(4, oldVal * 0.85);
          const centerFactor = 1 - Math.abs(idx - 11) / 14;
          const noise = (Math.random() - 0.48) * 22;
          const target = Math.min(98, Math.max(8, (oldVal * 0.6) + (centerFactor * (gain * 0.8) + noise)));
          return target;
        });
      });

      // Update peak holds with decay
      setPeakHolds(prevPeaks => {
        const decayAmount = decaySpeed === 'fast' ? 3.5 : decaySpeed === 'med' ? 1.8 : 0.8;
        return prevPeaks.map((oldPeak, idx) => {
          const currentBar = fftBars[idx] || 0;
          if (currentBar >= oldPeak) {
            return currentBar;
          }
          return Math.max(0, oldPeak - decayAmount);
        });
      });

      // Fluctuate dual-channel peak meters
      if (stepCount % 5 === 0) {
        setPeakLevels([
          Number((-Math.random() * 8 - (status === 'working' ? 1.2 : 14.5)).toFixed(1)),
          Number((-Math.random() * 8 - (status === 'working' ? 1.8 : 15.1)).toFixed(1))
        ]);
      }

      animId = requestAnimationFrame(updateVisuals);
    };

    animId = requestAnimationFrame(updateVisuals);
    return () => cancelAnimationFrame(animId);
  }, [gain, timebase, decaySpeed, status, fftBars, powerOn, bypassMode]);

  // Generate SVG Scope Waveform Path
  const getScopePath = (channel: 1 | 2) => {
    const width = 320;
    const height = 76;
    const points: string[] = [];
    const step = 2;

    for (let x = 0; x <= width; x += step) {
      let y = height / 2;
      if (!bypassMode) {
        const freqMultiplier = timebase * 0.12;
        const angle = (x / width) * freqMultiplier + (channel === 1 ? phaseTime * 3 : phaseTime * 2.5 + Math.PI / 4);

        if (channel === 1) {
          const harmonic1 = Math.sin(angle) * (gain * 0.32);
          const harmonic2 = Math.sin(angle * 2.5) * (gain * 0.10);
          const noise = (Math.random() - 0.5) * (status === 'working' ? 2.5 : 0.8);
          y += harmonic1 + harmonic2 + noise;
        } else {
          const squareWave = (Math.sin(angle * 0.8) >= 0 ? 1 : -1) * (gain * 0.22);
          y += squareWave;
        }
      }

      points.push(`${x},${y.toFixed(1)}`);
    }

    return `M ${points.join(' L ')}`;
  };

  // Generate Vector Lissajous Points
  const getVectorPoints = () => {
    const count = 36;
    const pts: { x: number; y: number }[] = [];
    const cx = 100;
    const cy = 38;

    for (let i = 0; i < count; i++) {
      const t = phaseTime + (i * Math.PI * 2) / count;
      const r = bypassMode ? 5 : (gain * 0.30) * (0.8 + 0.2 * Math.sin(t * 3));
      const x = cx + r * Math.sin(t * 2);
      const y = cy + r * Math.cos(t * 3);
      pts.push({ x, y });
    }
    return pts;
  };

  return (
    <div className={`w-full bg-gradient-to-b from-[#1c202a] via-[#12151d] to-[#0c0e14] border-t-2 border-t-zinc-600 border-x-2 border-x-zinc-800 border-b-2 border-b-zinc-950 rounded-xl p-3 sm:p-4 shadow-[0_15px_35px_rgba(0,0,0,0.85)] relative overflow-hidden select-none font-mono ${className}`}>
      
      {/* Rack Metallic Faceplate Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_70%)] pointer-events-none" />

      {/* Top Rack Screws & Unit Header */}
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-zinc-800/90 shadow-[0_1px_0_rgba(255,255,255,0.05)] relative z-10">
        <div className="flex items-center gap-2.5">
          {/* Metallic Hex Screw */}
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-zinc-500 via-zinc-700 to-zinc-900 border border-zinc-950 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] flex items-center justify-center">
            <div className="w-2 h-0.5 bg-zinc-950 rotate-45" />
          </div>

          {/* Dymo / Tape Label Badge */}
          <div className="bg-[#e6e2d8] text-zinc-950 font-black text-[9px] px-2 py-0.5 rounded-sm shadow-[1px_2px_4px_rgba(0,0,0,0.6)] font-mono tracking-wider border border-zinc-400 rotate-[-0.5deg]">
            DSP-96K // {agentName.toUpperCase()}
          </div>

          <span className="hidden sm:inline-flex text-[9px] font-black text-cyan-400 tracking-widest uppercase items-center gap-1.5 ml-1">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            DIGITAL SPECTRUM RACK
          </span>
        </div>

        {/* Live Hardware Metering & Power */}
        <div className="flex items-center gap-3">
          {/* Latency badge */}
          <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2 py-1 rounded shadow-inner">
            <span className="text-[8px] text-zinc-500 font-bold uppercase">LATENCY:</span>
            <span className={`text-[10px] font-extrabold font-mono ${latencyMs <= 20 ? 'text-emerald-400' : latencyMs <= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {powerOn ? `${latencyMs}ms` : 'OFF'}
            </span>
          </div>

          {/* Backlit Power Rocker Switch */}
          <button
            onClick={() => {
              playFlip();
              setPowerOn(prev => !prev);
            }}
            className={`px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-1 border transition-all cursor-pointer shadow-md ${
              powerOn
                ? 'bg-red-600 text-white border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.7)]'
                : 'bg-zinc-900 text-zinc-600 border-zinc-800'
            }`}
          >
            <Power className="w-3 h-3" />
            <span>{powerOn ? 'PWR ON' : 'OFF'}</span>
          </button>

          {/* Metallic Hex Screw */}
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-zinc-500 via-zinc-700 to-zinc-900 border border-zinc-950 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] flex items-center justify-center">
            <div className="w-2 h-0.5 bg-zinc-950 -rotate-45" />
          </div>
        </div>
      </div>

      {/* Main Rack Deck Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 relative z-10">
        
        {/* Left: Compact OLED Screen Glass Display (8 cols) */}
        <div className={`lg:col-span-8 bg-[#03060a] border-2 border-zinc-800/90 rounded-lg p-2.5 relative overflow-hidden flex flex-col justify-between shadow-[inset_0_4px_20px_rgba(0,0,0,0.95)] transition-opacity duration-300 ${powerOn ? 'opacity-100' : 'opacity-25'}`}>
          
          {/* Glass Glare Reflection Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-20" />
          
          {/* Screen Scanlines Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:8px_8px] pointer-events-none" />

          {/* Top OLED Header Metrics */}
          <div className="flex items-center justify-between text-[8px] font-mono border-b border-cyan-950/80 pb-1 z-10 text-zinc-400">
            <div className="flex items-center gap-2.5">
              <span>NODE: <strong className="text-zinc-200">{agentName}</strong></span>
              <span className="hidden sm:inline">L: <strong className="text-emerald-400">{powerOn ? `${peakLevels[0]}dB` : '-inf'}</strong></span>
              <span className="hidden sm:inline">R: <strong className="text-emerald-400">{powerOn ? `${peakLevels[1]}dB` : '-inf'}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold uppercase tracking-wider">{analyzerMode} MODE</span>
              <span className="text-zinc-600">FFT: {fftSize}</span>
            </div>
          </div>

          {/* Compact OLED Canvas Display */}
          <div className="flex-1 my-1.5 relative flex items-center justify-center z-10 overflow-hidden min-h-[110px]">
            {analyzerMode === 'fft' && (
              <div className="w-full h-24 flex items-end justify-between gap-1 px-1 relative">
                {/* dB Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-25 text-[7px] text-cyan-400">
                  <div className="border-b border-cyan-500/40 w-full flex justify-between"><span>0 dB</span><span>CLIP</span></div>
                  <div className="border-b border-cyan-500/20 w-full"><span>-18 dB</span></div>
                  <div className="border-b border-cyan-500/20 w-full"><span>-36 dB</span></div>
                  <div className="border-b border-cyan-500/20 w-full"><span>-60 dB</span></div>
                </div>

                {/* 24 Digital LED Spectrum Towers */}
                {fftBars.map((barVal, idx) => {
                  const peakVal = peakHolds[idx] || 0;
                  return (
                    <div key={idx} className="flex-1 h-full flex flex-col justify-end items-center relative">
                      {/* Floating Peak Hold Dot */}
                      {powerOn && (
                        <div 
                          className="w-full h-1 bg-cyan-300 rounded-sm absolute transition-all duration-75 shadow-[0_0_6px_rgba(6,182,212,0.9)] z-20"
                          style={{ bottom: `${Math.min(96, peakVal)}%` }}
                        />
                      )}
                      {/* Stacked LED Column */}
                      <div className="w-full bg-zinc-950/90 rounded-sm overflow-hidden flex flex-col justify-end p-0.5 border border-zinc-900 h-full">
                        {powerOn && (
                          <div 
                            className="w-full rounded-sm transition-all duration-75 bg-gradient-to-t from-emerald-500 via-cyan-400 to-amber-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                            style={{ height: `${Math.min(100, barVal)}%` }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {analyzerMode === 'scope' && (
              <div className="w-full h-24 relative flex items-center justify-center">
                <svg className="w-full h-full overflow-visible">
                  <line x1="0" y1="38" x2="320" y2="38" stroke="#164e63" strokeWidth="1" strokeDasharray="2,2" />
                  <line x1="160" y1="0" x2="160" y2="76" stroke="#164e63" strokeWidth="1" strokeDasharray="2,2" />

                  {/* Channel 2 Reference */}
                  <path 
                    d={getScopePath(2)} 
                    fill="none" 
                    stroke="#ec4899" 
                    strokeWidth="1.5" 
                    strokeDasharray="4,2" 
                    className="opacity-70"
                  />

                  {/* Channel 1 Main Telemetry Signal */}
                  <path 
                    d={getScopePath(1)} 
                    fill="none" 
                    stroke="#06b6d4" 
                    strokeWidth="2.2" 
                    strokeLinecap="round" 
                    className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                  />
                </svg>
              </div>
            )}

            {analyzerMode === 'vector' && (
              <div className="w-full h-24 relative flex items-center justify-center">
                <svg className="w-64 h-24 overflow-visible">
                  <circle cx="100" cy="38" r="32" fill="none" stroke="#164e63" strokeWidth="1" strokeDasharray="2,2" />
                  <circle cx="100" cy="38" r="18" fill="none" stroke="#164e63" strokeWidth="1" strokeDasharray="2,2" />
                  <line x1="60" y1="38" x2="140" y2="38" stroke="#164e63" strokeWidth="1" />
                  <line x1="100" y1="6" x2="100" y2="70" stroke="#164e63" strokeWidth="1" />

                  {getVectorPoints().map((pt, i) => (
                    <circle
                      key={i}
                      cx={pt.x}
                      cy={pt.y}
                      r={i % 3 === 0 ? 2 : 1}
                      fill={i % 2 === 0 ? '#06b6d4' : '#10b981'}
                      className="animate-pulse"
                    />
                  ))}
                </svg>
              </div>
            )}

            {analyzerMode === 'logic' && (
              <div className="w-full h-24 flex flex-col justify-around text-[7px] font-mono">
                {['CLK', 'TX_DATA', 'RX_ACK', 'SYNC'].map((line, lIdx) => (
                  <div key={line} className="flex items-center gap-1.5">
                    <span className="w-10 text-zinc-500 font-bold">{line}</span>
                    <div className="flex-1 h-2.5 flex items-center border-b border-cyan-950 relative overflow-hidden">
                      <div className="flex gap-0.5 w-full">
                        {Array.from({ length: 32 }).map((_, bIdx) => {
                          const high = powerOn && (bIdx + lIdx + Math.floor(phaseTime * 5)) % 3 === 0;
                          return (
                            <div
                              key={bIdx}
                              className={`flex-1 ${high ? 'h-2 bg-cyan-400 shadow-[0_0_4px_rgba(6,182,212,0.8)]' : 'h-0.5 bg-zinc-800'}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* OLED Footer Scale */}
          <div className="flex items-center justify-between text-[7px] font-mono text-zinc-600 border-t border-cyan-950/80 pt-1 z-10">
            <span>20Hz</span>
            <span>500Hz</span>
            <span>2kHz</span>
            <span>8kHz</span>
            <span>20kHz</span>
            <span>SNR: 108.4dB</span>
          </div>
        </div>

        {/* Right: Tactile Hardware Control Rack Panel (4 cols) */}
        <div className="lg:col-span-4 bg-gradient-to-b from-[#131720] to-[#0c0f16] border border-zinc-800 rounded-lg p-3 flex flex-col justify-between gap-2.5 shadow-inner">
          
          {/* Mode Selector Backlit Pushbuttons */}
          <div>
            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">
              ANALYZER MODE
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {(['fft', 'scope', 'vector', 'logic'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => {
                    playPlug();
                    setAnalyzerMode(mode);
                  }}
                  className={`text-[8px] font-black py-1.5 px-2 rounded uppercase tracking-wider border transition-all cursor-pointer shadow-md ${
                    analyzerMode === mode
                      ? 'bg-cyan-500 text-zinc-950 border-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Tactile Rotary Dial Controls */}
          <div className="grid grid-cols-2 gap-2 bg-black/60 border border-zinc-800/90 rounded-lg p-2.5 shadow-inner">
            {/* Knob 1: GAIN */}
            <div className="flex flex-col items-center">
              <span className="text-[7px] text-zinc-400 uppercase font-bold tracking-wider mb-1">DSP GAIN</span>
              <div 
                className="relative w-11 h-11 rounded-full bg-gradient-to-br from-zinc-700 via-zinc-900 to-black border-2 border-zinc-700 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_4px_8px_rgba(0,0,0,0.8)] flex items-center justify-center cursor-pointer group hover:border-cyan-400 transition-colors"
                onClick={() => {
                  const next = gain >= 100 ? 20 : gain + 15;
                  setGain(next);
                  playTwist(300 + next * 3);
                }}
              >
                {/* Metallic Cap */}
                <div className="w-5 h-5 rounded-full bg-zinc-950 border border-zinc-700 shadow-inner" />
                {/* Rotary Pointer Line */}
                <div 
                  className="absolute w-1 h-4 bg-cyan-400 rounded-full top-0.5 origin-bottom transition-transform duration-200 shadow-[0_0_6px_rgba(6,182,212,0.8)]"
                  style={{ transform: `rotate(${((gain - 10) / 90) * 270 - 135}deg)` }}
                />
              </div>
              <span className="text-[9px] text-zinc-300 font-extrabold font-mono mt-1">{gain}%</span>
            </div>

            {/* Knob 2: TIMEBASE */}
            <div className="flex flex-col items-center">
              <span className="text-[7px] text-zinc-400 uppercase font-bold tracking-wider mb-1">TIMEBASE</span>
              <div 
                className="relative w-11 h-11 rounded-full bg-gradient-to-br from-zinc-700 via-zinc-900 to-black border-2 border-zinc-700 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_4px_8px_rgba(0,0,0,0.8)] flex items-center justify-center cursor-pointer group hover:border-amber-400 transition-colors"
                onClick={() => {
                  const next = timebase >= 100 ? 10 : timebase + 15;
                  setTimebase(next);
                  playTwist(250 + next * 3);
                }}
              >
                <div className="w-5 h-5 rounded-full bg-zinc-950 border border-zinc-700 shadow-inner" />
                <div 
                  className="absolute w-1 h-4 bg-amber-400 rounded-full top-0.5 origin-bottom transition-transform duration-200 shadow-[0_0_6px_rgba(245,158,11,0.8)]"
                  style={{ transform: `rotate(${((timebase - 10) / 90) * 270 - 135}deg)` }}
                />
              </div>
              <span className="text-[9px] text-zinc-300 font-extrabold font-mono mt-1">{timebase}ms</span>
            </div>
          </div>

          {/* Hardware Jack Out & Bypass */}
          <div className="flex items-center justify-between text-[8px] bg-black/40 p-1.5 rounded border border-zinc-850">
            <button
              onClick={() => {
                playFlip();
                setBypassMode(prev => !prev);
              }}
              className={`px-2 py-0.5 rounded font-black border transition-all cursor-pointer ${
                bypassMode ? 'bg-amber-500 text-black border-amber-300' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
              }`}
            >
              {bypassMode ? 'BYPASS ACTIVE' : 'BYPASS'}
            </button>

            {/* BNC / Jack Audio Output */}
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 font-bold">DSP OUT</span>
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 border-2 border-zinc-900 shadow-sm flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-black" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

