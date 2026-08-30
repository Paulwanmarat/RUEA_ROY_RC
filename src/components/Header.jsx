import React from 'react';

export function Header({ isConnected, deviceLabel }) {
  return (
    <header class="app-header">
      <div class="logo-container">
        <div class="logo-wrapper">
          <img src="/assets/logo.jpg" alt="RUEY ROY RC Logo" class="brand-logo" />
          <span class="logo-star">✨</span>
        </div>
        <div class="title-meta">
          <h1 class="brand-title">RUEY ROY RC</h1>
          <p class="brand-subtitle">Arduino Nano Bluetooth Controller</p>
        </div>
      </div>
      
      <div class="status-badge-wrapper">
        <div class={`status-badge ${isConnected ? 'connected' : 'disconnected'}`}>
          <span class="status-dot"></span>
          <span>{isConnected ? `CONNECTED (${deviceLabel})` : 'DISCONNECTED'}</span>
        </div>
      </div>
    </header>
  );
}
