/*
 * ============================================================================
 * Project: Ruea-Roy RC By SPR41 🚤🎮
 * Target Hardware: Arduino Nano, HC-06 Bluetooth, MG996R Servo, ESC & Motor
 * 
 * Pin Configuration:
 * - HC-06 TXD -> Arduino Nano D10 (BT_RX_PIN)
 * - HC-06 RXD -> Arduino Nano D11 (BT_TX_PIN) via Voltage Divider
 * - MG996R Steering Servo Signal -> Arduino Nano D9 (SERVO_PIN)
 * - ESC Pulse Signal -> Arduino Nano D3 (ESC_PIN)
 * 
 * Features:
 * - Safe Startup Routine (Arming ESC @ 1000 µs for 2 seconds)
 * - State Deduplication (Prevents redundant servo/ESC writes & jitter)
 * - Robust 1-Second Failsafe (Cuts ESC & centers servo on signal loss)
 * - Support for Movement & Heartbeat Commands
 * - Optional AT Configuration Mode (#define ENABLE_AT_CONFIG false)
 * ============================================================================
 */

#include <SoftwareSerial.h>
#include <Servo.h>

// ----------------------------------------------------------------------------
// Pin Definitions
// ----------------------------------------------------------------------------
#define BT_RX_PIN     10  // Nano D10 connected to HC-06 TX
#define BT_TX_PIN     11  // Nano D11 connected to HC-06 RX (via voltage divider)
#define SERVO_PIN     9   // MG996R Steering Servo
#define ESC_PIN       3   // Electronic Speed Controller (ESC)

// ----------------------------------------------------------------------------
// Control Parameters & Constants
// ----------------------------------------------------------------------------
#define SERVO_CENTER   90  // Straight / Neutral steering (degrees)
#define SERVO_LEFT    130  // Full left turn (degrees)
#define SERVO_RIGHT    50  // Full right turn (degrees)

#define ESC_STOP     1000  // Motor Stop / Neutral pulse width (microseconds)
#define ESC_UP       1500  // Forward throttle pulse width (microseconds)
#define ESC_DOWN     1700  // Reverse throttle pulse width (microseconds)

#define FAILSAFE_TIMEOUT_MS 1000  // Failsafe timeout in milliseconds (1.0 second)
#define ENABLE_AT_CONFIG    false // Set true ONLY when configuring HC-06 baud/name/PIN

// ----------------------------------------------------------------------------
// Global Objects & State Variables
// ----------------------------------------------------------------------------
SoftwareSerial BTSerial(BT_RX_PIN, BT_TX_PIN);
Servo steeringServo;
Servo escMotor;

int currentServoAngle = -1;  // Tracks current servo position to prevent unnecessary writes
int currentESCPulse   = -1;  // Tracks current ESC pulse width to prevent unnecessary writes

unsigned long lastCmdTime = 0; // Timestamp of last valid command received
bool failsafeActive       = false;

// ----------------------------------------------------------------------------
// Helper Functions for Safe Output Control (Deduplication)
// ----------------------------------------------------------------------------

/**
 * Sets the steering servo angle only if it differs from the current angle.
 * Prevents continuous servo updates and PWM jitter.
 */
void setServoAngle(int angle) {
  angle = constrain(angle, 30, 150); // Hard limits for safety
  if (angle != currentServoAngle) {
    steeringServo.write(angle);
    currentServoAngle = angle;
  }
}

/**
 * Sets the ESC pulse width in microseconds only if it differs from current value.
 * Ensures clean and predictable throttle control.
 */
void setESCPulse(int pulseUs) {
  pulseUs = constrain(pulseUs, 1000, 2000); // Standard ESC pulse boundaries
  if (pulseUs != currentESCPulse) {
    escMotor.writeMicroseconds(pulseUs);
    currentESCPulse = pulseUs;
  }
}

/**
 * Emergency Stop & Failsafe Execution.
 * Immediately cuts throttle (1000 µs) and centers steering (90°).
 */
void triggerFailsafe() {
  setESCPulse(ESC_STOP);
  setServoAngle(SERVO_CENTER);
  failsafeActive = true;
}

// ----------------------------------------------------------------------------
// Arduino Setup & Startup Safety
// ----------------------------------------------------------------------------
void setup() {
  // Initialize Hardware Hardware Serial for Debugging (Optional)
  Serial.begin(9600);

  // Initialize SoftwareSerial for HC-06 Bluetooth @ 9600 baud
  BTSerial.begin(9600);

  // 1. Startup Safety: Attach hardware pins & force safe initial states
  steeringServo.attach(SERVO_PIN);
  escMotor.attach(ESC_PIN);

  // Force center steering and zero throttle immediately
  setServoAngle(SERVO_CENTER);
  setESCPulse(ESC_STOP);

  // 2. ESC Arming Delay: Wait 2.0 seconds for ESC to initialize cleanly at 1000 µs
  // Prevents accidental motor spin-up during power-on transients
  delay(2000);

#if ENABLE_AT_CONFIG
  // Optional AT Configuration mode (Use only when setting up a fresh HC-06)
  runATConfigMode();
#endif

  // Initialize command timestamp
  lastCmdTime = millis();
  failsafeActive = false;
}

// ----------------------------------------------------------------------------
// Arduino Main Loop
// ----------------------------------------------------------------------------
void loop() {
#if ENABLE_AT_CONFIG
  // Passthrough loop if AT config mode is active
  if (BTSerial.available()) Serial.write(BTSerial.read());
  if (Serial.available()) BTSerial.write(Serial.read());
  return;
#endif

  // 1. Read incoming Bluetooth commands
  while (BTSerial.available() > 0) {
    char cmd = BTSerial.read();

    // Process valid commands
    switch (cmd) {
      case 'L':
      case 'l':
        setServoAngle(SERVO_LEFT);
        lastCmdTime = millis();
        failsafeActive = false;
        break;

      case 'R':
      case 'r':
        setServoAngle(SERVO_RIGHT);
        lastCmdTime = millis();
        failsafeActive = false;
        break;

      case 'C':
      case 'c':
        setServoAngle(SERVO_CENTER);
        lastCmdTime = millis();
        failsafeActive = false;
        break;

      case 'U':
      case 'u':
        setESCPulse(ESC_UP);
        lastCmdTime = millis();
        failsafeActive = false;
        break;

      case 'D':
      case 'd':
        setESCPulse(ESC_DOWN);
        lastCmdTime = millis();
        failsafeActive = false;
        break;

      case 'N':
      case 'n':
        setESCPulse(ESC_STOP);
        lastCmdTime = millis();
        failsafeActive = false;
        break;

      case 'S':
      case 's':
        triggerFailsafe();
        lastCmdTime = millis();
        failsafeActive = false;
        break;

      case '.':
        // Heartbeat tick: Resets failsafe timer without altering current ESC or Servo state
        lastCmdTime = millis();
        failsafeActive = false;
        break;

      default:
        // Ignore whitespace, newline (\r, \n) or unknown noise characters
        break;
    }
  }

  // 2. Failsafe Monitor: Trigger safe stop if no valid command received for > 1.0s
  if (millis() - lastCmdTime >= FAILSAFE_TIMEOUT_MS) {
    if (!failsafeActive) {
      triggerFailsafe();
    }
  }
}

// ----------------------------------------------------------------------------
// Optional HC-06 Configuration Utility
// ----------------------------------------------------------------------------
#if ENABLE_AT_CONFIG
void runATConfigMode() {
  // Example configuration commands for HC-06 module:
  // Note: Standard HC-06 enters AT mode automatically when NOT connected via Bluetooth.
  // BTSerial.print("AT"); delay(1000);
  // BTSerial.print("AT+NAME=RUEY-ROY-RC"); delay(1000);
  // BTSerial.print("AT+PIN=7392"); delay(1000);
  // BTSerial.print("AT+BAUD4"); // 9600 baud
}
#endif
