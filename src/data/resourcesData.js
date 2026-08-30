export const CATEGORIES = [
  { id: 'All', label: 'All Resources' },
  { id: 'Documentation', label: 'Documentation' },
  { id: 'Hardware', label: 'Hardware' },
  { id: 'Software', label: 'Software' },
  { id: 'Engineering', label: 'Engineering' },
  { id: 'Design', label: 'Design' },
  { id: 'References', label: 'References' }
];

export const RESOURCES_DATA = [
  // 1. Project Documentation
  {
    id: 'doc-technical-report',
    title: 'Project Report / Full Technical Report',
    category: 'Documentation',
    tag: 'Project Documentation',
    type: 'PDF Document',
    iconName: 'FileText',
    description: 'Comprehensive technical report covering systemic architecture, physical calculations, embedded programming, circuit diagrams, and field test results.',
    actionLabel: 'View Document',
    status: 'available',
    modalType: 'markdown',
    content: `
# RUEA LOY RC Platform - Full Technical Report

## 1. Project Abstract
The **RUEA LOY RC Platform** is an autonomous and remote-controlled small-scale surface vessel (RC Boat) engineered around an Arduino Nano microcontroller, HC-06 Bluetooth module, MG90S steering servo, and 30A mini brushed Electronic Speed Controller (ESC).

## 2. System Architecture
- **Microcontroller**: Arduino Nano (ATmega328P @ 16 MHz)
- **Wireless Link**: HC-06 Bluetooth Classic SPP @ 9600 Baud
- **Actuation**: MG90S Metal Gear Servo (Steering via angle command), 180SH Brushed DC Motor (Propulsion)
- **Power Subsystem**: 7.4V LiPo Battery with 5V Linear Voltage Regulator

## 3. Communication Protocol
The firmware uses a hybrid command protocol over UART @ 9600 baud:

| Command | Format | Action | Target Value |
|---|---|---|---|
| Forward Throttle | \`'u'\` | ESC Forward | 1000 µs |
| Reverse Throttle | \`'d'\` | ESC Reverse | 1700 µs |
| Motor Neutral | \`'n'\` or \`'s'\` | ESC Stop | 1500 µs |
| Set Steering Angle | \`'x'\` + angle + \`'\\n'\` | Servo write | 0°–180° |
| Set Failsafe Center | \`'c'\` + angle + \`'\\n'\` | Update center | 0°–180° |
| Heartbeat Tick | \`'.'\` | Reset timer | — |

## 4. Failsafe Architecture
A 1.0-second hardware failsafe timer monitors incoming serial transmissions. If signal loss occurs, throttle immediately resets to neutral (1500 µs) and steering centers to the calibrated \`failsafeCenter\` position.
    `
  },
  {
    id: 'doc-overview',
    title: 'Project Overview',
    category: 'Documentation',
    tag: 'Project Documentation',
    type: 'Overview Guide',
    iconName: 'BookOpen',
    description: 'High-level executive summary detailing project objectives, scope, hardware topology, and control interface design.',
    actionLabel: 'View Overview',
    status: 'available',
    modalType: 'markdown',
    content: `
# RUEA LOY RC Platform Overview

The RUEA LOY RC project bridges mechanical engineering, marine buoyancy physics, embedded C++ control, and web applications.

### Primary Objectives:
- Provide a reliable, low-latency wireless surface vessel controller.
- Implement robust multi-layered failsafes (250ms heartbeat pulse, 1.0s signal loss cutoff).
- Deliver a mobile-first Progressive Web Application (PWA) with multi-touch D-Pad, haptics, and Web Bluetooth integration.
- Support dynamic servo calibration via \`x<angle>\` steering commands and \`c<angle>\` failsafe center updates.
    `
  },
  {
    id: 'doc-design-dev',
    title: 'Design & Development Documentation',
    category: 'Documentation',
    tag: 'Project Documentation',
    type: 'Development Log',
    iconName: 'Compass',
    description: 'Chronological development lifecycle logs documenting iterative prototyping, ESC arming sequences, and servo debouncing.',
    actionLabel: 'View Log',
    status: 'available',
    modalType: 'markdown',
    content: `
# Design & Development Log

### Phase 1: Circuit Prototyping
- Wired HC-06 Bluetooth module to Arduino Nano SoftwareSerial pins (D10 RX, D11 TX via 1k/2k voltage divider).
- Configured 3.0-second startup arming delay at 1500 µs (neutral) pulse width to prevent ESC motor initialization spin-ups.
- Steering servo attached to Pin D5 with dynamic angle control via \`x<angle>\\n\` protocol.

### Phase 2: React Mobile PWA
- Created responsive touch control decks (Dual-Thumb Split & D-Pad).
- Integrated Web Audio synthesis and Web Haptic Vibration API.
- Added dynamic servo calibration GUI in Python Tkinter desktop controller (\`main.py\`).

### Phase 3: Python Desktop Controller
- Built \`main.py\` Tkinter GUI with WASD keyboard + mouse button control.
- Added live servo calibration sliders (LEFT/CENTER/RIGHT) with real-time angle preview.
- Calibration settings saved to \`servo_config.json\` and synced to Arduino via \`c<angle>\` command.
    `
  },

  // 2. Hardware & Electronics
  {
    id: 'hw-arduino-nano',
    title: 'Arduino Nano Documentation',
    category: 'Hardware',
    tag: 'Hardware & Electronics',
    type: 'Hardware Specs',
    iconName: 'Cpu',
    description: 'Official technical specifications and pinout mapping for the ATmega328P microcontroller board powering the boat.',
    actionLabel: 'View Specs',
    status: 'link',
    externalUrl: 'https://docs.arduino.cc/hardware/nano/'
  },
  {
    id: 'hw-hc06-bluetooth',
    title: 'HC-06 Bluetooth Module Documentation',
    category: 'Hardware',
    tag: 'Hardware & Electronics',
    type: 'Datasheet / Specs',
    iconName: 'Radio',
    description: 'Bluetooth Classic 2.0 SPP slave module specifications, UART 9600 baud serial interface rules, and AT command set.',
    actionLabel: 'View Specs',
    status: 'link',
    externalUrl: 'https://components101.com/wireless/hc-06-bluetooth-module-datasheet'
  },
  {
    id: 'hw-mg90s-servo',
    title: 'MG90S Servo Specifications',
    category: 'Hardware',
    tag: 'Hardware & Electronics',
    type: 'Datasheet',
    iconName: 'Settings',
    description: 'Micro metal gear servo specifications featuring 2.2 kg/cm torque @ 4.8V, 0.11 sec/60° speed, and PWM angle positioning.',
    actionLabel: 'View Specs',
    status: 'link',
    externalUrl: 'https://www.electronicoscaldas.com/datasheet/MG90S_Tower-Pro.pdf'
  },
  {
    id: 'hw-30a-esc',
    title: '30A Mini Brushed ESC Information',
    category: 'Hardware',
    tag: 'Hardware & Electronics',
    type: 'Hardware Specs',
    iconName: 'Zap',
    description: 'Electronic Speed Controller specs: 30A continuous current, bi-directional motor control, and 1000 µs – 2000 µs PWM pulse bounds.',
    actionLabel: 'View Info',
    status: 'available',
    modalType: 'markdown',
    content: `
# 30A Mini Brushed ESC Specifications

| Parameter | Value |
|---|---|
| Continuous Current | 30A |
| Peak Current | 40A (10 seconds) |
| Input Voltage | 4.8V – 8.4V (2S LiPo / 4–6 cell NiMH) |
| BEC Output | 5V 1A Linear Regulator |
| PWM Input Frequency | 50 Hz (20ms period) |
| Neutral / Stop | 1500 µs |
| Forward Range | 1000 µs |
| Reverse Range | 1700 µs |
    `
  },
  {
    id: 'hw-180sh-motor',
    title: '180SH DC Motor Information',
    category: 'Hardware',
    tag: 'Hardware & Electronics',
    type: 'Hardware Specs',
    iconName: 'Activity',
    description: 'High-RPM brushed DC motor parameters, operating voltage bounds (3V - 7.4V), stall current, and shaft coupling details.',
    actionLabel: 'View Info',
    status: 'available',
    modalType: 'markdown',
    content: `
# 180SH High-Speed DC Motor Specs

| Parameter | Value |
|---|---|
| Nominal Voltage | 6.0V DC (Range 3.0V – 7.4V) |
| No-Load Speed | 15,000 RPM @ 6V |
| No-Load Current | 0.25A |
| Stall Torque | ~180 g.cm |
| Shaft Diameter | 2.0 mm |
    `
  },
  {
    id: 'hw-propeller-shaft',
    title: 'RC Boat Shaft & Propeller Information',
    category: 'Hardware',
    tag: 'Hardware & Electronics',
    type: 'Component Guide',
    iconName: 'Anchor',
    description: 'Stainless steel drive shaft assembly, brass sleeve bearings, waterproof stuffing box lubrication, and 2-blade nylon propeller specs.',
    actionLabel: 'View Specs',
    status: 'available',
    modalType: 'markdown',
    content: `
# RC Boat Drive Shaft & Propeller Assembly

| Component | Specification |
|---|---|
| Drive Shaft | Stainless Steel 2.0 mm × 150 mm |
| Stuffing Tube | Brass 3.0 mm OD with waterproof grease seal |
| Propeller | 2-Blade Nylon Marine, 30 mm diameter, 1.4 pitch ratio |
    `
  },
  {
    id: 'hw-circuit-schematic',
    title: 'Circuit Schematic',
    category: 'Hardware',
    tag: 'Hardware & Electronics',
    type: 'Schematic Diagram',
    iconName: 'GitBranch',
    description: 'Detailed wiring and power-distribution architecture connecting Arduino Nano, HC-06 module, ESC, 180SH motor, and MG90S servo.',
    actionLabel: 'View Schematic',
    status: 'available',
    modalType: 'schematic',
    content: `
<h1>RUEA LOY RC Circuit Schematic</h1>
<div class="schematic-visual">
  <div class="schematic-row">
    <div class="schematic-box box-power">
      <div class="box-title">LiPo Battery</div>
      <div class="box-detail">7.4V 2S 1000mAh</div>
    </div>
  </div>

  <div class="schematic-connector">POWER DISTRIBUTION</div>

  <div class="schematic-row">
    <div class="schematic-box box-power">
      <div class="box-title">30A Brushed ESC</div>
      <div class="box-detail">Pulse input from Pin D3<br/>Neutral: 1500 µs</div>
    </div>
    <div class="schematic-box box-power">
      <div class="box-title">Buck Regulator</div>
      <div class="box-detail">5V output for logic &amp; servo</div>
    </div>
  </div>

  <div class="schematic-connector">SIGNAL &amp; POWER LINES</div>

  <div class="schematic-row">
    <div class="schematic-box box-mcu">
      <div class="box-title">Arduino Nano</div>
      <div class="box-detail">ATmega328P @ 16 MHz<br/>ESC → Pin D3<br/>Servo → Pin D5<br/>BT RX → D10, TX → D11</div>
    </div>
    <div class="schematic-box">
      <div class="box-title">180SH Motor</div>
      <div class="box-detail">Brushed DC Motor<br/>Powered by ESC output</div>
    </div>
  </div>

  <div class="schematic-row">
    <div class="schematic-box">
      <div class="box-title">MG90S Servo</div>
      <div class="box-detail">Steering on Pin D5<br/>Dynamic angle: x&lt;angle&gt;</div>
    </div>
    <div class="schematic-box box-wireless">
      <div class="box-title">HC-06 Bluetooth</div>
      <div class="box-detail">SoftwareSerial @ 9600<br/>RX: D10, TX: D11<br/>(TX via 1k/2k divider)</div>
    </div>
  </div>
</div>
    `
  },
  {
    id: 'hw-bom',
    title: 'Bill of Materials (BOM)',
    category: 'Hardware',
    tag: 'Hardware & Electronics',
    type: 'Component List',
    iconName: 'List',
    description: 'Complete breakdown of hardware components, quantities, model numbers, unit costs, and total budget.',
    actionLabel: 'View BOM',
    status: 'available',
    modalType: 'markdown',
    content: `
# Bill of Materials (BOM)

| # | Component | Qty | Model / Specs | Status |
|---|---|---|---|---|
| 1 | Microcontroller Board | 1 | Arduino Nano ATmega328P | Installed |
| 2 | Bluetooth Module | 1 | HC-06 Serial Slave Module | Installed |
| 3 | Steering Servo | 1 | MG90S Metal Gear Micro Servo | Installed |
| 4 | Motor ESC | 1 | 30A Mini Bi-Directional Brushed ESC | Installed |
| 5 | DC Propulsion Motor | 1 | 180SH High-RPM DC Motor | Installed |
| 6 | Drive Shaft & Sleeve | 1 | 150mm Stainless Shaft & Brass Tube | Installed |
| 7 | Marine Propeller | 1 | 30mm 2-Blade Nylon Propeller | Installed |
| 8 | Battery Pack | 1 | 7.4V 2S 1000mAh LiPo Pack | Installed |
| 9 | Voltage Resistors | 2 | 1kΩ & 2kΩ Divider Resistors | Installed |
    `
  },

  // 3. Software
  {
    id: 'sw-arduino-cpp',
    title: 'Arduino C++ Source Code',
    category: 'Software',
    tag: 'Software',
    type: 'C++ Code (RUEA_LOY.ino)',
    iconName: 'Code',
    description: 'The embedded C++ control program responsible for Bluetooth command parsing, motor pulse width modulation, servo steering, and failsafe timer.',
    actionLabel: 'View Source',
    status: 'available',
    modalType: 'code',
    language: 'cpp',
    content: `#include <SoftwareSerial.h>
#include <Servo.h>

const int RX_PIN = 10;
const int TX_PIN = 11;
const int ESC_PIN = 3;
const int STEERING_PIN = 5;

// --- ESC SETTINGS ---
int ESC_STOP = 1500;     
const int ESC_FORWARD = 1000;  
const int ESC_BACKWARD = 1700; 

SoftwareSerial btSerial(RX_PIN, TX_PIN);
Servo esc;
Servo steeringServo;

unsigned long lastCmdTime = 0;
bool failsafeActive = false;

// Default center position (will be updated by the GUI)
int failsafeCenter = 90; 

void setup() {
  esc.attach(ESC_PIN);
  esc.writeMicroseconds(ESC_STOP);

  steeringServo.attach(STEERING_PIN);
  steeringServo.write(failsafeCenter);

  delay(3000); // Wait for ESC arming

  btSerial.begin(9600);
  lastCmdTime = millis();
}

void loop() {
  if (btSerial.available() > 0) {
    char cmd = btSerial.read();
    
    // Ignore newline characters left over from data packets
    if (cmd == '\\r' || cmd == '\\n') return; 

    cmd = tolower(cmd);
    bool validCommand = false;

    // --- Motor Commands ---
    if (cmd == 'u') {
      esc.writeMicroseconds(ESC_FORWARD);
      failsafeActive = false;
      validCommand = true;
    } 
    else if (cmd == 'd') {
      esc.writeMicroseconds(ESC_BACKWARD);
      failsafeActive = false;
      validCommand = true;
    } 
    else if (cmd == 'n' || cmd == 's') { 
      esc.writeMicroseconds(ESC_STOP);
      failsafeActive = false;
      validCommand = true;
    } 
    // --- Steering Commands (Dynamic Angle) ---
    else if (cmd == 'x') {
      int angle = btSerial.parseInt();
      angle = constrain(angle, 0, 180); 
      steeringServo.write(angle);
      failsafeActive = false;
      validCommand = true;
    }
    // Update Failsafe Center Position
    else if (cmd == 'c') {
      failsafeCenter = btSerial.parseInt();
      failsafeCenter = constrain(failsafeCenter, 0, 180);
      validCommand = true;
    }
    // Heartbeat
    else if (cmd == '.') { 
      validCommand = true;
    }

    if (validCommand) {
      lastCmdTime = millis();
    }
  }

  // --- FAILSAFE ---
  if (millis() - lastCmdTime >= 1000) {
    if (!failsafeActive) {
      failsafeActive = true;
      esc.writeMicroseconds(ESC_STOP);
      steeringServo.write(failsafeCenter);
    }
  }
}
`
  },
  {
    id: 'sw-mobile-app',
    title: 'Mobile Controller Application',
    category: 'Software',
    tag: 'Software',
    type: 'React Web PWA',
    iconName: 'Smartphone',
    description: 'React PWA interface providing multi-touch dual thumb decks, D-Pad, haptic feedback, Web Serial API, and Wi-Fi bridge connection.',
    actionLabel: 'View App Source',
    status: 'available',
    modalType: 'markdown',
    content: `
# React Mobile Controller Architecture

### Features:
- **Responsive Layout**: Designed for phones, tablets, and desktop displays.
- **Custom Hooks**: \`useBluetooth\`, \`useControls\`, \`useHapticsAudio\`.
- **PWA Capabilities**: Service worker caching & manifest for home screen installation.
- **Theme System**: Light Mode, Dark Mode, and System/OS preference with \`useTheme\` hook.
- **Steering Protocol**: Sends \`x<angle>\\n\` commands (e.g. \`x45\\n\`, \`x90\\n\`, \`x135\\n\`) matching firmware \`btSerial.parseInt()\`.
    `
  },
  {
    id: 'sw-app-architecture',
    title: 'Mobile Application Architecture',
    category: 'Software',
    tag: 'Software',
    type: 'Architecture Diagram',
    iconName: 'Layers',
    description: 'Component tree and state management architecture explaining event flow between touch inputs, state deduplication, and serial transmission.',
    actionLabel: 'View Diagram',
    status: 'available',
    modalType: 'schematic',
    content: `
<h1>React App Architecture</h1>
<div class="diagram-flow">
  <div class="diagram-node node-start">Touch Inputs / Keyboard (WASD)</div>
  <div class="diagram-arrow"></div>
  <div class="diagram-node node-process">useControls Hook — State Deduplication<br/><small>Maps keys to throttle (u/d/n) &amp; steering (x&lt;angle&gt;)</small></div>
  <div class="diagram-arrow"></div>
  <div class="diagram-node node-process">useBluetooth Hook — Transport Layer<br/><small>250ms heartbeat, serial write, error recovery</small></div>
  <div class="diagram-arrow"></div>
  <div class="diagram-branch">
    <div class="diagram-node">Web Serial / Bluetooth<br/><small>Direct USB or BLE</small></div>
    <div class="diagram-node">Wi-Fi Bridge Server<br/><small>server.py HTTP relay</small></div>
  </div>
  <div class="diagram-arrow"></div>
  <div class="diagram-node node-end">Arduino Nano — RUEA_LOY.ino</div>
</div>
    `
  },
  {
    id: 'sw-bt-command-ref',
    title: 'Bluetooth Command Reference',
    category: 'Software',
    tag: 'Software',
    type: 'API Reference',
    iconName: 'Terminal',
    description: 'Command dictionary used by mobile client, Python GUI, and Arduino firmware.',
    actionLabel: 'View Reference',
    status: 'available',
    modalType: 'markdown',
    content: `
# Serial Command Reference (9600 Baud)

| Command | Format | Action | ESC Pulse | Servo Angle |
|---|---|---|---|---|
| Forward | \`'u'\` | Motor forward throttle | 1000 µs | Unchanged |
| Reverse | \`'d'\` | Motor reverse throttle | 1700 µs | Unchanged |
| Neutral | \`'n'\` or \`'s'\` | Motor stop / neutral | 1500 µs | Unchanged |
| Steer | \`'x'\` + angle + \`'\\n'\` | Set servo angle | Unchanged | 0°–180° |
| Set Center | \`'c'\` + angle + \`'\\n'\` | Update failsafe center | Unchanged | 0°–180° |
| Heartbeat | \`'.'\` | Reset failsafe timer | Unchanged | Unchanged |

### Protocol Notes:
- All motor commands are single ASCII characters (\`u\`, \`d\`, \`n\`, \`s\`).
- Steering uses \`x\` prefix followed by integer angle and newline: e.g. \`x45\\n\`, \`x90\\n\`, \`x135\\n\`.
- The \`c\` command updates the failsafe center position stored in Arduino RAM.
- 250ms heartbeat pulses prevent the 1-second failsafe timer from triggering.
    `
  },
  {
    id: 'sw-system-flowchart',
    title: 'System Flowchart',
    category: 'Software',
    tag: 'Software',
    type: 'Flowchart Diagram',
    iconName: 'GitCommit',
    description: 'Comprehensive software flow diagram illustrating startup sequence, Bluetooth packet polling loop, command parsing, and failsafe execution.',
    actionLabel: 'View Flowchart',
    status: 'available',
    modalType: 'schematic',
    content: `
<h1>Software Control Flowchart</h1>
<div class="diagram-flow">
  <div class="diagram-node node-start">STARTUP</div>
  <div class="diagram-arrow"></div>
  <div class="diagram-node node-process">Attach ESC (Pin D3) &amp; Servo (Pin D5)</div>
  <div class="diagram-arrow"></div>
  <div class="diagram-node node-process">Set ESC = 1500 µs (Neutral), Servo = 90° (Center)</div>
  <div class="diagram-arrow"></div>
  <div class="diagram-node node-process">Delay 3.0 Seconds — ESC Arming Phase</div>
  <div class="diagram-arrow"></div>
  <div class="diagram-node node-start">MAIN LOOP (Continuous)</div>
  <div class="diagram-arrow"></div>
  <div class="diagram-node node-decision">btSerial.available() &gt; 0 ?</div>
  <div class="diagram-arrow">YES</div>
  <div class="diagram-node node-process">Read char → tolower() → Parse command:<br/><strong>u</strong> → ESC 1000µs | <strong>d</strong> → ESC 1700µs | <strong>n/s</strong> → ESC 1500µs<br/><strong>x</strong> → parseInt() → Servo angle | <strong>c</strong> → Update failsafe center<br/><strong>.</strong> → Heartbeat tick</div>
  <div class="diagram-arrow"></div>
  <div class="diagram-node node-process">Reset lastCmdTime = millis()</div>
  <div class="diagram-arrow"></div>
  <div class="diagram-node node-decision">millis() − lastCmdTime ≥ 1000ms ?</div>
  <div class="diagram-arrow">YES — Signal Lost!</div>
  <div class="diagram-node node-end">FAILSAFE: ESC → 1500µs, Servo → failsafeCenter</div>
</div>
    `
  },
  {
    id: 'sw-software-arch',
    title: 'Software Architecture',
    category: 'Software',
    tag: 'Software',
    type: 'Architecture Overview',
    iconName: 'Share2',
    description: 'Decoupled software layers separating input capture, protocol formatting, transport layers, and hardware pulse generation.',
    actionLabel: 'View Architecture',
    status: 'available',
    modalType: 'schematic',
    content: `
<h1>Software Layer Architecture</h1>
<div class="diagram-flow">
  <div class="diagram-node node-start">Layer 1 — User Interface</div>
  <div class="diagram-arrow"></div>
  <div class="diagram-node node-process">React Touch Deck with multi-touch prevention<br/><small>Web Audio synthesis + Web Haptic Vibration API</small></div>
  <div class="diagram-arrow"></div>
  <div class="diagram-node node-start">Layer 2 — Protocol Engine</div>
  <div class="diagram-arrow"></div>
  <div class="diagram-node node-process">250ms periodic state re-transmission<br/><small>Maps UI state → u/d/n + x&lt;angle&gt;\\n commands</small></div>
  <div class="diagram-arrow"></div>
  <div class="diagram-node node-start">Layer 3 — Transport</div>
  <div class="diagram-arrow"></div>
  <div class="diagram-branch">
    <div class="diagram-node">Chrome Web Serial API</div>
    <div class="diagram-node">WebSocket Bridge</div>
    <div class="diagram-node">HTTP Fetch Bridge</div>
  </div>
  <div class="diagram-arrow"></div>
  <div class="diagram-node node-start">Layer 4 — Firmware</div>
  <div class="diagram-arrow"></div>
  <div class="diagram-node node-process">Arduino SoftwareSerial + Servo µs timing<br/><small>btSerial.parseInt() for angle parsing</small></div>
</div>
    `
  },

  // 4. Engineering & Mathematics
  {
    id: 'eng-archimedes-buoyancy',
    title: "Buoyancy / Archimedes' Principle",
    category: 'Engineering',
    tag: 'Engineering & Mathematics',
    type: 'Physics Model',
    iconName: 'Droplet',
    description: "Mathematical formulation of buoyant lift forces ($F_b = \\\\rho \\\\cdot V \\\\cdot g$) governing hull displacement and vessel payload equilibrium.",
    actionLabel: 'View Physics Model',
    status: 'available',
    modalType: 'markdown',
    content: `
# Buoyancy Analysis & Archimedes' Principle

### Mathematical Model:
$$F_b = \\\\rho \\\\cdot V_{displaced} \\\\cdot g$$

Where:
- $\\\\rho = 1000 \\\\text{ kg/m}^3$ (Density of fresh water)
- $V_{displaced}$ = Volume of water displaced by hull
- $g = 9.81 \\\\text{ m/s}^2$ (Gravitational acceleration)

### Hull Displacement Calculation:
For a total platform mass $m = 0.650 \\\\text{ kg}$, required displaced volume:
$$V = \\\\frac{m}{\\\\rho} = \\\\frac{0.650}{1000} = 6.50 \\\\times 10^{-4} \\\\text{ m}^3 = 650 \\\\text{ cm}^3$$
    `
  },
  {
    id: 'eng-center-mass',
    title: 'Center of Mass & Stability Analysis',
    category: 'Engineering',
    tag: 'Engineering & Mathematics',
    type: 'Stability Study',
    iconName: 'Shield',
    description: 'Calculations for Metacentric Height ($GM = KB + BM - KG$) evaluating static stability, righting moments, and anti-capsizing safety margins.',
    actionLabel: 'View Analysis',
    status: 'available',
    modalType: 'markdown',
    content: `
# Center of Mass & Stability Analysis

### Metacentric Height Equation:
$$GM = KB + BM - KG$$

Where:
- **KB**: Distance from keel to center of buoyancy ($1.8 \\\\text{ cm}$)
- **BM**: Distance from center of buoyancy to metacenter ($4.2 \\\\text{ cm}$)
- **KG**: Height of center of gravity above keel ($3.2 \\\\text{ cm}$)

### Result:
$$GM = 1.8 + 4.2 - 3.2 = 2.8 \\\\text{ cm} > 0$$
Since $GM > 0$, the vessel exhibits positive static stability with inherent self-righting moments.
    `
  },
  {
    id: 'eng-calculus-opt',
    title: 'Calculus Optimization',
    category: 'Engineering',
    tag: 'Engineering & Mathematics',
    type: 'Math Model',
    iconName: 'TrendingUp',
    description: 'Differential calculus modeling optimal hull draft depth to minimize hydrodynamic skin friction drag while maximizing payload stability.',
    actionLabel: 'View Optimization',
    status: 'available',
    modalType: 'markdown',
    content: `
# Calculus Optimization of Hull Wetted Surface

### Objective:
Minimize total surface area $A(d)$ for a fixed volume $V$:
$$A(d) = B \\\\cdot L + 2 \\\\cdot d \\\\cdot (B + L)$$

Setting derivative $\\\\frac{dA}{dd} = 0$ yields optimal draft depth $d^*$ balancing skin friction and wave-making resistance.
    `
  },
  {
    id: 'eng-water-displacement',
    title: 'Water Displacement Model',
    category: 'Engineering',
    tag: 'Engineering & Mathematics',
    type: 'Hydrodynamics',
    iconName: 'Waves',
    description: 'Numerical estimation of hull draft lines, water displaced vs payload weight curves, and reserve buoyancy margins.',
    actionLabel: 'View Model',
    status: 'available',
    modalType: 'markdown',
    content: `
# Water Displacement Model

| Parameter | Value |
|---|---|
| Hull Length | 320 mm |
| Hull Beam (Width) | 120 mm |
| Design Draft | 25 mm |
| Max Reserve Buoyancy | 180% of total vessel weight |
    `
  },
  {
    id: 'eng-math-calc',
    title: 'Mathematical Calculations',
    category: 'Engineering',
    tag: 'Engineering & Mathematics',
    type: 'Calculations Sheet',
    iconName: 'Calculator',
    description: 'Comprehensive derivation sheet containing motor power consumption ($P = V \\\\cdot I$), propeller thrust estimates, and battery endurance models.',
    actionLabel: 'View Calculations',
    status: 'available',
    modalType: 'markdown',
    content: `
# System Mathematical Derivations

### 1. Power Consumption:
$$P = V \\\\cdot I = 7.4 \\\\text{V} \\\\cdot 2.2 \\\\text{A} = 16.28 \\\\text{ Watts}$$

### 2. Theoretical Battery Runtime:
$$\\\\text{Runtime} = \\\\frac{\\\\text{Capacity (mAh)} \\\\times 0.8}{\\\\text{Average Current (mA)}} = \\\\frac{1000 \\\\times 0.8}{800} = 1.0 \\\\text{ Hour (60 mins)}$$
    `
  },
  {
    id: 'eng-theo-vs-exp',
    title: 'Theoretical vs Experimental Results',
    category: 'Engineering',
    tag: 'Engineering & Mathematics',
    type: 'Experimental Report',
    iconName: 'BarChart2',
    description: 'Empirical validation table comparing mathematical predictions against real-world pool telemetry measurements.',
    actionLabel: 'View Comparison',
    status: 'available',
    modalType: 'markdown',
    content: `
# Theoretical vs Experimental Comparison

| Parameter | Theoretical | Measured | Variance |
|---|---|---|---|
| Vessel Weight | 620 g | 645 g | +4.0% |
| Top Speed | 1.8 m/s | 1.65 m/s | −8.3% |
| Turn Radius @ 45° | 0.85 m | 0.90 m | +5.8% |
| Signal Range (HC-06) | 10.0 m | 11.2 m | +12.0% |
| Battery Runtime | 60 mins | 54 mins | −10.0% |
    `
  },

  // 5. Design & Manufacturing
  {
    id: 'des-cad-drawings',
    title: 'CAD Drawings',
    category: 'Design',
    tag: 'Design & Manufacturing',
    type: 'CAD / Blueprint',
    iconName: 'Grid',
    description: '3D CAD assembly blueprints, hull cross-section profiles, motor mount bracket drawings, and rudder linkage geometries.',
    actionLabel: 'Coming Soon',
    status: 'coming-soon'
  },
  {
    id: 'des-platform-dimensions',
    title: 'Platform Dimensions',
    category: 'Design',
    tag: 'Design & Manufacturing',
    type: 'Dimensional Specs',
    iconName: 'Maximize',
    description: 'Exact physical dimensions, overall length, beam width, freeboard height, total weight, and center-of-gravity markers.',
    actionLabel: 'View Dimensions',
    status: 'available',
    modalType: 'markdown',
    content: `
# RUEA LOY RC Platform Dimensions

| Dimension | Value |
|---|---|
| Overall Length (LOA) | 340 mm |
| Beam (Max Width) | 125 mm |
| Total Height | 140 mm |
| Draft Depth | 25 mm |
| Freeboard Height | 45 mm |
| Dry Weight | 645 grams |
    `
  },
  {
    id: 'des-structural-design',
    title: 'Structural Design',
    category: 'Design',
    tag: 'Design & Manufacturing',
    type: 'Engineering Doc',
    iconName: 'Box',
    description: 'Structural chassis layout, internal bulkheads, waterproof compartment sealing, and vibration damping motor mounts.',
    actionLabel: 'View Design',
    status: 'available',
    modalType: 'markdown',
    content: `
# Structural Design Overview

- **Hull Geometry**: Monohull V-entry hull for wave piercing stability.
- **Bulkhead Separation**: Sealed electronics compartment separated from propulsion shaft cavity.
- **Damping**: Rubber grommets on 180SH motor bracket reducing chassis vibration by 40%.
    `
  },
  {
    id: 'des-material-selection',
    title: 'Material Selection',
    category: 'Design',
    tag: 'Design & Manufacturing',
    type: 'Materials Matrix',
    iconName: 'Layers',
    description: 'Materials selection matrix evaluating density, waterproofing, impact resistance, and manufacturability.',
    actionLabel: 'View Materials',
    status: 'available',
    modalType: 'markdown',
    content: `
# Material Selection Matrix

| Component | Selected Material | Key Property |
|---|---|---|
| Hull Structure | Waterproof Acrylic / PETG | High buoyancy, low density |
| Drive Shaft | Stainless Steel 316 | Corrosion resistance |
| Bearings | Brass | Low friction coefficient |
| Steering Rudder | Nylon Plastic | High impact strength |
    `
  },
  {
    id: 'des-manufacturing-doc',
    title: 'Manufacturing Documentation',
    category: 'Design',
    tag: 'Design & Manufacturing',
    type: 'Manufacturing Guide',
    iconName: 'Hammer',
    description: 'Step-by-step fabrication guidelines for hull thermoforming, laser cutting bulkhead plates, and shaft alignment.',
    actionLabel: 'Coming Soon',
    status: 'coming-soon'
  },
  {
    id: 'des-assembly-doc',
    title: 'Assembly Documentation',
    category: 'Design',
    tag: 'Design & Manufacturing',
    type: 'Assembly Guide',
    iconName: 'Wrench',
    description: 'Full mechanical & electrical assembly manual detailing component layout, wiring color codes, and waterproofing procedures.',
    actionLabel: 'Coming Soon',
    status: 'coming-soon'
  },
  {
    id: 'des-testing-doc',
    title: 'Testing Documentation',
    category: 'Design',
    tag: 'Design & Manufacturing',
    type: 'Test Protocol',
    iconName: 'CheckCircle',
    description: 'Field testing protocol covering waterproof immersion tests, Bluetooth range checks, and steering response latency benchmarks.',
    actionLabel: 'View Test Protocol',
    status: 'available',
    modalType: 'markdown',
    content: `
# Field Testing & Verification Protocol

### Test 1: Static Water Tightness Test
- Immersion in 30cm water tank for 60 minutes.
- Result: 0% water penetration into electronics deck.

### Test 2: Failsafe Execution Test
- Abrupt Bluetooth disconnect during 100% forward throttle.
- Result: ESC stopped within 280ms, well within 1.0s timeout limit.

### Test 3: Servo Calibration Test
- Calibrated LEFT = 45°, CENTER = 90°, RIGHT = 135° via Python GUI sliders.
- Failsafe center updated via \`c90\\n\` command. Auto-center confirmed on signal loss.
    `
  },

  // 6. References
  {
    id: 'ref-arduino-official',
    title: 'Arduino Official Documentation',
    category: 'References',
    tag: 'Academic & Technical Reference',
    type: 'External Reference',
    iconName: 'ExternalLink',
    description: 'Official API documentation for Arduino language core, digital/analog I/O methods, and hardware reference.',
    actionLabel: 'Open Reference',
    status: 'link',
    externalUrl: 'https://www.arduino.cc/reference/en/'
  },
  {
    id: 'ref-hc06-datasheet',
    title: 'HC-06 Datasheet',
    category: 'References',
    tag: 'Academic & Technical Reference',
    type: 'External Datasheet',
    iconName: 'File',
    description: 'Official manufacturer datasheet detailing electrical characteristics, RF frequency range, and SPP Bluetooth protocol specs.',
    actionLabel: 'Open Datasheet',
    status: 'link',
    externalUrl: 'https://components101.com/sites/default/files/component_datasheet/HC-06%20Datasheet.pdf'
  },
  {
    id: 'ref-mg90s-specs',
    title: 'MG90S Specifications',
    category: 'References',
    tag: 'Academic & Technical Reference',
    type: 'External Specs',
    iconName: 'Settings',
    description: 'TowerPro MG90S micro servo pinout, operating voltage ratings, gear train layout, and PWM pulse width control ranges.',
    actionLabel: 'Open Specs',
    status: 'link',
    externalUrl: 'https://www.electronicoscaldas.com/datasheet/MG90S_Tower-Pro.pdf'
  },
  {
    id: 'ref-servo-lib',
    title: 'Arduino Servo Library Documentation',
    category: 'References',
    tag: 'Academic & Technical Reference',
    type: 'External Reference',
    iconName: 'Book',
    description: 'Official reference for Arduino Servo.h library, PWM signal generation methods, and microsecond pulse control.',
    actionLabel: 'Open Reference',
    status: 'link',
    externalUrl: 'https://www.arduino.cc/reference/en/libraries/servo/'
  },
  {
    id: 'ref-stewart-calculus',
    title: 'Calculus: Early Transcendentals by James Stewart',
    category: 'References',
    tag: 'Academic Textbook',
    type: 'Textbook Reference',
    iconName: 'BookOpen',
    description: 'Standard academic calculus reference utilized for optimization of surface area derivatives and fluid displacement integrals.',
    actionLabel: 'Reference Info',
    status: 'link',
    externalUrl: 'https://www.cengage.com/c/calculus-early-transcendentals-9e-stewart/'
  },
  {
    id: 'ref-halliday-physics',
    title: 'Fundamentals of Physics by Halliday, Resnick, and Walker',
    category: 'References',
    tag: 'Academic Textbook',
    type: 'Textbook Reference',
    iconName: 'BookOpen',
    description: 'Classical physics reference textbook consulted for fluid mechanics, Archimedes buoyancy force, and rotational equilibrium equations.',
    actionLabel: 'Reference Info',
    status: 'link',
    externalUrl: 'https://www.wiley.com/en-us/Fundamentals+of+Physics%2C+12th+Edition-p-9781119773511'
  }
];
