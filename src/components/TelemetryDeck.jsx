import React from 'react';

export function TelemetryDeck({ throttleState, steeringState, heartbeatTick }) {
  const getThrottleDisplay = () => {
    if (throttleState === 'U') return { text: 'FORWARD (U)', cls: 'state-active state-forward', pct: '100%' };
    if (throttleState === 'D') return { text: 'REVERSE (D)', cls: 'state-active state-reverse', pct: '100%' };
    return { text: 'NEUTRAL (N)', cls: 'state-neutral', pct: '50%' };
  };

  const getSteeringDisplay = () => {
    if (steeringState === 'L') return { text: 'LEFT (45°)', cls: 'state-active state-left', pos: '25%' };
    if (steeringState === 'R') return { text: 'RIGHT (135°)', cls: 'state-active state-right', pos: '75%' };
    return { text: 'CENTER (90°)', cls: 'state-center', pos: '50%' };
  };

  const tDisp = getThrottleDisplay();
  const sDisp = getSteeringDisplay();

  return (
    <section className="card telemetry-card">
      <div className="telemetry-grid">
        <div className="telemetry-item">
          <span className="tel-label">THROTTLE</span>
          <div className={`tel-value ${tDisp.cls}`}>{tDisp.text}</div>
          <div className="tel-gauge-bar">
            <div className={`gauge-fill ${tDisp.cls}`} style={{ width: tDisp.pct }}></div>
          </div>
        </div>
        <div className="telemetry-item">
          <span className="tel-label">STEERING</span>
          <div className={`tel-value ${sDisp.cls}`}>{sDisp.text}</div>
          <div className="tel-gauge-bar">
            <div className="gauge-pointer" style={{ left: sDisp.pos }}></div>
          </div>
        </div>
        <div className="telemetry-item">
          <span className="tel-label">HEARTBEAT</span>
          <div className="heartbeat-box">
            <span className={`pulse-indicator ${heartbeatTick ? 'tick' : ''}`}></span>
            <span className="tel-subtext">250ms OK</span>
          </div>
          <div className="tel-gauge-bar">
            <div className={`gauge-fill heartbeat-fill ${heartbeatTick ? 'pulse' : ''}`}></div>
          </div>
        </div>
      </div>
    </section>
  );
}
