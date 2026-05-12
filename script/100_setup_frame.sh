#!/bin/bash

# =================================================================
# FRAME KIOSK SETUP SCRIPT (Optimiert für Frame/VDI)
# System: Ubuntu Server + Frame
# =================================================================

# Farben für die Ausgabe
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Variablen
TARGET_USER=$(whoami)

echo -e "${BLUE}=== Frame Kiosk Konfiguration & Installation ===${NC}\n"

# --- INTERAKTIVE ABFRAGE ---

# 1. Netzwerk-Interface erkennen
DEFAULT_IFACE=$(ip link | grep -E '^[0-9]+: (en|eth)' | awk -F: '{print $2}' | tr -d ' ' | head -n1)
read -p "Netzwerk-Interface [$DEFAULT_IFACE]: " INTERFACE
INTERFACE=${INTERFACE:-$DEFAULT_IFACE}

# 2. IP-Adresse
read -p "Gewünschte IP-Adresse (z.B. 192.168.1.100): " IP_ADDR
if [[ -z "$IP_ADDR" ]]; then 
    echo -e "${YELLOW}Warnung: Keine IP angegeben. DHCP wird beibehalten.${NC}"
    STATIC_IP=false
else
    STATIC_IP=true
fi

# 3. Subnetzmaske
if [ "$STATIC_IP" = true ]; then
    read -p "Subnetz-Prefix (z.B. 24) [24]: " PREFIX
    PREFIX=${PREFIX:-24}
fi

# 4. Webseite (Standard auf Frame Launchpad vorbereitet)
read -p "Frame Kiosk-URL [https://frame.nutanix.com]: " KIOSK_URL
KIOSK_URL=${KIOSK_URL:-https://frame.nutanix.com}

if [[ ! "$KIOSK_URL" =~ ^https?:// ]]; then
    KIOSK_URL="https://$KIOSK_URL"
fi

echo -e "\n${YELLOW}Zusammenfassung:${NC}"
echo -e "IP-Adresse: ${IP_ADDR:-DHCP}"
echo -e "Interface:  $INTERFACE"
echo -e "URL:        $KIOSK_URL"
read -p "Konfiguration so anwenden? (y/n) " CONFIRM
if [[ "$CONFIRM" != "y" ]]; then echo "Abgebrochen."; exit 1; fi

# --- AUSFÜHRUNG ---

# 1. System-Update und Installation (libgles2 für Frame hinzugefügt)
echo -e "${GREEN}>>> Installiere Kiosk-Komponenten...${NC}"
sudo apt update
sudo apt install -y --no-install-recommends \
    xserver-xorg-core xserver-xorg xinit openbox \
    lightdm lightdm-gtk-greeter chromium-browser \
    udevil xdg-desktop-portal-gtk x11-xserver-utils \
    libgles2

# 2. Netzwerk konfigurieren
if [ "$STATIC_IP" = true ]; then
    echo -e "\n${GREEN}>>> Konfiguriere Netzwerk via Netplan...${NC}"
    sudo tee /etc/netplan/01-netcfg.yaml > /dev/null <<EOF
network:
  version: 2
  renderer: networkd
  ethernets:
    $INTERFACE:
      dhcp4: no
      optional: true
      addresses:
        - $IP_ADDR/$PREFIX
EOF
    sudo netplan apply
fi

# WLAN deaktivieren (wie in deinem neuen Script)
sudo ip link set wlo1 down || true

# 3. LightDM Konfiguration
sudo bash -c "cat > /etc/lightdm/lightdm.conf" <<EOF
[Seat:*]
autologin-user=$TARGET_USER
autologin-user-timeout=0
user-session=openbox
EOF

# 4. Openbox Konfiguration (Autostart mit Frame-Flags)
echo -e "${GREEN}>>> Konfiguriere Openbox Autostart (Frame optimiert)...${NC}"
mkdir -p ~/.config/openbox
cat > ~/.config/openbox/autostart <<EOF
# Bildschirmschoner aus
xset s off
xset s noblank
xset -dpms

# USB-Automount
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

# 4.5 Openbox Tastenkombinationen (F1 blockieren)
cat > ~/.config/openbox/rc.xml <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<openbox_config xmlns="http://openbox.org/3.4/rc">
  <keyboard>
    <keybind key="F1">
      <action name="Execute">
        <command>true</command>
      </action>
    </keybind>
  </keyboard>
</openbox_config>
EOF

chmod +x ~/.config/openbox/autostart
sudo systemctl disable systemd-networkd-wait-online.service

# 5. Gruppenberechtigungen (Audio für Frame hinzugefügt)
echo -e "${GREEN}>>> Setze Gruppenberechtigungen...${NC}"
sudo usermod -a -G video,plugdev,audio $TARGET_USER

# 6. Abschluss
echo -e "\n${BLUE}---------------------------------------------------------${NC}"
echo -e "${GREEN} SETUP ABGESCHLOSSEN! System startet neu.${NC}"
echo -e "${BLUE}---------------------------------------------------------${NC}"

sleep 3
sudo reboot
