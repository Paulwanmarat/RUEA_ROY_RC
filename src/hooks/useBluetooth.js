import { useState, useRef, useCallback, useEffect } from 'react';

const HEARTBEAT_INTERVAL_MS = 250;

export function useBluetooth() {
  const [connectionMode, setConnectionMode] = useState('webbt'); // 'webbt' | 'bridge'
  const [isConnected, setIsConnected] = useState(false);
  const [deviceLabel, setDeviceLabel] = useState('DISCONNECTED');
  const [bridgeHost, setBridgeHost] = useState('localhost:8000');
  const [heartbeatTick, setHeartbeatTick] = useState(false);

  const serialPortRef = useRef(null);
  const serialWriterRef = useRef(null);
  const webSocketRef = useRef(null);
  const bridgeHostRef = useRef('localhost:8000');
  
  const lastSendTimeRef = useRef(0);
  const currentThrottleRef = useRef('N');
  const currentSteeringRef = useRef('C');
  const isConnectedRef = useRef(false);

  // Keep refs synced with state for heartbeat loop
  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  useEffect(() => {
    bridgeHostRef.current = bridgeHost;
  }, [bridgeHost]);

  const triggerPulseAnimation = useCallback(() => {
    setHeartbeatTick(true);
    setTimeout(() => setHeartbeatTick(false), 100);
  }, []);

  const sendSerialChar = useCallback(async (charCmd) => {
    if (!isConnectedRef.current) return;

    lastSendTimeRef.current = Date.now();
    triggerPulseAnimation();

    try {
      // 1. Web Serial
      if (serialWriterRef.current) {
        const encoder = new TextEncoder();
        await serialWriterRef.current.write(encoder.encode(charCmd));
      }
      // 2. WebSocket Bridge
      else if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
        webSocketRef.current.send(charCmd);
      }
      // 3. HTTP Fetch Bridge
      else if (bridgeHostRef.current) {
        fetch(`http://${bridgeHostRef.current}/api/cmd?c=${encodeURIComponent(charCmd)}`).catch(() => {});
      }
    } catch (err) {
      console.error("Serial transmit error:", err);
      setIsConnected(false);
      setDeviceLabel('DISCONNECTED');
    }
  }, [triggerPulseAnimation]);

  const connectWebBluetoothOrSerial = useCallback(async () => {
    // 1. Try Web Serial API
    if (typeof navigator !== 'undefined' && 'serial' in navigator) {
      try {
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });
        const writer = port.getWriter();

        serialPortRef.current = port;
        serialWriterRef.current = writer;

        setIsConnected(true);
        setDeviceLabel('Web Serial');
        await writer.write(new TextEncoder().encode('S'));
        return;
      } catch (err) {
        console.warn("Web Serial failed or cancelled:", err);
      }
    }

    // 2. Fallback to Web Bluetooth API
    if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
      try {
        const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['00001101-0000-1000-8000-00805f9b34fb']
        });
        await device.gatt.connect();
        setIsConnected(true);
        setDeviceLabel(device.name || 'Bluetooth');
        return;
      } catch (err) {
        alert("Bluetooth Connection Failed:\n" + err.message + "\n\nTip: You can also use Wi-Fi Bridge mode!");
      }
    } else {
      alert("Web Bluetooth & Web Serial are not supported on this browser.\nPlease use Chrome for Android or Wi-Fi Bridge mode.");
    }
  }, []);

  const connectBridgeServer = useCallback(async (ipAddress) => {
    if (!ipAddress) return;
    const cleanHost = ipAddress.replace(/^https?:\/\//, '').replace(/^ws:\/\//, '');
    setBridgeHost(cleanHost);
    bridgeHostRef.current = cleanHost;

    try {
      const res = await fetch(`http://${cleanHost}/api/cmd?c=S`);
      if (res.ok) {
        setIsConnected(true);
        setDeviceLabel(`Bridge (${cleanHost})`);
        return;
      }
    } catch (e) {
      console.warn("HTTP bridge test failed, testing WebSocket...", e);
    }

    try {
      const ws = new WebSocket(`ws://${cleanHost}`);
      webSocketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setDeviceLabel(`Bridge (${cleanHost})`);
        ws.send('S');
      };

      ws.onclose = () => {
        setIsConnected(false);
        setDeviceLabel('DISCONNECTED');
      };

      ws.onerror = () => {
        alert(`Failed to connect to bridge at http://${cleanHost}\nEnsure server.py is running on your PC!`);
        setIsConnected(false);
        setDeviceLabel('DISCONNECTED');
      };
    } catch (e) {
      alert("Invalid Bridge URL: " + e.message);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (isConnectedRef.current) {
      await sendSerialChar('S');
    }

    if (serialWriterRef.current) {
      try {
        serialWriterRef.current.releaseLock();
        await serialPortRef.current.close();
      } catch (e) {}
      serialWriterRef.current = null;
      serialPortRef.current = null;
    }

    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
    }

    setIsConnected(false);
    setDeviceLabel('DISCONNECTED');
  }, [sendSerialChar]);

  // Periodic Heartbeat Loop (250 ms)
  useEffect(() => {
    const timer = setInterval(() => {
      if (isConnectedRef.current) {
        const elapsed = Date.now() - lastSendTimeRef.current;
        if (elapsed >= HEARTBEAT_INTERVAL_MS) {
          const t = currentThrottleRef.current;
          const s = currentSteeringRef.current;
          if (t !== 'N') {
            sendSerialChar(t);
          } else if (s !== 'C') {
            sendSerialChar(s);
          } else {
            sendSerialChar('.');
          }
        }
      }
    }, HEARTBEAT_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [sendSerialChar]);

  return {
    connectionMode,
    setConnectionMode,
    isConnected,
    deviceLabel,
    bridgeHost,
    setBridgeHost,
    heartbeatTick,
    sendSerialChar,
    connectWebBluetoothOrSerial,
    connectBridgeServer,
    disconnect,
    currentThrottleRef,
    currentSteeringRef
  };
}
