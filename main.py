import sys
import tkinter as tk
from tkinter import ttk, messagebox
import serial
import serial.tools.list_ports
import time

# =============================================================================
# CONFIGURABLE PARAMETERS
# =============================================================================
APP_TITLE = "Ruea-Roy RC By SPR41"
HEARTBEAT_INTERVAL_MS = 250  # 250 ms = 4x margin vs 1000 ms Arduino failsafe
KEY_RELEASE_DEBOUNCE_MS = 25 # Debounce timer to filter out Windows OS auto-repeat key release events

# =============================================================================
# RUEA-ROY RC APPLICATION CLASS
# =============================================================================
class RueaRoyRCApp:
    def __init__(self, root):
        self.root = root
        self.root.title(APP_TITLE)
        self.root.geometry("500x650")
        self.root.resizable(False, False)

        # Serial Connection State
        self.serial_port = None
        self.is_connected = False
        self.port_mapping = {}

        # Control States
        self.active_keys = set()
        self.release_timers = {}
        
        self.current_throttle_cmd = 'N'  # 'U' (Up), 'D' (Down), 'N' (Neutral)
        self.current_steering_cmd = 'C'  # 'L' (Left), 'R' (Right), 'C' (Center)
        self.last_sent_cmd = 'S'
        self.last_cmd_send_time = 0

        # Custom Dark Theme Color Palette
        self.bg_dark = "#181825"
        self.card_bg = "#1e1e2e"
        self.text_main = "#cdd6f4"
        self.text_sub = "#a6adc8"
        self.btn_bg = "#313244"
        self.btn_active = "#45475a"
        self.btn_highlight = "#89b4fa"
        self.green_accent = "#a6e3a1"
        self.red_accent = "#f38ba8"
        self.yellow_accent = "#f9e2af"
        self.blue_accent = "#89b4fa"

        self.root.configure(bg=self.bg_dark)
        
        # Configure Styles
        self.style = ttk.Style()
        self.style.theme_use('default')
        self.style.configure("TCombobox", fieldbackground=self.btn_bg, background=self.btn_bg, foreground=self.text_main)

        self._build_ui()
        self._bind_keyboard_controls()
        self.refresh_ports()

        # Start periodic Heartbeat & Connection Loop
        self.root.after(HEARTBEAT_INTERVAL_MS, self._heartbeat_loop)

    # -------------------------------------------------------------------------
    # USER INTERFACE CONSTRUCTION
    # -------------------------------------------------------------------------
    def _build_ui(self):
        # Header / Title
        header_frame = tk.Frame(self.root, bg=self.bg_dark, pady=15)
        header_frame.pack(fill="x")

        title_label = tk.Label(
            header_frame, 
            text=APP_TITLE, 
            font=("Segoe UI", 18, "bold"), 
            bg=self.bg_dark, 
            fg=self.blue_accent
        )
        title_label.pack()

        sub_label = tk.Label(
            header_frame, 
            text="Arduino Nano Bluetooth Controller (HC-06)", 
            font=("Segoe UI", 9), 
            bg=self.bg_dark, 
            fg=self.text_sub
        )
        sub_label.pack()

        # Connection Card Frame
        conn_card = tk.LabelFrame(
            self.root, 
            text=" Connection Settings ", 
            font=("Segoe UI", 10, "bold"),
            bg=self.card_bg, 
            fg=self.text_main, 
            bd=1, 
            relief="solid", 
            padx=15, 
            pady=10
        )
        conn_card.pack(fill="x", padx=20, pady=5)

        # Port Selection Row
        port_row = tk.Frame(conn_card, bg=self.card_bg)
        port_row.pack(fill="x", pady=5)

        tk.Label(port_row, text="Device:", font=("Segoe UI", 10), bg=self.card_bg, fg=self.text_main).pack(side="left", padx=(0, 10))

        self.port_combobox = ttk.Combobox(port_row, state="readonly", width=25)
        self.port_combobox.pack(side="left", padx=5)

        self.refresh_btn = tk.Button(
            port_row, 
            text="↻ Scan", 
            command=self.refresh_ports,
            bg=self.btn_bg, 
            fg=self.text_main, 
            activebackground=self.btn_active,
            activeforeground=self.text_main,
            font=("Segoe UI", 9), 
            relief="flat",
            cursor="hand2"
        )
        self.refresh_btn.pack(side="left", padx=5)

        # Action Buttons Row
        action_row = tk.Frame(conn_card, bg=self.card_bg)
        action_row.pack(fill="x", pady=10)

        self.connect_btn = tk.Button(
            action_row, 
            text="Connect", 
            command=self.connect_serial, 
            bg=self.green_accent, 
            fg="#11111b",
            font=("Segoe UI", 10, "bold"), 
            relief="flat", 
            padx=15, 
            pady=4,
            cursor="hand2"
        )
        self.connect_btn.pack(side="left", padx=(0, 10))

        self.disconnect_btn = tk.Button(
            action_row, 
            text="Disconnect", 
            command=self.disconnect_serial, 
            bg=self.btn_bg, 
            fg=self.text_sub,
            font=("Segoe UI", 10), 
            relief="flat", 
            padx=15, 
            pady=4, 
            state="disabled",
            cursor="hand2"
        )
        self.disconnect_btn.pack(side="left")

        # Status Bar Frame
        status_frame = tk.Frame(conn_card, bg=self.card_bg)
        status_frame.pack(fill="x", pady=(5, 0))

        tk.Label(status_frame, text="Status:", font=("Segoe UI", 9, "bold"), bg=self.card_bg, fg=self.text_sub).pack(side="left", padx=(0, 5))
        
        self.status_label = tk.Label(
            status_frame, 
            text="DISCONNECTED", 
            font=("Segoe UI", 10, "bold"), 
            bg=self.card_bg, 
            fg=self.red_accent
        )
        self.status_label.pack(side="left")

        # Remote Control Frame
        ctrl_frame = tk.LabelFrame(
            self.root, 
            text=" Remote Controls (Hold W / A / S / D or Click) ", 
            font=("Segoe UI", 10, "bold"),
            bg=self.card_bg, 
            fg=self.text_main, 
            bd=1, 
            relief="solid", 
            padx=10, 
            pady=15
        )
        ctrl_frame.pack(fill="both", expand=True, padx=20, pady=10)

        # Button Grid Layout
        grid_container = tk.Frame(ctrl_frame, bg=self.card_bg)
        grid_container.pack(expand=True)

        # UP Button (W)
        self.btn_up = tk.Button(
            grid_container, 
            text="▲\nUP (W)", 
            font=("Segoe UI", 11, "bold"),
            bg=self.btn_bg, 
            fg=self.text_main,
            activebackground=self.blue_accent,
            activeforeground="#11111b",
            width=10, 
            height=2,
            relief="raised", 
            cursor="hand2"
        )
        self.btn_up.grid(row=0, column=1, pady=6, padx=6)
        self._bind_mouse_button(self.btn_up, 'w')

        # LEFT Button (A)
        self.btn_left = tk.Button(
            grid_container, 
            text="◄ LEFT (A)", 
            font=("Segoe UI", 11, "bold"),
            bg=self.btn_bg, 
            fg=self.text_main,
            activebackground=self.blue_accent,
            activeforeground="#11111b",
            width=12, 
            height=2,
            relief="raised", 
            cursor="hand2"
        )
        self.btn_left.grid(row=1, column=0, pady=6, padx=6)
        self._bind_mouse_button(self.btn_left, 'a')

        # RIGHT Button (D)
        self.btn_right = tk.Button(
            grid_container, 
            text="RIGHT (D) ►", 
            font=("Segoe UI", 11, "bold"),
            bg=self.btn_bg, 
            fg=self.text_main,
            activebackground=self.blue_accent,
            activeforeground="#11111b",
            width=12, 
            height=2,
            relief="raised", 
            cursor="hand2"
        )
        self.btn_right.grid(row=1, column=2, pady=6, padx=6)
        self._bind_mouse_button(self.btn_right, 'd')

        # DOWN Button (S)
        self.btn_down = tk.Button(
            grid_container, 
            text="▼\nDOWN (S)", 
            font=("Segoe UI", 11, "bold"),
            bg=self.btn_bg, 
            fg=self.text_main,
            activebackground=self.blue_accent,
            activeforeground="#11111b",
            width=10, 
            height=2,
            relief="raised", 
            cursor="hand2"
        )
        self.btn_down.grid(row=2, column=1, pady=6, padx=6)
        self._bind_mouse_button(self.btn_down, 's')

        # STOP Button (Space)
        self.btn_stop = tk.Button(
            grid_container, 
            text="🛑 EMERGENCY STOP (Space)", 
            font=("Segoe UI", 13, "bold"),
            bg=self.red_accent, 
            fg="#11111b",
            activebackground="#ff5555",
            activeforeground="#ffffff",
            width=26, 
            height=2,
            relief="raised", 
            cursor="hand2",
            command=self.trigger_emergency_stop
        )
        self.btn_stop.grid(row=3, column=0, columnspan=3, pady=(15, 5), padx=6)

        # Command & Status Display Frame
        log_frame = tk.Frame(self.root, bg=self.bg_dark, pady=10)
        log_frame.pack(fill="x", padx=20)

        tk.Label(log_frame, text="Active State:", font=("Segoe UI", 9), bg=self.bg_dark, fg=self.text_sub).pack(side="left")
        self.cmd_display = tk.Label(log_frame, text="[ STOP (S) ]", font=("Segoe UI", 10, "bold"), bg=self.bg_dark, fg=self.blue_accent)
        self.cmd_display.pack(side="left", padx=5)

    # -------------------------------------------------------------------------
    # KEYBOARD & MOUSE EVENT HANDLING
    # -------------------------------------------------------------------------
    def _bind_mouse_button(self, btn_widget, key_name):
        btn_widget.bind("<ButtonPress-1>", lambda e: self._on_key_press_action(key_name))
        btn_widget.bind("<ButtonRelease-1>", lambda e: self._on_key_release_action(key_name))

    def _bind_keyboard_controls(self):
        self.root.bind("<KeyPress>", self._handle_key_press)
        self.root.bind("<KeyRelease>", self._handle_key_release)

    def _handle_key_press(self, event):
        key = event.keysym.lower()
        if key == 'space':
            self.trigger_emergency_stop()
            return

        if key in ('w', 'a', 's', 'd'):
            # Filter out Windows OS key auto-repeat flickering
            if key in self.release_timers:
                self.root.after_cancel(self.release_timers[key])
                del self.release_timers[key]

            if key not in self.active_keys:
                self.active_keys.add(key)
                self._evaluate_controls()

    def _handle_key_release(self, event):
        key = event.keysym.lower()
        if key in ('w', 'a', 's', 'd'):
            if key in self.release_timers:
                self.root.after_cancel(self.release_timers[key])

            self.release_timers[key] = self.root.after(
                KEY_RELEASE_DEBOUNCE_MS, 
                lambda k=key: self._real_key_release(k)
            )

    def _real_key_release(self, key):
        if key in self.release_timers:
            del self.release_timers[key]

        if key in self.active_keys:
            self.active_keys.remove(key)
            self._evaluate_controls()

    def _on_key_press_action(self, key):
        self.active_keys.add(key)
        self._evaluate_controls()

    def _on_key_release_action(self, key):
        if key in self.active_keys:
            self.active_keys.remove(key)
            self._evaluate_controls()

    def trigger_emergency_stop(self):
        self.active_keys.clear()
        self.current_throttle_cmd = 'N'
        self.current_steering_cmd = 'C'
        self.update_button_visuals()
        self.send_serial_char('S')

    # -------------------------------------------------------------------------
    # CONTROL EVALUATION & VISUAL UPDATES
    # -------------------------------------------------------------------------
    def _evaluate_controls(self):
        # 1. Determine Throttle State
        if 'w' in self.active_keys and 's' not in self.active_keys:
            new_throttle = 'U'
        elif 's' in self.active_keys and 'w' not in self.active_keys:
            new_throttle = 'D'
        else:
            new_throttle = 'N'

        # 2. Determine Steering State
        if 'a' in self.active_keys and 'd' not in self.active_keys:
            new_steering = 'L'
        elif 'd' in self.active_keys and 'a' not in self.active_keys:
            new_steering = 'R'
        else:
            new_steering = 'C'

        throttle_changed = (new_throttle != self.current_throttle_cmd)
        steering_changed = (new_steering != self.current_steering_cmd)

        self.current_throttle_cmd = new_throttle
        self.current_steering_cmd = new_steering

        self.update_button_visuals()

        # Transmit updated commands immediately
        if throttle_changed:
            self.send_serial_char(self.current_throttle_cmd)
        if steering_changed:
            self.send_serial_char(self.current_steering_cmd)

        # If both are neutral/centered and last action was movement, ensure safe state is shown
        if new_throttle == 'N' and new_steering == 'C':
            self.cmd_display.config(text="[ STOP / NEUTRAL ]", fg=self.blue_accent)

    def update_button_visuals(self):
        # Highlight UP (W)
        if 'w' in self.active_keys:
            self.btn_up.config(bg=self.btn_highlight, fg="#11111b", relief="sunken")
        else:
            self.btn_up.config(bg=self.btn_bg, fg=self.text_main, relief="raised")

        # Highlight DOWN (S)
        if 's' in self.active_keys:
            self.btn_down.config(bg=self.btn_highlight, fg="#11111b", relief="sunken")
        else:
            self.btn_down.config(bg=self.btn_bg, fg=self.text_main, relief="raised")

        # Highlight LEFT (A)
        if 'a' in self.active_keys:
            self.btn_left.config(bg=self.btn_highlight, fg="#11111b", relief="sunken")
        else:
            self.btn_left.config(bg=self.btn_bg, fg=self.text_main, relief="raised")

        # Highlight RIGHT (D)
        if 'd' in self.active_keys:
            self.btn_right.config(bg=self.btn_highlight, fg="#11111b", relief="sunken")
        else:
            self.btn_right.config(bg=self.btn_bg, fg=self.text_main, relief="raised")

    # -------------------------------------------------------------------------
    # SERIAL COMMUNICATION ENGINE & HEARTBEAT
    # -------------------------------------------------------------------------
    def refresh_ports(self):
        ports = serial.tools.list_ports.comports()
        self.port_mapping.clear()
        
        for p in ports:
            hwid = str(p.hwid).upper()
            desc = str(p.description).upper()
            name = str(p.name).upper()
            
            if "BTHENUM" in hwid or "BLUETOOTH" in desc or "HC-06" in name or "HC-06" in desc:
                display_name = f"🔵 {p.device} (Bluetooth HC-06)"
            else:
                display_name = f"🔌 {p.device} (USB/Other)"
                
            self.port_mapping[display_name] = p.device

        port_labels = list(self.port_mapping.keys())
        port_labels.sort(key=lambda x: "🔵" not in x)

        self.port_combobox['values'] = port_labels
        if port_labels:
            self.port_combobox.current(0)
        else:
            self.port_combobox.set("No Devices Found")

    def connect_serial(self):
        selected_label = self.port_combobox.get()
        if not selected_label or selected_label == "No Devices Found":
            messagebox.showwarning("Connection Warning", "Please select a valid device.")
            return

        actual_port = self.port_mapping.get(selected_label)

        try:
            self.serial_port = serial.Serial(
                port=actual_port,
                baudrate=9600,
                timeout=1,
                write_timeout=0  # Prevents GUI freezing if Bluetooth connection drops
            )
            self.is_connected = True
            self.status_label.config(text=f"CONNECTED ({actual_port})", fg=self.green_accent)
            self.connect_btn.config(state="disabled", bg=self.btn_bg, fg=self.text_sub)
            self.disconnect_btn.config(state="normal", bg=self.red_accent, fg="#11111b")
            self.port_combobox.config(state="disabled")
            self.refresh_btn.config(state="disabled")

            # Send initial stop command to synchronize state
            self.send_serial_char('S')

        except Exception as e:
            self.is_connected = False
            self.status_label.config(text="DISCONNECTED", fg=self.red_accent)
            messagebox.showerror("Connection Error", f"Failed to connect to Bluetooth device:\n{str(e)}")

    def disconnect_serial(self):
        if self.is_connected and self.serial_port and self.serial_port.is_open:
            try:
                # Attempt to send emergency stop before disconnecting
                self.serial_port.write(b'S')
                self.serial_port.flush()
                self.serial_port.close()
            except Exception:
                pass

        self.is_connected = False
        self.serial_port = None
        self.active_keys.clear()
        self.status_label.config(text="DISCONNECTED", fg=self.red_accent)
        self.connect_btn.config(state="normal", bg=self.green_accent, fg="#11111b")
        self.disconnect_btn.config(state="disabled", bg=self.btn_bg, fg=self.text_sub)
        self.port_combobox.config(state="readonly")
        self.refresh_btn.config(state="normal")
        self.cmd_display.config(text="[ DISCONNECTED ]", fg=self.text_sub)
        self.update_button_visuals()

    def send_serial_char(self, char_cmd):
        if not self.is_connected or not self.serial_port or not self.serial_port.is_open:
            self.cmd_display.config(text="Failed (Disconnected)", fg=self.red_accent)
            return

        try:
            self.serial_port.write(char_cmd.encode('ascii'))
            self.last_sent_cmd = char_cmd
            self.last_cmd_send_time = time.time()
            self.cmd_display.config(text=f"'{char_cmd}' Sent", fg=self.green_accent)
        except serial.SerialException as e:
            # Handle unexpected Bluetooth drop or hardware disconnect gracefully
            self.is_connected = False
            self.status_label.config(text="CONNECTION LOST", fg=self.yellow_accent)
            self.cmd_display.config(text="Connection Lost!", fg=self.red_accent)
            self.disconnect_serial()
            messagebox.showerror("Serial Error", f"Bluetooth connection was lost:\n{str(e)}")

    def _heartbeat_loop(self):
        """
        Runs every HEARTBEAT_INTERVAL_MS (250 ms) to keep Arduino failsafe timer alive.
        If no user command was sent recently, re-transmits active state or heartbeat character.
        """
        if self.is_connected and self.serial_port and self.serial_port.is_open:
            elapsed_ms = (time.time() - self.last_cmd_send_time) * 1000.0
            if elapsed_ms >= HEARTBEAT_INTERVAL_MS:
                # Transmit active state or heartbeat tick
                if self.current_throttle_cmd != 'N':
                    self.send_serial_char(self.current_throttle_cmd)
                elif self.current_steering_cmd != 'C':
                    self.send_serial_char(self.current_steering_cmd)
                else:
                    self.send_serial_char('.') # Heartbeat tick

        # Re-schedule heartbeat timer
        self.root.after(HEARTBEAT_INTERVAL_MS, self._heartbeat_loop)

    def on_closing(self):
        self.disconnect_serial()
        self.root.destroy()

# =============================================================================
# MAIN ENTRY POINT
# =============================================================================
if __name__ == "__main__":
    root = tk.Tk()
    app = RueaRoyRCApp(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()