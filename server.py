"""
RUEY ROY RC - MOBILE WI-FI TO BLUETOOTH SERIAL BRIDGE SERVER
=============================================================
This server allows any mobile phone on your local Wi-Fi network to control your 
Arduino Nano RC boat paired to your Windows PC via Bluetooth (HC-06).

How to run:
    python server.py [COM_PORT]
Example:
    python server.py COM4

Access from Mobile Phone:
    http://<YOUR_PC_IP>:8000
"""

import sys
import os
import time
import socket
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler
import serial
import serial.tools.list_ports

# Global Serial Port Handle & Configuration
SERIAL_PORT = None
BAUD_RATE = 9600
HTTP_PORT = 8000

def auto_detect_hc06_port():
    ports = serial.tools.list_ports.comports()
    for p in ports:
        hwid = str(p.hwid).upper()
        desc = str(p.description).upper()
        name = str(p.name).upper()
        if "BTHENUM" in hwid or "BLUETOOTH" in desc or "HC-06" in name or "HC-06" in desc:
            return p.device
    if ports:
        return ports[0].device
    return None

def init_serial(port_name=None):
    global SERIAL_PORT
    if not port_name:
        port_name = auto_detect_hc06_port()
    
    if not port_name:
        print("⚠️ Warning: No HC-06 Bluetooth COM port automatically detected.")
        print("   Specify COM port explicitly: python server.py COM4")
        return False

    try:
        SERIAL_PORT = serial.Serial(
            port=port_name,
            baudrate=BAUD_RATE,
            timeout=1,
            write_timeout=0
        )
        print(f"✅ Successfully connected to Bluetooth Serial on {port_name} @ {BAUD_RATE} baud.")
        # Send safe initial stop command
        SERIAL_PORT.write(b'S')
        return True
    except Exception as e:
        print(f"❌ Failed to open serial port {port_name}: {e}")
        return False

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "localhost"

class RueaRoyRequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        
        # API Command Endpoint: /api/cmd?c=U
        if parsed_url.path == '/api/cmd':
            query_params = urllib.parse.parse_qs(parsed_url.query)
            cmd_char = query_params.get('c', [''])[0]
            
            success = False
            if cmd_char and SERIAL_PORT and SERIAL_PORT.is_open:
                try:
                    SERIAL_PORT.write(cmd_char.encode('ascii'))
                    success = True
                except Exception as e:
                    print(f"Serial write error: {e}")

            self.send_response(200 if success else 400)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(f'{{"status": "{"ok" if success else "error"}", "cmd": "{cmd_char}"}}'.encode('utf-8'))
            return

        # Serve static web app files
        return super().do_GET()

    def do_POST(self):
        if self.path == '/api/cmd':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            
            cmd_char = 'S'
            try:
                data = urllib.parse.parse_qs(body)
                cmd_char = data.get('c', ['S'])[0]
            except Exception:
                cmd_char = body.strip()

            success = False
            if SERIAL_PORT and SERIAL_PORT.is_open:
                try:
                    SERIAL_PORT.write(cmd_char.encode('ascii'))
                    success = True
                except Exception as e:
                    print(f"Serial write error: {e}")

            self.send_response(200 if success else 400)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(f'{{"status": "{"ok" if success else "error"}", "cmd": "{cmd_char}"}}'.encode('utf-8'))
            return

def main():
    target_port = sys.argv[1] if len(sys.argv) > 1 else None
    init_serial(target_port)

    local_ip = get_local_ip()
    server_address = ('', HTTP_PORT)
    httpd = HTTPServer(server_address, RueaRoyRequestHandler)

    print("\n" + "="*70)
    print("🚤 RUEY ROY RC MOBILE SERVER RUNNING")
    print("="*70)
    print(f"📱 Open this URL on your phone's browser:")
    print(f"   👉 http://{local_ip}:{HTTP_PORT}")
    print(f"   👉 http://localhost:{HTTP_PORT}")
    print("="*70 + "\n")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        if SERIAL_PORT and SERIAL_PORT.is_open:
            SERIAL_PORT.write(b'S')
            SERIAL_PORT.close()
        httpd.server_close()

if __name__ == '__main__':
    main()
