#!/bin/bash

# =================================================================
# FRAME KIOSK SETUP SCRIPT (Optimiert für Frame/VDI)
# System: Ubuntu Server + Openbox + Chromium
# =================================================================

# Variablen
TARGET_USER=$(whoami)
# Standardmäßig auf Frame Launchpad gesetzt
KIOSK_URL="https://frame.nutanix.com"

echo "--- Starte Frame Kiosk-Installation für User: $TARGET_USER ---"

# 1. System-Update und Installation (libgles2 für Frame hinzugefügt)
sudo apt update
sudo apt install -y --no-install-recommends \
    xserver-xorg-core \
    xserver-xorg \
    xinit \
    openbox \
    lightdm \
    lightdm-gtk-greeter \
    chromium-browser \
    udevil \
    xdg-desktop-portal-gtk \
    x11-xserver-utils \
    libgles2

# 2. LightDM Konfiguration (Autologin)
echo "--- Konfiguriere Autologin ---"
sudo bash -c "cat > /etc/lightdm/lightdm.conf" <<EOF
[Seat:*]
autologin-user=$TARGET_USER
autologin-user-timeout=0
user-session=openbox
EOF

# 3. Openbox Konfiguration (Autostart mit Frame-Flags)
echo "--- Konfiguriere Openbox Autostart (Frame optimiert) ---"
mkdir -p ~/.config/openbox
cat > ~/.config/openbox/autostart <<EOF
# Bildschirmschoner & Energie-Management aus
xset s off
xset s noblank
xset -dpms

# USB-Automount im Hintergrund starten
devmon &

# Chromium Kiosk-Loop (Frame Optimiert)
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
    --app=$KIOSK_URL
done
EOF

# 3.5 Openbox Tastenkombinationen (F1 blockieren)
echo "--- Deaktiviere F1-Taste (Hilfe) in Openbox ---"
cat > ~/.config/openbox/rc.xml <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<openbox_config xmlns="http://openbox.org/3.4/rc" xmlns:xi="http://www.w3.org/2001/XInclude">
  <keyboard>
    <keybind key="F1">
      <action name="Execute">
        <command>true</command>
      </action>
    </keybind>
  </keyboard>
</openbox_config>
EOF

# Rechte für Autostart vergeben
chmod +x ~/.config/openbox/autostart

# 4. Gruppenberechtigungen (Audio für Frame hinzugefügt)
echo "--- Setze Gruppenberechtigungen (inkl. Audio) ---"
sudo usermod -a -G video,plugdev,audio $TARGET_USER

# 5. Abschluss
echo "---------------------------------------------------------"
echo " FRAME SETUP ABGESCHLOSSEN!"
echo "---------------------------------------------------------"
echo "Das System wird nun neu gestartet."
echo "Nach dem Reboot sollte Chromium im Vollbild mit Frame erscheinen."
echo "---------------------------------------------------------"

sleep 3
sudo reboot