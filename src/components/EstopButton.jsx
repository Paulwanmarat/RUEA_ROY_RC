import React from 'react';

export function EstopButton({ onEstop, fullWidth = false }) {
  const handleTouchStart = (e) => {
    e.preventDefault();
    onEstop();
  };

  return (
    <button
      class={`btn-estop glow-red ${fullWidth ? 'full-width-estop' : ''}`}
      onClick={onEstop}
      onTouchStart={handleTouchStart}
    >
      <span class="estop-icon">🛑</span>
      <span class="estop-label">EMERGENCY STOP {fullWidth ? '(SPACE)' : ''}</span>
    </button>
  );
}
