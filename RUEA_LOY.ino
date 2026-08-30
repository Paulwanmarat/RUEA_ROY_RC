#include <SoftwareSerial.h>
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
    if (cmd == '\r' || cmd == '\n') return; 

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
    // --- Steering Commands (New Format) ---
    else if (cmd == 'x') {
      // Read the number sent after 'x' (e.g., x45\n reads 45)
      int angle = btSerial.parseInt();
      // Constrain it just in case, ensuring it physically cannot exceed limits
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
      steeringServo.write(failsafeCenter); // Auto-center rudder on signal loss
    }
  }
}