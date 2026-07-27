import React, { useState, useEffect, useRef } from 'react';
import { Activity, Radio, Cpu, BarChart2, Shield, Zap, RefreshCw, Volume2, Sliders } from 'lucide-react';
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
  
  const [phaseTime, setPhaseTime] = useState<number>(0);
  const [peakLevels, setPeakLevels] = useState<number[]>([ -3.2, -4.1 ]);
  
  // Array of 24 frequency band bars
  const [fftBars, setFftBars] = useState<number[]>(() => Array(24).fill(20));
  const [peakHolds, setPeakHolds] = useState<number[]>(() => Array(24).fill(20));

  const { playPlug, playTwist, playBeep } = useSoundEffects();

  // Real-time animation loop for spectrum & scope
  useEffect(() => {
    let animId: number;
    let stepCount = 0;

    const updateVisuals = () => {
      stepCount++;
      setPhaseTime(prev => (prev + 0.08) % (Math.PI * 2));

      // Fluctuate FFT bars dynamically
      setFftBars(prevBars => {
        return prevBars.map((oldVal, idx) => {
          // Center frequencies have higher energy
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
  }, [gain, timebase, decaySpeed, status, fftBars]);

  // Generate SVG Scope Waveform Path
  const getScopePath = (channel: 1 | 2) => {
    const width = 320;
    const height = 90;
    const points: string[] = [];
    const step = 2;

    for (let x = 0; x <= width; x += step) {
      let y = height / 2;
      const freqMultiplier = timebase * 0.12;
      const angle = (x / width) * freqMultiplier + (channel === 1 ? phaseTime * 3 : phaseTime * 2.5 + Math.PI / 4);

      if (channel === 1) {
        // Digital composite signal with harmonics
        const harmonic1 = Math.sin(angle) * (gain * 0.38);
        const harmonic2 = Math.sin(angle * 2.5) * (gain * 0.12);
        const noise = (Math.random() - 0.5) * (status === 'working' ? 3 : 1);
        y += harmonic1 + harmonic2 + noise;
      } else {
        // Carrier / Reference Clock Pulse
        const squareWave = (Math.sin(angle * 0.8) >= 0 ? 1 : -1) * (gain * 0.28);
        y += squareWave;
      }

      points.push(`${x},${y.toFixed(1)}`);
    }

    return `M ${points.join(' L ')}`;
  };

  // Generate Vector Lissajous Points
  const getVectorPoints = () => {
    const count = 40;
    const pts: { x: number; y: number }[] = [];
    const cx = 100;
    const cy = 45;

    for (let i = 0; i < count; i++) {
      const t = phaseTime + (i * Math.PI * 2) / count;
      const r = (gain * 0.35) * (0.8 + 0.2 * Math.sin(t * 3));
      const x = cx + r * Math.sin(t * 2);
      const y = cy + r * Math.cos(t * 3);
      pts.push({ x, y });
    }
    return pts;
  };

  return (
    <div className={`w-full bg-[#0a0d14] border-2 border-zinc-800 rounded-xl p-3 sm:p-4 shadow-2xl relative overflow-hidden select-none font-mono ${className}`}>
      {/* Top Metallic Rack Screws & Status Bar */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          {/* Hardware screw */}
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 border border-zinc-900 shadow-inner flex items-center justify-center">
            <div className="w-1.5 h-0.5 bg-zinc-950 rotate-45" />
          </div>
          <span className="text-[10px] sm:text-xs font-black text-cyan-400 tracking-widest uppercase flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            KUDBEE DIGITAL DSP RACK SCOPE
          </span>
          <span className="hidden sm:inline-block text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800/60 px-2 py-0.5 rounded font-bold uppercase">
            96kHz / 24-BIT
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Node Health Indicators */}
          <div className="flex items-center gap-1.5 bg-black/60 border border-zinc-800 px-2.5 py-1 rounded-lg">
            <span className="text-[9px] text-zinc-500 font-bold uppercase">LATENCY:</span>
            <span className={`text-[11px] font-bold font-mono ${latencyMs <= 20 ? 'text-emerald-400' : latencyMs <= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {latencyMs}ms
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-black/60 border border-zinc-800 px-2.5 py-1 rounded-lg">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === 'working' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'working' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${status === 'working' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {status.toUpperCase()}
            </span>
          </div>

          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 border border-zinc-900 shadow-inner flex items-center justify-center">
            <div className="w-1.5 h-0.5 bg-zinc-950 -rotate-45" />
          </div>
        </div>
      </div>

      {/* Main Rack Instruments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left Column: OLED Digital Screen Display (8 cols) */}
        <div className="lg:col-span-8 bg-[#04070c] border border-cyan-900/50 rounded-lg p-3 relative overflow-hidden flex flex-col justify-between min-h-[180px] shadow-[inset_0_2px_12px_rgba(0,0,0,0.9)]">
          {/* OLED Digital Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.04)_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />
          
          {/* Top OLED Header Metrics */}
          <div className="flex items-center justify-between text-[9px] font-mono border-b border-cyan-950/80 pb-1 z-10">
            <div className="flex items-center gap-3">
              <span className="text-zinc-500">TARGET: <strong className="text-zinc-200">{agentName}</strong></span>
              <span className="text-zinc-500">PEAK L: <strong className="text-emerald-400">{peakLevels[0]} dBFS</strong></span>
              <span className="text-zinc-500">PEAK R: <strong className="text-emerald-400">{peakLevels[1]} dBFS</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold uppercase tracking-wider">{analyzerMode} MODE</span>
              <span className="text-zinc-600">FFT: {fftSize} PTS</span>
            </div>
          </div>

          {/* Center Screen: Display Mode Canvas */}
          <div className="flex-1 my-2 relative flex items-center justify-center z-10 overflow-hidden">
            {analyzerMode === 'fft' && (
              <div className="w-full h-28 flex items-end justify-between gap-1 px-1 relative">
                {/* dB Scale lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 text-[8px] text-cyan-400">
                  <div className="border-b border-cyan-500/50 w-full flex justify-between"><span>0 dBFS</span><span>OVERLOAD</span></div>
                  <div className="border-b border-cyan-500/30 w-full"><span>-12 dB</span></div>
                  <div className="border-b border-cyan-500/30 w-full"><span>-24 dB</span></div>
                  <div className="border-b border-cyan-500/30 w-full"><span>-36 dB</span></div>
                  <div className="border-b border-cyan-500/20 w-full"><span>-60 dBFS</span></div>
                </div>

                {/* 24 Digital LED Spectrum Towers */}
                {fftBars.map((barVal, idx) => {
                  const peakVal = peakHolds[idx] || 0;
                  return (
                    <div key={idx} className="flex-1 h-full flex flex-col justify-end items-center relative group">
                      {/* Floating Peak Hold Dot */}
                      <div 
                        className="w-full h-1 bg-cyan-300 rounded-sm absolute transition-all duration-75 shadow-[0_0_6px_rgba(6,182,212,0.9)] z-20"
                        style={{ bottom: `${Math.min(96, peakVal)}%` }}
                      />
                      {/* Stacked LED Column */}
                      <div className="w-full bg-zinc-950/80 rounded-sm overflow-hidden flex flex-col justify-end p-0.5 border border-zinc-900 h-full">
                        <div 
                          className="w-full rounded-sm transition-all duration-75 bg-gradient-to-t from-emerald-500 via-cyan-400 to-amber-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                          style={{ height: `${Math.min(100, barVal)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {analyzerMode === 'scope' && (
              <div className="w-full h-28 relative flex items-center justify-center">
                <svg className="w-full h-full overflow-visible">
                  {/* Scope Horizontal & Vertical Zero-Cross Axes */}
                  <line x1="0" y1="45" x2="320" y2="45" stroke="#164e63" strokeWidth="1" strokeDasharray="2,2" />
                  <line x1="160" y1="0" x2="160" y2="90" stroke="#164e63" strokeWidth="1" strokeDasharray="2,2" />

                  {/* Channel 2 Reference Carrier (Magenta) */}
                  <path 
                    d={getScopePath(2)} 
                    fill="none" 
                    stroke="#ec4899" 
                    strokeWidth="1.5" 
                    strokeDasharray="4,2" 
                    className="opacity-70"
                  />

                  {/* Channel 1 Primary Telemetry Signal (Cyan) */}
                  <path 
                    d={getScopePath(1)} 
                    fill="none" 
                    stroke="#06b6d4" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                  />
                </svg>
              </div>
            )}

            {analyzerMode === 'vector' && (
              <div className="w-full h-28 relative flex items-center justify-center">
                <svg className="w-64 h-28 overflow-visible">
                  {/* Radar Scope Rings */}
                  <circle cx="100" cy="45" r="40" fill="none" stroke="#164e63" strokeWidth="1" strokeDasharray="2,2" />
                  <circle cx="100" cy="45" r="25" fill="none" stroke="#164e63" strokeWidth="1" strokeDasharray="2,2" />
                  <line x1="60" y1="45" x2="140" y2="45" stroke="#164e63" strokeWidth="1" />
                  <line x1="100" y1="5" x2="100" y2="85" stroke="#164e63" strokeWidth="1" />

                  {/* Constellation Vector Points */}
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
              <div className="w-full h-28 flex flex-col justify-around text-[8px] font-mono">
                {['CLK', 'TX_DATA', 'RX_ACK', 'SYNC'].map((line, lIdx) => (
                  <div key={line} className="flex items-center gap-2">
                    <span className="w-12 text-zinc-500 font-bold">{line}</span>
                    <div className="flex-1 h-3 flex items-center border-b border-cyan-950 relative overflow-hidden">
                      <div className="flex gap-0.5 w-full">
                        {Array.from({ length: 32 }).map((_, bIdx) => {
                          const high = (bIdx + lIdx + Math.floor(phaseTime * 5)) % 3 === 0;
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

          {/* OLED Footer Frequency Scale */}
          <div className="flex items-center justify-between text-[8px] font-mono text-zinc-600 border-t border-cyan-950/80 pt-1 z-10">
            <span>20Hz</span>
            <span>250Hz</span>
            <span>1kHz</span>
            <span>4kHz</span>
            <span>16kHz</span>
            <span>SNR: 104.2dB</span>
          </div>
        </div>

        {/* Right Column: Digital Rack Controls & Encoders (4 cols) */}
        <div className="lg:col-span-4 bg-[#0f141d] border border-zinc-800 rounded-lg p-3 flex flex-col justify-between gap-3">
          {/* Mode Selector Buttons */}
          <div>
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
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
                  className={`text-[9px] font-bold py-1.5 px-2 rounded uppercase tracking-wider border transition-all cursor-pointer ${
                    analyzerMode === mode
                      ? 'bg-cyan-500 text-zinc-950 border-cyan-300 font-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Digital Rotary Encoders */}
          <div className="grid grid-cols-2 gap-2 bg-black/40 border border-zinc-800/80 rounded-lg p-2">
            {/* Encoder 1: DSP GAIN */}
            <div className="flex flex-col items-center">
              <span className="text-[8px] text-zinc-400 uppercase font-bold tracking-wider mb-1">GAIN</span>
              <div 
                className="relative w-10 h-10 rounded-full bg-zinc-900 border-2 border-zinc-700 shadow-inner flex items-center justify-center cursor-pointer hover:border-cyan-500 transition-colors"
                onClick={() => {
                  const next = gain >= 100 ? 20 : gain + 15;
                  setGain(next);
                  playTwist(300 + next * 3);
                }}
              >
                <div 
                  className="absolute w-1 h-3.5 bg-cyan-400 rounded-full top-0.5 origin-bottom transition-transform duration-200"
                  style={{ transform: `rotate(${((gain - 10) / 90) * 270 - 135}deg)` }}
                />
                <div className="w-4 h-4 rounded-full bg-zinc-950 border border-zinc-800" />
              </div>
              <span className="text-[9px] text-zinc-300 font-bold mt-1">{gain}%</span>
            </div>

            {/* Encoder 2: TIMEBASE */}
            <div className="flex flex-col items-center">
              <span className="text-[8px] text-zinc-400 uppercase font-bold tracking-wider mb-1">TIMEBASE</span>
              <div 
                className="relative w-10 h-10 rounded-full bg-zinc-900 border-2 border-zinc-700 shadow-inner flex items-center justify-center cursor-pointer hover:border-amber-500 transition-colors"
                onClick={() => {
                  const next = timebase >= 100 ? 10 : timebase + 15;
                  setTimebase(next);
                  playTwist(250 + next * 3);
                }}
              >
                <div 
                  className="absolute w-1 h-3.5 bg-amber-400 rounded-full top-0.5 origin-bottom transition-transform duration-200"
                  style={{ transform: `rotate(${((timebase - 10) / 90) * 270 - 135}deg)` }}
                />
                <div className="w-4 h-4 rounded-full bg-zinc-950 border border-zinc-800" />
              </div>
              <span className="text-[9px] text-zinc-300 font-bold mt-1">{timebase}ms</span>
            </div>
          </div>

          {/* FFT Resolution & Decay Speed toggles */}
          <div className="space-y-1.5 text-[8px]">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 font-bold">FFT RES:</span>
              <div className="flex gap-1">
                {(['1024', '2048', '4096'] as const).map(sz => (
                  <button
                    key={sz}
                    onClick={() => { playBeep(600); setFftSize(sz); }}
                    className={`px-1.5 py-0.5 rounded border ${
                      fftSize === sz ? 'bg-cyan-950 text-cyan-300 border-cyan-700 font-bold' : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-500 font-bold">PEAK DECAY:</span>
              <div className="flex gap-1">
                {(['fast', 'med', 'slow'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => { playBeep(500); setDecaySpeed(d); }}
                    className={`px-1.5 py-0.5 rounded border uppercase ${
                      decaySpeed === d ? 'bg-amber-950 text-amber-300 border-amber-700 font-bold' : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
