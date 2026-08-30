/**
 * RUEY ROY RC - MOBILE PWA APPLICATION ENGINE
 * Target Hardware: Arduino Nano, HC-06 Bluetooth (9600 Baud)
 * Protocol: 'U' (Up), 'D' (Down), 'N' (Neutral), 'L' (Left), 'R' (Right), 'C' (Center), 'S' (Emergency Stop), '.' (Heartbeat)
 */

const HEARTBEAT_INTERVAL_MS = 250;

class RueaRoyApp {
  constructor() {
    // Communication & State
    this.connectionMode = 'webbt'; // 'webbt' or 'bridge'
    this.isConnected = false;
    this.serialPort = null;
    this.serialWriter = null;
    this.webSocket = null;
    
    // Control States
    this.activeKeys = new Set();
    this.currentThrottleCmd = 'N';
    this.currentSteeringCmd = 'C';
    this.lastSentCmd = 'S';
    this.lastSendTime = 0;
    this.heartbeatTimer = null;

    // App Options
    this.hapticsEnabled = true;
    this.audioEnabled = true;
    this.audioCtx = null;

    this.initDOM();
    this.bindEvents();
    this.initAudio();
    this.startHeartbeatLoop();
  }

  // ---------------------------------------------------------------------------
  // INITIALIZATION & DOM BINDING
  // ---------------------------------------------------------------------------
  initDOM() {
    // Header & Status
    this.statusBadge = document.getElementById('connectionStatusBadge');
    this.statusText = document.getElementById('statusText');

    // Connection Tabs & Panels
    this.tabWebBt = document.getElementById('tabWebBt');
    this.tabBridge = document.getElementById('tabBridge');
    this.modeWebBtPanel = document.getElementById('modeWebBtPanel');
    this.modeBridgePanel = document.getElementById('modeBridgePanel');

    // Buttons
    this.btnConnect = document.getElementById('btnConnect');
    this.btnDisconnect = document.getElementById('btnDisconnect');
    this.btnBridgeConnect = document.getElementById('btnBridgeConnect');
    this.bridgeIpInput = document.getElementById('bridgeIpInput');

    // Telemetry
    this.telThrottle = document.getElementById('telThrottle');
    this.telSteering = document.getElementById('telSteering');
    this.telHeartbeat = document.getElementById('telHeartbeat');
    this.heartbeatPulse = document.getElementById('heartbeatPulse');

    // Layout Switchers
    this.layoutSplitBtn = document.getElementById('layoutSplitBtn');
    this.layoutDpadBtn = document.getElementById('layoutDpadBtn');
    this.layoutSplitDeck = document.getElementById('layoutSplitDeck');
    this.layoutDpadDeck = document.getElementById('layoutDpadDeck');

    // Toggles
    this.toggleHaptics = document.getElementById('toggleHaptics');
    this.toggleAudio = document.getElementById('toggleAudio');

    // Control Button Elements
    this.controlButtons = document.querySelectorAll('.control-btn');
    this.estopButtons = document.querySelectorAll('.btn-estop');
  }

  bindEvents() {
    // Connection Mode Tabs
    this.tabWebBt.addEventListener('click', () => this.switchConnectionTab('webbt'));
    this.tabBridge.addEventListener('click', () => this.switchConnectionTab('bridge'));

    // Connection Action Buttons
    this.btnConnect.addEventListener('click', () => this.connectWebBluetoothOrSerial());
    this.btnDisconnect.addEventListener('click', () => this.disconnect());
    this.btnBridgeConnect.addEventListener('click', () => this.connectWebSocketBridge());

    // Layout Switcher
    this.layoutSplitBtn.addEventListener('click', () => this.switchLayout('split'));
    this.layoutDpadBtn.addEventListener('click', () => this.switchLayout('dpad'));

    // Preference Toggles
    this.toggleHaptics.addEventListener('change', (e) => this.hapticsEnabled = e.target.checked);
    this.toggleAudio.addEventListener('change', (e) => this.audioEnabled = e.target.checked);

    // Multi-Touch & Mouse Binding for Control Buttons
    this.controlButtons.forEach(btn => {
      const keyName = btn.getAttribute('data-cmd');

      // Touch events
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.handleControlPress(keyName);
      }, { passive: false });

      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.handleControlRelease(keyName);
      }, { passive: false });

      btn.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        this.handleControlRelease(keyName);
      }, { passive: false });

      // Mouse events (PC fallback)
      btn.addEventListener('mousedown', (e) => {
        this.handleControlPress(keyName);
      });

      btn.addEventListener('mouseup', (e) => {
        this.handleControlRelease(keyName);
      });

      btn.addEventListener('mouseleave', (e) => {
        this.handleControlRelease(keyName);
      });
    });

    // Emergency Stop Buttons
    this.estopButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.triggerEmergencyStop();
      });
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.triggerEmergencyStop();
      }, { passive: false });
    });

    // Global Keyboard Listeners (PC Control)
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  initAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    } catch (e) {
      console.warn("Web Audio API not supported");
    }
  }

  playClickSound(freq = 440, type = 'sine') {
    if (!this.audioEnabled || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch (e) {
      // Audio context play error catch
    }
  }

  triggerHaptic(duration = 20) {
    if (this.hapticsEnabled && navigator.vibrate) {
      navigator.vibrate(duration);
    }
  }

  // ---------------------------------------------------------------------------
  // CONTROL LOGIC & STATE MACHINE
  // ---------------------------------------------------------------------------
  handleKeyDown(e) {
    if (e.repeat) return;
    const key = e.key.toLowerCase();

    if (key === ' ' || key === 'spacebar') {
      e.preventDefault();
      this.triggerEmergencyStop();
      return;
    }

    if (['w', 'a', 's', 'd'].includes(key)) {
      e.preventDefault();
      this.handleControlPress(key);
    }
  }

  handleKeyUp(e) {
    const key = e.key.toLowerCase();
    if (['w', 'a', 's', 'd'].includes(key)) {
      e.preventDefault();
      this.handleControlRelease(key);
    }
  }

  handleControlPress(key) {
    if (!this.activeKeys.has(key)) {
      this.activeKeys.add(key);
      this.triggerHaptic(15);
      this.playClickSound(580, 'triangle');
      this.evaluateControls();
    }
  }

  handleControlRelease(key) {
    if (this.activeKeys.has(key)) {
      this.activeKeys.delete(key);
      this.triggerHaptic(10);
      this.playClickSound(340, 'sine');
      this.evaluateControls();
    }
  }

  triggerEmergencyStop() {
    this.activeKeys.clear();
    this.currentThrottleCmd = 'N';
    this.currentSteeringCmd = 'C';
    this.triggerHaptic([50, 50, 50]);
    this.playClickSound(220, 'sawtooth');
    this.updateButtonVisuals();
    this.sendSerialChar('S');
  }

  evaluateControls() {
    // 1. Throttle logic
    let newThrottle = 'N';
    if (this.activeKeys.has('w') && !this.activeKeys.has('s')) {
      newThrottle = 'U';
    } else if (this.activeKeys.has('s') && !this.activeKeys.has('w')) {
      newThrottle = 'D';
    }

    // 2. Steering logic
    let newSteering = 'C';
    if (this.activeKeys.has('a') && !this.activeKeys.has('d')) {
      newSteering = 'L';
    } else if (this.activeKeys.has('d') && !this.activeKeys.has('a')) {
      newSteering = 'R';
    }

    const throttleChanged = (newThrottle !== this.currentThrottleCmd);
    const steeringChanged = (newSteering !== this.currentSteeringCmd);

    this.currentThrottleCmd = newThrottle;
    this.currentSteeringCmd = newSteering;

    this.updateButtonVisuals();
    this.updateTelemetryDisplay();

    if (throttleChanged) {
      this.sendSerialChar(this.currentThrottleCmd);
    }
    if (steeringChanged) {
      this.sendSerialChar(this.currentSteeringCmd);
    }
  }

  updateButtonVisuals() {
    this.controlButtons.forEach(btn => {
      const key = btn.getAttribute('data-cmd');
      if (this.activeKeys.has(key)) {
        btn.classList.add('active-press');
      } else {
        btn.classList.remove('active-press');
      }
    });
  }

  updateTelemetryDisplay() {
    // Throttle label update
    if (this.currentThrottleCmd === 'U') {
      this.telThrottle.textContent = 'FORWARD (U)';
      this.telThrottle.className = 'tel-value state-active';
    } else if (this.currentThrottleCmd === 'D') {
      this.telThrottle.textContent = 'REVERSE (D)';
      this.telThrottle.className = 'tel-value state-active';
    } else {
      this.telThrottle.textContent = 'NEUTRAL (N)';
      this.telThrottle.className = 'tel-value state-neutral';
    }

    // Steering label update
    if (this.currentSteeringCmd === 'L') {
      this.telSteering.textContent = 'LEFT (L)';
      this.telSteering.className = 'tel-value state-active';
    } else if (this.currentSteeringCmd === 'R') {
      this.telSteering.textContent = 'RIGHT (R)';
      this.telSteering.className = 'tel-value state-active';
    } else {
      this.telSteering.textContent = 'CENTER (C)';
      this.telSteering.className = 'tel-value state-center';
    }
  }

  // ---------------------------------------------------------------------------
  // BLUETOOTH & SERIAL COMMUNICATION ENGINE
  // ---------------------------------------------------------------------------
  async connectWebBluetoothOrSerial() {
    // 1. Try Web Serial API (Chrome Android/Desktop for USB & Bluetooth Serial)
    if ('serial' in navigator) {
      try {
        this.serialPort = await navigator.serial.requestPort();
        await this.serialPort.open({ baudRate: 9600 });
        this.serialWriter = this.serialPort.getWriter();
        
        this.setConnectedState(true, 'Web Serial');
        this.sendSerialChar('S');
        return;
      } catch (err) {
        console.warn("Web Serial failed or cancelled:", err);
      }
    }

    // 2. Fallback to Web Bluetooth API
    if ('bluetooth' in navigator) {
      try {
        const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['00001101-0000-1000-8000-00805f9b34fb'] // SPP Serial UUID
        });
        
        const server = await device.gatt.connect();
        this.setConnectedState(true, device.name || 'Bluetooth');
        this.sendSerialChar('S');
        return;
      } catch (err) {
        alert("Bluetooth Connection Failed:\n" + err.message + "\n\nTip: You can also use Wi-Fi Bridge mode with server.py!");
      }
    } else {
      alert("Web Bluetooth & Web Serial are not supported on this browser.\nPlease use Chrome for Android or Wi-Fi Bridge mode.");
    }
  }

  async connectWebSocketBridge() {
    const rawIp = this.bridgeIpInput.value.trim();
    if (!rawIp) return;

    // Clean IP format
    const cleanHost = rawIp.replace(/^https?:\/\//, '').replace(/^ws:\/\//, '');
    this.bridgeHost = cleanHost;

    // Test HTTP bridge connection
    try {
      const res = await fetch(`http://${cleanHost}/api/cmd?c=S`);
      if (res.ok) {
        this.setConnectedState(true, `Bridge (${cleanHost})`);
        return;
      }
    } catch (e) {
      console.warn("HTTP bridge check failed, attempting WebSocket...", e);
    }

    // Fallback to WebSocket
    const wsUrl = `ws://${cleanHost}`;
    try {
      this.webSocket = new WebSocket(wsUrl);

      this.webSocket.onopen = () => {
        this.setConnectedState(true, `Bridge (${cleanHost})`);
        this.sendSerialChar('S');
      };

      this.webSocket.onclose = () => {
        this.setConnectedState(false);
      };

      this.webSocket.onerror = (err) => {
        alert(`Failed to connect to bridge at http://${cleanHost}\nMake sure server.py is running on your PC!`);
        this.setConnectedState(false);
      };
    } catch (e) {
      alert("Invalid Bridge URL: " + e.message);
    }
  }

  async sendSerialChar(charCmd) {
    if (!this.isConnected) return;

    this.lastSentCmd = charCmd;
    this.lastSendTime = Date.now();

    // Visual heartbeat pulse trigger
    this.triggerHeartbeatPulse();

    try {
      // Send over Web Serial
      if (this.serialWriter) {
        const encoder = new TextEncoder();
        await this.serialWriter.write(encoder.encode(charCmd));
      } 
      // Send over WebSocket Bridge
      else if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
        this.webSocket.send(charCmd);
      }
      // Send over HTTP Bridge fetch
      else if (this.bridgeHost) {
        fetch(`http://${this.bridgeHost}/api/cmd?c=${encodeURIComponent(charCmd)}`).catch(err => {
          console.warn("HTTP transmit error:", err);
        });
      }
    } catch (err) {
      console.error("Serial transmit error:", err);
      this.setConnectedState(false);
    }
  }

  setConnectedState(connected, label = '') {
    this.isConnected = connected;

    if (connected) {
      this.statusBadge.className = 'status-badge connected';
      this.statusText.textContent = `CONNECTED (${label})`;
      this.btnConnect.disabled = true;
      this.btnDisconnect.disabled = false;
    } else {
      this.statusBadge.className = 'status-badge disconnected';
      this.statusText.textContent = 'DISCONNECTED';
      this.btnConnect.disabled = false;
      this.btnDisconnect.disabled = true;
      this.activeKeys.clear();
      this.updateButtonVisuals();
      this.updateTelemetryDisplay();
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await this.sendSerialChar('S');
    }

    if (this.serialWriter) {
      try {
        this.serialWriter.releaseLock();
        await this.serialPort.close();
      } catch (e) {}
      this.serialWriter = null;
      this.serialPort = null;
    }

    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
    }

    this.setConnectedState(false);
  }

  // ---------------------------------------------------------------------------
  // HEARTBEAT TIMER LOOP (250 ms)
  // ---------------------------------------------------------------------------
  startHeartbeatLoop() {
    setInterval(() => {
      if (this.isConnected) {
        const elapsedMs = Date.now() - this.lastSendTime;
        if (elapsedMs >= HEARTBEAT_INTERVAL_MS) {
          // Re-transmit active command state or heartbeat tick '.'
          if (this.currentThrottleCmd !== 'N') {
            this.sendSerialChar(this.currentThrottleCmd);
          } else if (this.currentSteeringCmd !== 'C') {
            this.sendSerialChar(this.currentSteeringCmd);
          } else {
            this.sendSerialChar('.');
          }
        }
      }
    }, HEARTBEAT_INTERVAL_MS);
  }

  triggerHeartbeatPulse() {
    this.heartbeatPulse.classList.add('tick');
    setTimeout(() => this.heartbeatPulse.classList.remove('tick'), 100);
  }

  // ---------------------------------------------------------------------------
  // UI TAB & LAYOUT SWITCHERS
  // ---------------------------------------------------------------------------
  switchConnectionTab(mode) {
    this.connectionMode = mode;
    if (mode === 'webbt') {
      this.tabWebBt.classList.add('active');
      this.tabBridge.classList.remove('active');
      this.modeWebBtPanel.classList.add('active');
      this.modeBridgePanel.classList.remove('active');
    } else {
      this.tabBridge.classList.add('active');
      this.tabWebBt.classList.remove('active');
      this.modeBridgePanel.classList.add('active');
      this.modeWebBtPanel.classList.remove('active');
    }
  }

  switchLayout(layout) {
    if (layout === 'split') {
      this.layoutSplitBtn.classList.add('active');
      this.layoutDpadBtn.classList.remove('active');
      this.layoutSplitDeck.classList.add('active');
      this.layoutDpadDeck.classList.remove('active');
    } else {
      this.layoutDpadBtn.classList.add('active');
      this.layoutSplitBtn.classList.remove('active');
      this.layoutDpadDeck.classList.add('active');
      this.layoutSplitDeck.classList.remove('active');
    }
  }
}

// Instantiate on DOM load and register PWA Service Worker
window.addEventListener('DOMContentLoaded', () => {
  window.app = new RueaRoyApp();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('PWA ServiceWorker registered successfully:', reg.scope))
      .catch(err => console.warn('ServiceWorker registration failed:', err));
  }
});

