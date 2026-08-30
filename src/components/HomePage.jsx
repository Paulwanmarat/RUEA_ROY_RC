import React from 'react';

export function HomePage({ onEnter, onExploreDocs }) {
  return (
    <div className="home-page-container">
      <div className="home-backdrop"></div>

      <div className="home-content">
        <div className="home-logo-ring">
          <div className="home-logo-wrapper">
            <img src="/assets/logo.jpg" alt="RUEA ROY RC Logo" className="home-logo-img" />
          </div>
          <div className="ring-glow"></div>
        </div>

        <h1 className="home-title">RUEA ROY RC</h1>
        <p className="home-tagline">Arduino Nano Bluetooth RC Boat Engineering Platform</p>
        <p className="home-description">
          High-performance web remote controller deck, Web Bluetooth serial I/O engine, real-time motor &amp; steering telemetry, and complete technical document library.
        </p>

        <div className="home-badges">
          <span className="home-badge">⚡ Web Bluetooth &amp; Serial</span>
          <span className="home-badge">🎮 Touch &amp; Keyboard Control</span>
          <span className="home-badge">📡 Wi-Fi Bridge Relay</span>
          <span className="home-badge">📚 Technical Repository</span>
        </div>

        <div className="home-cta-group">
          <button className="home-enter-btn primary-btn" onClick={onEnter}>
            <span>🚀 Launch Controller</span>
            <span className="enter-arrow">→</span>
          </button>
          
          <button className="home-enter-btn secondary-btn" onClick={onExploreDocs}>
            <span>📚 Technical Library</span>
          </button>
        </div>

        <p className="home-credit">Developed by SPR41 &bull; RUEA ROY RC Project</p>
      </div>
    </div>
  );
}
