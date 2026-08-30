import React from 'react';

export function LayoutToggle({ activeLayout, setActiveLayout }) {
  return (
    <div class="controller-layout-bar">
      <span class="layout-label">LAYOUT:</span>
      <div class="layout-toggle-group">
        <button
          class={`layout-btn ${activeLayout === 'split' ? 'active' : ''}`}
          onClick={() => setActiveLayout('split')}
        >
          Dual-Thumb Split
        </button>
        <button
          class={`layout-btn ${activeLayout === 'dpad' ? 'active' : ''}`}
          onClick={() => setActiveLayout('dpad')}
        >
          Unified D-Pad
        </button>
      </div>
    </div>
  );
}
