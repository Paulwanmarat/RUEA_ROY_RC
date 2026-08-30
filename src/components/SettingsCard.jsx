import React from 'react';
import { IconSun, IconMoon, IconMonitor } from './Icons';

export function SettingsCard({
  hapticsEnabled,
  setHapticsEnabled,
  audioEnabled,
  setAudioEnabled,
  themeMode,
  setThemeMode
}) {
  return (
    <section className="card settings-card">
      <h3 className="settings-section-title">App &amp; Control Settings</h3>

      <div className="settings-grid">
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={hapticsEnabled}
            onChange={(e) => setHapticsEnabled(e.target.checked)}
          />
          <span className="slider"></span>
          <span className="toggle-label">Haptic Vibration</span>
        </label>
        
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={audioEnabled}
            onChange={(e) => setAudioEnabled(e.target.checked)}
          />
          <span className="slider"></span>
          <span className="toggle-label">Control Sound Effects</span>
        </label>
      </div>

      <div className="theme-settings-row">
        <span className="theme-setting-label">Appearance Theme:</span>
        <div className="theme-options-group">
          <button
            className={`theme-option-btn ${themeMode === 'light' ? 'active' : ''}`}
            onClick={() => setThemeMode('light')}
            title="Light Mode"
          >
            <IconSun className="theme-icon" />
            <span>Light</span>
          </button>
          
          <button
            className={`theme-option-btn ${themeMode === 'dark' ? 'active' : ''}`}
            onClick={() => setThemeMode('dark')}
            title="Dark Mode"
          >
            <IconMoon className="theme-icon" />
            <span>Dark</span>
          </button>

          <button
            className={`theme-option-btn ${themeMode === 'system' ? 'active' : ''}`}
            onClick={() => setThemeMode('system')}
            title="System / OS Default"
          >
            <IconMonitor className="theme-icon" />
            <span>System</span>
          </button>
        </div>
      </div>
    </section>
  );
}
