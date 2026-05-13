#!/bin/bash

# =================================================================
# 100_setup_frame.sh (Interaktiv + Frame Optimiert + Hardening)
# =================================================================

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

TARGET_USER=$(whoami)
echo -e "${BLUE}=== Frame Kiosk Konfiguration & Hardening ===${NC}\n"

# --- INTERAKTIVE ABFRAGE ---
DEFAULT_IFACE=$(ip link | grep -E '^[0-9]+: (en|eth)' | awk -F: '{print $2}' | tr -d ' ' | head -n1)
read -p "Netzwerk-Interface [$DEFAULT_IFACE]: " INTERFACE
INTERFACE=${INTERFACE:-$DEFAULT_IFACE}

read -p "Gewünschte IP-Adresse (leer für DHCP): " IP_ADDR
if [[ -z "$IP_ADDR" ]]; then STATIC_IP=false; else STATIC_IP=true; fi

read -p "Frame Kiosk-URL inkl. Port [http://192.168.1.10:5000]: " KIOSK_URL
KIOSK_URL=${KIOSK_URL:-http://192.168.1.10:5000}

# --- AUSFÜHRUNG ---
echo -e "${GREEN}>>> Installiere Komponenten...${NC}"
sudo apt update
sudo apt install -y --no-install-recommends \
    xserver-xorg-core xserver-xorg xinit openbox \
    lightdm lightdm-gtk-greeter chromium-browser \
    udevil xdg-desktop-portal-gtk x11-xserver-utils \
    libgles2

# Netzwerk
if [ "$STATIC_IP" = true ]; then
    sudo tee /etc/netplan/01-netcfg.yaml > /dev/null <<EOF
network:
  version: 2
  renderer: networkd
  ethernets:
    $INTERFACE:
      dhcp4: no
      addresses: [$IP_ADDR/24]
EOF
    sudo netplan apply
fi

# Openbox & Hardening
mkdir -p ~/.config/openbox
cat > ~/.config/openbox/autostart <<EOF
xset s off
xset s noblank
xset -dpms
devmon &
while true; do
  chromium-browser --kiosk --no-first-run --no-default-browser-check \\
    --ignore-gpu-blocklist --enable-gpu-rasterization --enable-zero-copy \\
    --use-fake-ui-for-media-stream --autoplay-policy=no-user-gesture-required \\
    --app=$KIOSK_URL
done
EOF

# Hardening Block
cat > ~/.config/openbox/rc.xml <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<openbox_config xmlns="http://openbox.org/3.4/rc">
  <keyboard>
    <keybind key="F1"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="F3"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="F7"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="F12"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-f"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-n"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-t"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-p"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="A-F4"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="A-Tab"><action name="Execute"><command>true</command></action></keybind>
  </keyboard>
</openbox_config>
EOF

chmod +x ~/.config/openbox/autostart
sudo usermod -a -G video,plugdev,audio $TARGET_USER

echo -e "${GREEN}SETUP ABGESCHLOSSEN!${NC}"
sleep 3
sudo reboot