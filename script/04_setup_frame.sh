#!/bin/bash

# =================================================================
# 04_setup_frame.sh (Optimiert für Frame/VDI + Kiosk Hardening)
# System: Ubuntu Server + Openbox + Chromium
# =================================================================

TARGET_USER=$(whoami)
KIOSK_URL="http://192.168.1.10"

echo "--- Starte Frame Kiosk-Installation für User: $TARGET_USER ---"

# 1. System-Update und Installation
sudo apt update
sudo apt install -y --no-install-recommends \
    xserver-xorg-core xserver-xorg xinit openbox \
    lightdm lightdm-gtk-greeter chromium-browser \
    udevil xdg-desktop-portal-gtk x11-xserver-utils \
    libgles2

# 2. LightDM Konfiguration (Autologin)
sudo bash -c "cat > /etc/lightdm/lightdm.conf" <<EOF
[Seat:*]
autologin-user=$TARGET_USER
autologin-user-timeout=0
user-session=openbox
EOF

# 3. Openbox Autostart (Frame Optimiert)
mkdir -p ~/.config/openbox
cat > ~/.config/openbox/autostart <<EOF
xset s off
xset s noblank
xset -dpms
devmon &

while true; do
  chromium-browser \\
    --kiosk \\
    --no-first-run \\
    --no-default-browser-check \\
    --disable-infobars \\
    --disable-session-crashed-bubble \\
    --overscroll-history-navigation=0 \\
    --disable-features=TranslateUI \\
    --no-proxy-server \\
    --password-store=basic \\
    --disable-save-password-bubble \\
    --ignore-gpu-blocklist \\
    --enable-gpu-rasterization \\
    --enable-zero-copy \\
    --use-fake-ui-for-media-stream \\
    --autoplay-policy=no-user-gesture-required \\
    --kiosk $KIOSK_URL
done
EOF

# 3.5 Openbox Tastenkombinationen (Kiosk-Hardening)
echo "--- Deaktiviere kritische Tastenkombinationen ---"
cat > ~/.config/openbox/rc.xml <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<openbox_config xmlns="http://openbox.org/3.4/rc">
  <keyboard>
    <!-- Blockiere alle F-Tasten -->
    <keybind key="F1"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="F2"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="F3"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="F4"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="F5"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="F6"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="F7"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="F8"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="F9"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="F10"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="F11"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="F12"><action name="Execute"><command>true</command></action></keybind>
    
    <!-- Blockiere STRG + Buchstabe/Zahl/Sonderzeichen -->
    <keybind key="C-a"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-b"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-c"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-d"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-e"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-f"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-g"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-h"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-i"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-j"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-k"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-l"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-m"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-n"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-o"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-p"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-q"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-r"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-s"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-t"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-u"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-v"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-w"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-x"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-y"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-z"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-1"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-2"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-3"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-4"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-5"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-6"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-7"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-8"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-9"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-0"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C--"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-+"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-Tab"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-S-Tab"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-Esc"><action name="Execute"><command>true</command></action></keybind>

    <!-- Blockiere ALT + Kombis -->
    <keybind key="A-F4"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="A-Tab"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="A-S-Tab"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="A-Esc"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="A-Space"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="A-Left"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="A-Right"><action name="Execute"><command>true</command></action></keybind>
    
    <!-- Super/Windows-Taste -->
    <keybind key="W-d"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="W-e"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="W-r"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="W-l"><action name="Execute"><command>true</command></action></keybind>

    <!-- Escape an sich ignorieren (Vorsicht, könnte Dropdowns stören, kann aber in Kiosk erwünscht sein. Falls störend, einfach löschen) -->
    <keybind key="Escape"><action name="Execute"><command>true</command></action></keybind>
  </keyboard>
</openbox_config>
EOF

chmod +x ~/.config/openbox/autostart
sudo usermod -a -G video,plugdev,audio $TARGET_USER

echo "SETUP ABGESCHLOSSEN! Reboot folgt..."
sleep 3
sudo reboot