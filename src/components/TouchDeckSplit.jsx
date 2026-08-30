import React from 'react';
import { EstopButton } from './EstopButton';

export function TouchDeckSplit({ activeKeys, onPress, onRelease, onEstop }) {
  const createTouchHandlers = (key) => ({
    onTouchStart: (e) => { e.preventDefault(); onPress(key); },
    onTouchEnd: (e) => { e.preventDefault(); onRelease(key); },
    onTouchCancel: (e) => { e.preventDefault(); onRelease(key); },
    onMouseDown: () => onPress(key),
    onMouseUp: () => onRelease(key),
    onMouseLeave: () => onRelease(key)
  });

  return (
    <section class="touch-deck split-deck active">
      {/* Throttle Deck (Left) */}
      <div class="control-column throttle-column">
        <span class="deck-title">THROTTLE</span>
        <button
          class={`control-btn btn-throttle btn-up ${activeKeys.has('w') ? 'active-press' : ''}`}
          {...createTouchHandlers('w')}
        >
          <span class="arrow">▲</span>
          <span class="label">FORWARD</span>
          <span class="key-hint">W</span>
        </button>
        <button
          class={`control-btn btn-throttle btn-down ${activeKeys.has('s') ? 'active-press' : ''}`}
          {...createTouchHandlers('s')}
        >
          <span class="arrow">▼</span>
          <span class="label">REVERSE</span>
          <span class="key-hint">S</span>
        </button>
      </div>

      {/* Center Emergency Stop */}
      <div class="control-column center-column">
        <EstopButton onEstop={onEstop} />
      </div>

      {/* Steering Deck (Right) */}
      <div class="control-column steering-column">
        <span class="deck-title">STEERING</span>
        <button
          class={`control-btn btn-steering btn-left ${activeKeys.has('a') ? 'active-press' : ''}`}
          {...createTouchHandlers('a')}
        >
          <span class="arrow">◄</span>
          <span class="label">LEFT</span>
          <span class="key-hint">A</span>
        </button>
        <button
          class={`control-btn btn-steering btn-right ${activeKeys.has('d') ? 'active-press' : ''}`}
          {...createTouchHandlers('d')}
        >
          <span class="label">RIGHT</span>
          <span class="arrow">►</span>
          <span class="key-hint">D</span>
        </button>
      </div>
    </section>
  );
}
