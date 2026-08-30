import React from 'react';

export function TelemetryDeck({ throttleState, steeringState, heartbeatTick }) {
  const getThrottleDisplay = () => {
    if (throttleState === 'U') return { text: 'FORWARD (U)', cls: 'state-active' };
    if (throttleState === 'D') return { text: 'REVERSE (D)', cls: 'state-active' };
    return { text: 'NEUTRAL (N)', cls: 'state-neutral' };
  };

  const getSteeringDisplay = () => {
    if (steeringState === 'L') return { text: 'LEFT (L)', cls: 'state-active' };
    if (steeringState === 'R') return { text: 'RIGHT (R)', cls: 'state-active' };
    return { text: 'CENTER (C)', cls: 'state-center' };
  };

  const tDisp = getThrottleDisplay();
  const sDisp = getSteeringDisplay();

  return (
    <section class="card telemetry-card">
      <div class="telemetry-grid">
        <div class="telemetry-item">
          <span class="tel-label">THROTTLE</span>
          <div class={`tel-value ${tDisp.cls}`}>{tDisp.text}</div>
        </div>
        <div class="telemetry-item">
          <span class="tel-label">STEERING</span>
          <div class={`tel-value ${sDisp.cls}`}>{sDisp.text}</div>
        </div>
        <div class="telemetry-item">
          <span class="tel-label">HEARTBEAT</span>
          <div class="heartbeat-box">
            <span class={`pulse-indicator ${heartbeatTick ? 'tick' : ''}`}></span>
            <span class="tel-subtext">250ms OK</span>
          </div>
        </div>
      </div>
    </section>
  );
}
