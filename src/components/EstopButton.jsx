import React from 'react';
import { IconShieldAlert } from './Icons';

export function EstopButton({ onEstop, fullWidth = false }) {
  const handleTouchStart = (e) => {
    e.preventDefault();
    onEstop();
  };

  return (
    <button
      className={`btn-estop glow-red ${fullWidth ? 'full-width-estop' : ''}`}
      onClick={onEstop}
      onTouchStart={handleTouchStart}
    >
      <IconShieldAlert className="estop-icon" />
      <span className="estop-label">EMERGENCY STOP {fullWidth ? '(SPACE)' : ''}</span>
    </button>
  );
}
