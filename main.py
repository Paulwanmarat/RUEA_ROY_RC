import tkinter as tk
from tkinter import ttk, messagebox
import serial
import serial.tools.list_ports
import time
import json
import os

class RueaRoyMotorController:
    def __init__(self, root):
        self.root = root
        self.root.title("RUEA-ROY RC Controller")
        self.root.geometry("400x720")
        self.root.configure(bg="#1E1E1E")
        self.root.resizable(False, False)

        # --- LOAD SAVED SERVO POSITIONS ---
        self.config_file = "servo_config.json"
        self.angles = {"LEFT": 45, "CENTER": 90, "RIGHT": 135}
        self.load_config()

        self.serial_port = None
        self.is_connected = False
        
        self.keys_pressed = set()
        self.mouse_fwd = False
        self.mouse_bwd = False
        self.mouse_left = False
        self.mouse_right = False
        self.space_pressed = False
        
        self.current_motor_state = "STOP"
        self.current_steering_state = "CENTER"
        self.key_release_jobs = {}

        self.setup_ui()
        
        self.root.bind_all('<KeyPress>', self.on_key_press)
        self.root.bind_all('<KeyRelease>', self.on_key_release)
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

        self.root.after(250, self.heartbeat_loop)

    # --- CONFIGURATION SAVE/LOAD ---
    def load_config(self):
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, "r") as f:
                    self.angles.update(json.load(f))
            except Exception:
                pass

    def save_config(self):
        with open(self.config_file, "w") as f:
            json.dump(self.angles, f)

    def setup_ui(self):
        style = ttk.Style()
        style.theme_use('clam')
        
        tk.Label(self.root, text="🚤 RUEA-ROY RC", font=("Arial", 18, "bold"), bg="#1E1E1E", fg="#FFFFFF").pack(pady=(10, 2))
        
        conn_frame = tk.Frame(self.root, bg="#2E2E2E", padx=10, pady=10)
        conn_frame.pack(fill="x", padx=15, pady=2)
        
        row_frame = tk.Frame(conn_frame, bg="#2E2E2E")
        row_frame.pack(fill="x")
        
        self.port_combo = ttk.Combobox(row_frame, state="readonly", width=8)
        self.port_combo.pack(side="left", padx=(0, 5))
        self.scan_ports()
        
        tk.Button(row_frame, text="Scan", command=self.scan_ports, bg="#444444", fg="#FFFFFF", relief="flat", width=5).pack(side="left", padx=(0, 5))
        self.btn_connect = tk.Button(row_frame, text="Connect", command=self.connect, bg="#2E7D32", fg="#FFFFFF", relief="flat", width=7)
        self.btn_connect.pack(side="left", padx=(0, 5))
        
        self.btn_disconnect = tk.Button(row_frame, text="Disconnect", command=self.disconnect, bg="#C62828", fg="#FFFFFF", relief="flat", width=9, state=tk.DISABLED)
        self.btn_disconnect.pack(side="left")

        ctrl_frame = tk.Frame(self.root, bg="#1E1E1E")
        ctrl_frame.pack(fill="both", expand=True, padx=15, pady=10)
        
        steer_frame = tk.Frame(ctrl_frame, bg="#1E1E1E")
        steer_frame.pack(fill="x", pady=2)
        
        self.btn_left = tk.Button(steer_frame, text="◄ LEFT", font=("Arial", 10, "bold"), bg="#444444", fg="#FFFFFF", height=2, relief="flat")
        self.btn_left.pack(side="left", expand=True, fill="x", padx=(0, 3))
        self.btn_left.bind('<ButtonPress-1>', lambda e: self.on_mouse_steering('left', True, self.btn_left))
        self.btn_left.bind('<ButtonRelease-1>', lambda e: self.on_mouse_steering('left', False, self.btn_left))

        self.btn_right = tk.Button(steer_frame, text="RIGHT ►", font=("Arial", 10, "bold"), bg="#444444", fg="#FFFFFF", height=2, relief="flat")
        self.btn_right.pack(side="right", expand=True, fill="x", padx=(3, 0))
        self.btn_right.bind('<ButtonPress-1>', lambda e: self.on_mouse_steering('right', True, self.btn_right))
        self.btn_right.bind('<ButtonRelease-1>', lambda e: self.on_mouse_steering('right', False, self.btn_right))

        self.btn_fwd = tk.Button(ctrl_frame, text="▲ FORWARD", font=("Arial", 11, "bold"), bg="#444444", fg="#FFFFFF", height=2, relief="flat")
        self.btn_fwd.pack(fill="x", pady=4)
        self.btn_fwd.bind('<ButtonPress-1>', lambda e: self.on_mouse_motor('fwd', True, self.btn_fwd))
        self.btn_fwd.bind('<ButtonRelease-1>', lambda e: self.on_mouse_motor('fwd', False, self.btn_fwd))

        self.btn_bwd = tk.Button(ctrl_frame, text="▼ BACKWARD", font=("Arial", 11, "bold"), bg="#444444", fg="#FFFFFF", height=2, relief="flat")
        self.btn_bwd.pack(fill="x", pady=4)
        self.btn_bwd.bind('<ButtonPress-1>', lambda e: self.on_mouse_motor('bwd', True, self.btn_bwd))
        self.btn_bwd.bind('<ButtonRelease-1>', lambda e: self.on_mouse_motor('bwd', False, self.btn_bwd))

        self.btn_stop = tk.Button(ctrl_frame, text="🛑 STOP", font=("Arial", 12, "bold"), bg="#B71C1C", fg="#FFFFFF", height=2, relief="flat")
        self.btn_stop.pack(fill="x", pady=8)
        self.btn_stop.bind('<ButtonPress-1>', lambda e: self.on_mouse_motor('stop', True, self.btn_stop))
        self.btn_stop.bind('<ButtonRelease-1>', lambda e: self.on_mouse_motor('stop', False, self.btn_stop))

        # CALIBRATION BUTTON
        self.btn_calib = tk.Button(ctrl_frame, text="⚙️ Calibrate Steering Positions", font=("Arial", 9), bg="#4A148C", fg="white", command=self.open_calibration, relief="flat", pady=5)
        self.btn_calib.pack(fill="x", pady=(15,0))

        self.status_lbl = tk.Label(self.root, text="Status: [ DISCONNECTED ]", font=("Arial", 10, "bold"), bg="#1E1E1E", fg="#FF9800", pady=5)
        self.status_lbl.pack(side="bottom", pady=5)

    # --- CALIBRATION WINDOW ---
    def open_calibration(self):
        calib_win = tk.Toplevel(self.root)
        calib_win.title("Steering Calibration")
        calib_win.geometry("300x320")
        calib_win.configure(bg="#2E2E2E")
        calib_win.transient(self.root) # Keeps window on top
        
        tk.Label(calib_win, text="Drag sliders to tune. Updates in real-time.", bg="#2E2E2E", fg="#AAAAAA").pack(pady=10)
        
        def live_test(val):
            self.send_serial(f"x{val}\n")

        tk.Label(calib_win, text="LEFT Angle", bg="#2E2E2E", fg="white", font=("Arial", 9, "bold")).pack()
        left_scale = tk.Scale(calib_win, from_=0, to_=180, orient="horizontal", bg="#2E2E2E", fg="white", length=220, command=live_test, highlightthickness=0)
        left_scale.set(self.angles["LEFT"])
        left_scale.pack(pady=(0, 5))
        
        tk.Label(calib_win, text="CENTER Angle", bg="#2E2E2E", fg="white", font=("Arial", 9, "bold")).pack()
        center_scale = tk.Scale(calib_win, from_=0, to_=180, orient="horizontal", bg="#2E2E2E", fg="white", length=220, command=live_test, highlightthickness=0)
        center_scale.set(self.angles["CENTER"])
        center_scale.pack(pady=(0, 5))
        
        tk.Label(calib_win, text="RIGHT Angle", bg="#2E2E2E", fg="white", font=("Arial", 9, "bold")).pack()
        right_scale = tk.Scale(calib_win, from_=0, to_=180, orient="horizontal", bg="#2E2E2E", fg="white", length=220, command=live_test, highlightthickness=0)
        right_scale.set(self.angles["RIGHT"])
        right_scale.pack(pady=(0, 15))
        
        def save_and_close():
            self.angles["LEFT"] = int(left_scale.get())
            self.angles["CENTER"] = int(center_scale.get())
            self.angles["RIGHT"] = int(right_scale.get())
            self.save_config()
            
            # Tell Arduino what the new safe Center is
            self.send_serial(f"c{self.angles['CENTER']}\n")
            self.send_serial(f"x{self.angles['CENTER']}\n")
            calib_win.destroy()
            
        tk.Button(calib_win, text="Save & Close", bg="#4CAF50", fg="white", font=("Arial", 10, "bold"), command=save_and_close, relief="flat", width=15).pack()

    # --- INPUT EVENT HANDLERS ---
    def on_key_press(self, event):
        sym = event.keysym.lower()
        if sym not in ['w', 's', 'a', 'd', 'up', 'down', 'left', 'right', 'space']: return
        
        if sym in self.key_release_jobs:
            self.root.after_cancel(self.key_release_jobs[sym])
            del self.key_release_jobs[sym]

        if sym == "space": self.space_pressed = True
        else: self.keys_pressed.add(sym)
        self.resolve_states()
        return "break"

    def on_key_release(self, event):
        sym = event.keysym.lower()
        if sym not in ['w', 's', 'a', 'd', 'up', 'down', 'left', 'right', 'space']: return
        job = self.root.after(50, lambda: self.execute_key_release(sym))
        self.key_release_jobs[sym] = job
        return "break"

    def execute_key_release(self, sym):
        if sym in self.key_release_jobs: del self.key_release_jobs[sym]
        if sym == "space": self.space_pressed = False
        else: self.keys_pressed.discard(sym)
        self.resolve_states()

    def on_mouse_motor(self, btn, is_pressed, widget):
        if btn == 'fwd': self.mouse_fwd = is_pressed
        elif btn == 'bwd': self.mouse_bwd = is_pressed
        elif btn == 'stop': self.space_pressed = is_pressed
        self.resolve_states()

    def on_mouse_steering(self, side, is_pressed, widget):
        if side == 'left': self.mouse_left = is_pressed
        elif side == 'right': self.mouse_right = is_pressed
        self.resolve_states()

    def resolve_states(self):
        fwd_intent = ('w' in self.keys_pressed) or ('up' in self.keys_pressed) or self.mouse_fwd
        bwd_intent = ('s' in self.keys_pressed) or ('down' in self.keys_pressed) or self.mouse_bwd
        if self.space_pressed or (fwd_intent and bwd_intent): new_motor = "STOP"
        elif fwd_intent: new_motor = "FORWARD"
        elif bwd_intent: new_motor = "BACKWARD"
        else: new_motor = "STOP"

        left_intent = ('a' in self.keys_pressed) or ('left' in self.keys_pressed) or self.mouse_left
        right_intent = ('d' in self.keys_pressed) or ('right' in self.keys_pressed) or self.mouse_right
        if left_intent and right_intent: new_steer = "CENTER"
        elif left_intent: new_steer = "LEFT"
        elif right_intent: new_steer = "RIGHT"
        else: new_steer = "CENTER"

        if new_motor != self.current_motor_state or new_steer != self.current_steering_state:
            self.current_motor_state = new_motor
            self.current_steering_state = new_steer
            self.update_gui_visuals()
            self.send_state_commands()

    def send_state_commands(self):
        if self.current_motor_state == "FORWARD": self.send_serial("u")
        elif self.current_motor_state == "BACKWARD": self.send_serial("d")
        elif self.current_motor_state == "STOP": self.send_serial("n")

        self.send_serial(f"x{self.angles[self.current_steering_state]}\n")

    def heartbeat_loop(self):
        if self.is_connected:
            if self.current_motor_state == "FORWARD": self.send_serial("u")
            elif self.current_motor_state == "BACKWARD": self.send_serial("d")
            elif self.current_motor_state == "STOP": self.send_serial(".")
            self.send_serial(f"x{self.angles[self.current_steering_state]}\n")
            
        self.root.after(250, self.heartbeat_loop)

    def send_serial(self, cmd):
        if self.is_connected and self.serial_port and self.serial_port.is_open:
            try:
                self.serial_port.write(cmd.encode())
            except serial.SerialException:
                self.disconnect(error=True)

    def scan_ports(self):
        ports = [port.device for port in serial.tools.list_ports.comports()]
        self.port_combo['values'] = ports
        if ports: self.port_combo.current(0)

    def connect(self):
        port = self.port_combo.get()
        if not port: return
        try:
            self.serial_port = serial.Serial(port, 9600, timeout=1)
            time.sleep(2)
            self.is_connected = True
            self.keys_pressed.clear()
            self.current_motor_state = "STOP"
            self.current_steering_state = "CENTER"
            
            # Send initial stop and setup failsafe center
            self.send_serial("n")
            self.send_serial(f"c{self.angles['CENTER']}\n")
            self.send_serial(f"x{self.angles['CENTER']}\n")
            
            self.btn_connect.config(state=tk.DISABLED)
            self.btn_disconnect.config(state=tk.NORMAL)
            self.update_gui_visuals()
        except Exception as e:
            messagebox.showerror("Connection Error", str(e))

    def disconnect(self, error=False):
        if self.is_connected:
            self.send_serial("n")
            self.send_serial(f"x{self.angles['CENTER']}\n")
            if self.serial_port:
                try:
                    time.sleep(0.1)
                    self.serial_port.close()
                except: pass
        self.is_connected = False
        self.btn_connect.config(state=tk.NORMAL)
        self.btn_disconnect.config(state=tk.DISABLED)
        self.update_gui_visuals()

    def update_gui_visuals(self):
        if not self.is_connected:
            self.status_lbl.config(text="Status: [ DISCONNECTED ]", fg="#FF9800")
            return

        self.btn_fwd.config(bg="#4CAF50" if self.current_motor_state == "FORWARD" else "#444444")
        self.btn_bwd.config(bg="#2196F3" if self.current_motor_state == "BACKWARD" else "#444444")
        self.btn_left.config(bg="#FF9800" if self.current_steering_state == "LEFT" else "#444444")
        self.btn_right.config(bg="#FF9800" if self.current_steering_state == "RIGHT" else "#444444")

        self.status_lbl.config(
            text=f"Motor: [ {self.current_motor_state} ] | Steering: [ {self.current_steering_state} ]",
            fg="#4CAF50" if self.current_motor_state != "STOP" else "#F44336"
        )

    def on_close(self):
        self.disconnect()
        self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = RueaRoyMotorController(root)
    root.mainloop()