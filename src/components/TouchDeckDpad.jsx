import React from 'react';
import { EstopButton } from './EstopButton';

export function TouchDeckDpad({ activeKeys, onPress, onRelease, onEstop }) {
  const createTouchHandlers = (key) => ({
    onTouchStart: (e) => { e.preventDefault(); onPress(key); },
    onTouchEnd: (e) => { e.preventDefault(); onRelease(key); },
    onTouchCancel: (e) => { e.preventDefault(); onRelease(key); },
    onMouseDown: () => onPress(key),
    onMouseUp: () => onRelease(key),
    onMouseLeave: () => onRelease(key)
  });

  return (
    <section class="touch-deck dpad-deck active">
      <div class="dpad-container">
        <button
          class={`control-btn dpad-btn dpad-up ${activeKeys.has('w') ? 'active-press' : ''}`}
          {...createTouchHandlers('w')}
        >
          <span class="arrow">▲</span>
          <span class="dpad-hint">UP (W)</span>
        </button>

        <div class="dpad-middle-row">
          <button
            class={`control-btn dpad-btn dpad-left ${activeKeys.has('a') ? 'active-press' : ''}`}
            {...createTouchHandlers('a')}
          >
            <span class="arrow">◄</span>
            <span class="dpad-hint">LEFT (A)</span>
          </button>
          
          <div class="dpad-center-hub">
            <span class="hub-logo">🚤</span>
          </div>

          <button
            class={`control-btn dpad-btn dpad-right ${activeKeys.has('d') ? 'active-press' : ''}`}
            {...createTouchHandlers('d')}
          >
            <span class="arrow">►</span>
            <span class="dpad-hint">RIGHT (D)</span>
          </button>
        </div>

        <button
          class={`control-btn dpad-btn dpad-down ${activeKeys.has('s') ? 'active-press' : ''}`}
          {...createTouchHandlers('s')}
        >
          <span class="arrow">▼</span>
          <span class="dpad-hint">DOWN (S)</span>
        </button>
      </div>

      <EstopButton onEstop={onEstop} fullWidth={true} />
    </section>
  );
}
