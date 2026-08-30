import React from 'react';

export function SettingsCard({ hapticsEnabled, setHapticsEnabled, audioEnabled, setAudioEnabled }) {
  return (
    <section class="card settings-card">
      <div class="settings-grid">
        <label class="toggle-switch">
          <input
            type="checkbox"
            checked={hapticsEnabled}
            onChange={(e) => setHapticsEnabled(e.target.checked)}
          />
          <span class="slider"></span>
          <span class="toggle-label">📳 Haptic Vibration</span>
        </label>
        
        <label class="toggle-switch">
          <input
            type="checkbox"
            checked={audioEnabled}
            onChange={(e) => setAudioEnabled(e.target.checked)}
          />
          <span class="slider"></span>
          <span class="toggle-label">🔊 Control Audio</span>
        </label>
      </div>
    </section>
  );
}
