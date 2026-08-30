import { useState, useRef, useCallback } from 'react';

export function useHapticsAudio() {
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const audioCtxRef = useRef(null);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      } catch (e) {
        console.warn("Web Audio API not supported:", e);
      }
    }
  }, []);

  const playClickSound = useCallback((freq = 440, type = 'sine') => {
    if (!audioEnabled) return;
    initAudio();
    if (!audioCtxRef.current) return;

    try {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      osc.stop(audioCtxRef.current.currentTime + 0.08);
    } catch (e) {
      // Audio play error catch
    }
  }, [audioEnabled, initAudio]);

  const triggerHaptic = useCallback((duration = 20) => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(duration);
    }
  }, [hapticsEnabled]);

  return {
    hapticsEnabled,
    setHapticsEnabled,
    audioEnabled,
    setAudioEnabled,
    playClickSound,
    triggerHaptic
  };
}
