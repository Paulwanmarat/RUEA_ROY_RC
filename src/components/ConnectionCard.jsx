import React, { useState } from 'react';
import { Zap, Plug, Wifi } from 'lucide-react';

export function ConnectionCard({
  connectionMode,
  setConnectionMode,
  isConnected,
  onConnectWebBt,
  onConnectBridge,
  onDisconnect,
  bridgeHost,
  setBridgeHost
}) {
  const [ipInput, setIpInput] = useState(bridgeHost || 'localhost:8000');

  const handleBridgeSubmit = (e) => {
    e.preventDefault();
    onConnectBridge(ipInput);
  };

  return (
    <section class="card connection-card">
      <div class="card-header">
        <h2><span class="icon">📶</span> Connection Setup</h2>
        <div class="mode-tabs">
          <button
            class={`tab-btn ${connectionMode === 'webbt' ? 'active' : ''}`}
            onClick={() => setConnectionMode('webbt')}
          >
            Web Serial / Bluetooth
          </button>
          <button
            class={`tab-btn ${connectionMode === 'bridge' ? 'active' : ''}`}
            onClick={() => setConnectionMode('bridge')}
          >
            Wi-Fi Bridge
          </button>
        </div>
      </div>

      {connectionMode === 'webbt' ? (
        <div class="tab-content active">
          <div class="action-buttons-row">
            <button
              class="btn btn-primary glow-cyan"
              onClick={onConnectWebBt}
              disabled={isConnected}
            >
              <Zap size={18} /> Connect Device
            </button>
            <button
              class="btn btn-danger"
              onClick={onDisconnect}
              disabled={!isConnected}
            >
              <Plug size={18} /> Disconnect
            </button>
          </div>
          <p class="hint-text">Connect directly via Chrome Web Bluetooth / Web Serial (HC-06 / BLE).</p>
        </div>
      ) : (
        <div class="tab-content active">
          <form onSubmit={handleBridgeSubmit} class="bridge-input-group">
            <input
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="Server IP (e.g. 192.168.1.100:8000)"
            />
            <button type="submit" class="btn btn-primary" disabled={isConnected}>
              <Wifi size={18} /> Connect Bridge
            </button>
          </form>
          <p class="hint-text">Connects to Python `server.py` running on PC paired with HC-06 COM port.</p>
        </div>
      )}
    </section>
  );
}
