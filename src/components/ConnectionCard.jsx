import React, { useState } from 'react';
import { Zap, Plug, Wifi } from 'lucide-react';
import { IconSignal } from './Icons';

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
    <section className="card connection-card">
      <div className="card-header">
        <h2>
          <IconSignal className="card-header-icon" /> Connection Setup
        </h2>
        <div className="mode-tabs">
          <button
            className={`tab-btn ${connectionMode === 'webbt' ? 'active' : ''}`}
            onClick={() => setConnectionMode('webbt')}
          >
            Web Serial / Bluetooth
          </button>
          <button
            className={`tab-btn ${connectionMode === 'bridge' ? 'active' : ''}`}
            onClick={() => setConnectionMode('bridge')}
          >
            Wi-Fi Bridge
          </button>
        </div>
      </div>

      {connectionMode === 'webbt' ? (
        <div className="tab-content active">
          <div className="action-buttons-row">
            <button
              className="btn btn-primary glow-cyan"
              onClick={onConnectWebBt}
              disabled={isConnected}
            >
              <Zap size={18} /> Connect Device
            </button>
            <button
              className="btn btn-danger"
              onClick={onDisconnect}
              disabled={!isConnected}
            >
              <Plug size={18} /> Disconnect
            </button>
          </div>
          <p className="hint-text">Connect directly via Chrome Web Bluetooth / Web Serial (HC-06 / BLE).</p>
        </div>
      ) : (
        <div className="tab-content active">
          <form onSubmit={handleBridgeSubmit} className="bridge-input-group">
            <input
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="Server IP (e.g. 192.168.1.100:8000)"
            />
            <button type="submit" className="btn btn-primary" disabled={isConnected}>
              <Wifi size={18} /> Connect Bridge
            </button>
          </form>
          <p className="hint-text">Connects to Python `server.py` running on PC paired with HC-06 COM port.</p>
        </div>
      )}
    </section>
  );
}
