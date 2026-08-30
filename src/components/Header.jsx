import React from 'react';

export function Header({ isConnected, deviceLabel }) {
  return (
    <header className="app-header">
      <div className="logo-container">
        <div className="logo-wrapper">
          <img src="/assets/logo.jpg" alt="RUEA ROY RC Logo" className="brand-logo" />
        </div>
        <div className="title-meta">
          <h1 className="brand-title">RUEA ROY RC</h1>
          <p className="brand-subtitle">Arduino Nano Bluetooth Controller</p>
        </div>
      </div>

      <div className={`status-badge ${isConnected ? 'connected' : 'disconnected'}`}>
        <span className="status-dot"></span>
        <span>{isConnected ? `CONNECTED (${deviceLabel})` : 'DISCONNECTED'}</span>
      </div>
    </header>
  );
}
