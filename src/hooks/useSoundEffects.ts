import { useCallback, useRef } from 'react';

export function useSoundEffects() {
  const audioContext = useRef<AudioContext | null>(null);

  const initContext = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContext.current.state === 'suspended') {
      audioContext.current.resume();
    }
  };

  const playBeep = useCallback((freq = 440, duration = 0.1) => {
    initContext();
    if (!audioContext.current) return;
    
    const osc = audioContext.current.createOscillator();
    const gain = audioContext.current.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, audioContext.current.currentTime);
    gain.gain.setValueAtTime(0.05, audioContext.current.currentTime);
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
    gain.gain.setValueAtTime(0.01, audioContext.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.current.currentTime + 0.8);
    
    osc.connect(gain);
    gain.connect(audioContext.current.destination);
    
    osc.start();
    osc.stop(audioContext.current.currentTime + 0.8);
  }, []);

  const playTwist = useCallback((freq = 600) => {
    initContext();
    if (!audioContext.current) return;

    const osc = audioContext.current.createOscillator();
    const gain = audioContext.current.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioContext.current.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, audioContext.current.currentTime + 0.05);

    gain.gain.setValueAtTime(0.03, audioContext.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(audioContext.current.destination);

    osc.start();
    osc.stop(audioContext.current.currentTime + 0.05);
  }, []);

  const playPlug = useCallback(() => {
    initContext();
    if (!audioContext.current) return;

    const osc = audioContext.current.createOscillator();
    const bandpass = audioContext.current.createBiquadFilter();
    const gain = audioContext.current.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, audioContext.current.currentTime);

    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(400, audioContext.current.currentTime);
    bandpass.Q.setValueAtTime(10, audioContext.current.currentTime);

    gain.gain.setValueAtTime(0.08, audioContext.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + 0.12);

    osc.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(audioContext.current.destination);

    osc.start();
    osc.stop(audioContext.current.currentTime + 0.12);
  }, []);

  const playFlip = useCallback(() => {
    initContext();
    if (!audioContext.current) return;

    const osc = audioContext.current.createOscillator();
    const filter = audioContext.current.createBiquadFilter();
    const gain = audioContext.current.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(50, audioContext.current.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, audioContext.current.currentTime);
    filter.frequency.exponentialRampToValueAtTime(80, audioContext.current.currentTime + 0.5);

    gain.gain.setValueAtTime(0.05, audioContext.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + 0.55);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.current.destination);

    osc.start();
    osc.stop(audioContext.current.currentTime + 0.55);
  }, []);

  return { playBeep, playHum, playTwist, playPlug, playFlip };
}
