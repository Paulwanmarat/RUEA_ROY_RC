import React from 'react';
import {
  IconZap,
  IconGamepad,
  IconRadio,
  IconBookOpen,
  IconArrowRight
} from './Icons';

export function HomePage({ onEnter, onExploreDocs }) {
  return (
    <div className="home-page-container">
      <div className="home-backdrop"></div>

      <div className="home-content">
        <div className="home-logo-box">
          <img src="/assets/logo.jpg" alt="RUEA ROY RC Logo" className="home-logo-img" />
        </div>

        <h1 className="home-title">RUEA ROY RC</h1>
        <p className="home-tagline">Arduino Nano Bluetooth RC Boat Engineering Platform</p>
        <p className="home-description">
          High-performance web remote controller deck, Web Bluetooth serial I/O engine, real-time motor &amp; steering telemetry, and complete technical document library.
        </p>

        <div className="home-badges">
          <span className="home-badge">
            <IconZap className="badge-icon" /> Web Bluetooth
          </span>
          <span className="home-badge">
            <IconGamepad className="badge-icon" /> Touch &amp; Keyboard
          </span>
          <span className="home-badge">
            <IconRadio className="badge-icon" /> Wi-Fi Relay
          </span>
          <span className="home-badge">
            <IconBookOpen className="badge-icon" /> Tech Docs
          </span>
        </div>

        <div className="home-stats-row">
          <div className="stat-pill">
            <span className="stat-num">9600</span>
            <span className="stat-label">Baud SPP</span>
          </div>
          <div className="stat-pill">
            <span className="stat-num">250ms</span>
            <span className="stat-label">Heartbeat</span>
          </div>
          <div className="stat-pill">
            <span className="stat-num">1.0s</span>
            <span className="stat-label">Failsafe</span>
          </div>
          <div className="stat-pill">
            <span className="stat-num">30A</span>
            <span className="stat-label">Mini ESC</span>
          </div>
        </div>

        <div className="home-cta-group">
          <button className="home-enter-btn primary-btn" onClick={onEnter}>
            <IconGamepad className="btn-icon" />
            <span>Launch Controller</span>
            <IconArrowRight className="enter-arrow" />
          </button>
          
          <button className="home-enter-btn secondary-btn" onClick={onExploreDocs}>
            <IconBookOpen className="btn-icon" />
            <span>Technical Library</span>
          </button>
        </div>

        <p className="home-credit">Developed by SPR41 &bull; RUEA ROY RC Engineering Platform</p>
      </div>
    </div>
  );
}
