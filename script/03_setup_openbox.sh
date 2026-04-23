#!/bin/bash

# =================================================================
# KIOSK SETUP SCRIPT (Production Grade)
# System: Ubuntu Server + Openbox + Chromium
# =================================================================

# Variablen
TARGET_USER=$(whoami)
KIOSK_URL="http://localhost"

echo "--- Starte Kiosk-Installation für User: $TARGET_USER ---"

# 1. System-Update und Installation der Pakete
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
    x11-xserver-utils

# 2. LightDM Konfiguration (Autologin)
echo "--- Konfiguriere Autologin ---"
sudo bash -c "cat > /etc/lightdm/lightdm.conf" <<EOF
[Seat:*]
autologin-user=$TARGET_USER
autologin-user-timeout=0
user-session=openbox
EOF

# 3. Openbox Konfiguration (Autostart Script)
echo "--- Konfiguriere Openbox Autostart ---"
mkdir -p ~/.config/openbox
cat > ~/.config/openbox/autostart <<EOF
# Bildschirmschoner & Energie-Management aus
xset s off
xset s noblank
xset -dpms

# USB-Automount im Hintergrund starten
devmon &

# Chromium Kiosk-Loop (Watchdog)
while true; do
  chromium-browser \\
    --kiosk \\
    --no-first-run \\
    --no-default-browser-check \\
    --disable-infobars \\
    --disable-session-crashed-bubble \\
    --overscroll-history-navigation=0 \\
    --app=$KIOSK_URL
done
EOF

# Rechte für Autostart vergeben
chmod +x ~/.config/openbox/autostart

# 4. Gruppenberechtigungen für Hardware-Zugriff
echo "--- Setze Gruppenberechtigungen ---"
sudo usermod -a -G video,plugdev $TARGET_USER

# 5. Abschluss
echo "---------------------------------------------------------"
echo " SETUP ABGESCHLOSSEN!"
echo "---------------------------------------------------------"
echo "Das System wird nun neu gestartet."
echo "Nach dem Reboot sollte Chromium im Vollbild erscheinen."
echo "---------------------------------------------------------"

sleep 3
sudo reboot