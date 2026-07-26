import { useCallback, useRef } from 'react';

export function useSoundEffects() {
  const audioContext = useRef<AudioContext | null>(null);

  const initContext = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playBeep = useCallback((freq = 440, duration = 0.1) => {
    initContext();
    if (!audioContext.current) return;
    
    const osc = audioContext.current.createOscillator();
    const gain = audioContext.current.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, audioContext.current.currentTime);
    gain.gain.setValueAtTime(0.1, audioContext.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(audioContext.current.destination);
    
    osc.start();
    osc.stop(audioContext.current.currentTime + duration);
  }, []);

  const playHum = useCallback(() => {
    initContext();
    if (!audioContext.current) return;
    
    const osc = audioContext.current.createOscillator();
    const gain = audioContext.current.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, audioContext.current.currentTime);
    gain.gain.setValueAtTime(0.02, audioContext.current.currentTime);
    
    osc.connect(gain);
    gain.connect(audioContext.current.destination);
    
    osc.start();
    // Hum doesn't stop automatically, maybe we need a stop function or just let it loop?
    // Let's keep it simple for now, maybe just a short hum or trigger in useEffect
    osc.stop(audioContext.current.currentTime + 1);
  }, []);

  return { playBeep, playHum };
}
