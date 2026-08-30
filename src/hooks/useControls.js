import { useState, useRef, useCallback, useEffect } from 'react';

export function useControls({ sendSerialChar, currentThrottleRef, currentSteeringRef, triggerHaptic, playClickSound, activeView }) {
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [throttleState, setThrottleState] = useState('N'); // 'U', 'D', 'N'
  const [steeringState, setSteeringState] = useState('C'); // 'L', 'R', 'C'
  const activeKeysRef = useRef(new Set());

  const evaluateControls = useCallback((keysSet) => {
    let newThrottle = 'N';
    if (keysSet.has('w') && !keysSet.has('s')) {
      newThrottle = 'U';
    } else if (keysSet.has('s') && !keysSet.has('w')) {
      newThrottle = 'D';
    }

    let newSteering = 'C';
    if (keysSet.has('a') && !keysSet.has('d')) {
      newSteering = 'L';
    } else if (keysSet.has('d') && !keysSet.has('a')) {
      newSteering = 'R';
    }

    const throttleChanged = (newThrottle !== currentThrottleRef.current);
    const steeringChanged = (newSteering !== currentSteeringRef.current);

    currentThrottleRef.current = newThrottle;
    currentSteeringRef.current = newSteering;

    setThrottleState(newThrottle);
    setSteeringState(newSteering);

    if (throttleChanged) sendSerialChar(newThrottle);
    if (steeringChanged) sendSerialChar(newSteering);
  }, [currentThrottleRef, currentSteeringRef, sendSerialChar]);

  const handleControlPress = useCallback((key) => {
    if (!activeKeysRef.current.has(key)) {
      const nextKeys = new Set(activeKeysRef.current);
      nextKeys.add(key);
      activeKeysRef.current = nextKeys;
      setActiveKeys(nextKeys);

      triggerHaptic(15);
      playClickSound(580, 'triangle');
      evaluateControls(nextKeys);
    }
  }, [evaluateControls, playClickSound, triggerHaptic]);

  const handleControlRelease = useCallback((key) => {
    if (activeKeysRef.current.has(key)) {
      const nextKeys = new Set(activeKeysRef.current);
      nextKeys.delete(key);
      activeKeysRef.current = nextKeys;
      setActiveKeys(nextKeys);

      triggerHaptic(10);
      playClickSound(340, 'sine');
      evaluateControls(nextKeys);
    }
  }, [evaluateControls, playClickSound, triggerHaptic]);

  const triggerEmergencyStop = useCallback(() => {
    const emptySet = new Set();
    activeKeysRef.current = emptySet;
    setActiveKeys(emptySet);

    currentThrottleRef.current = 'N';
    currentSteeringRef.current = 'C';
    setThrottleState('N');
    setSteeringState('C');

    triggerHaptic([50, 50, 50]);
    playClickSound(220, 'sawtooth');
    sendSerialChar('S');
  }, [currentSteeringRef, currentThrottleRef, playClickSound, sendSerialChar, triggerHaptic]);

  // Keyboard Event Listeners — only active on Controller view
  useEffect(() => {
    if (activeView !== 'controller') {
      // Clear any stuck keys when leaving the controller view
      const emptySet = new Set();
      activeKeysRef.current = emptySet;
      setActiveKeys(emptySet);
      return;
    }

    const handleKeyDown = (e) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if (key === ' ' || key === 'spacebar') {
        e.preventDefault();
        triggerEmergencyStop();
      } else if (['w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
        handleControlPress(key);
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
        handleControlRelease(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeView, handleControlPress, handleControlRelease, triggerEmergencyStop]);

  return {
    activeKeys,
    throttleState,
    steeringState,
    handleControlPress,
    handleControlRelease,
    triggerEmergencyStop
  };
}
