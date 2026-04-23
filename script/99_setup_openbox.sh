#!/bin/bash

# =================================================================
# KIOSK SETUP SCRIPT (Production Grade + Interactive Network)
# System: Ubuntu Server + Openbox + Chromium
# =================================================================

# Farben für die Ausgabe
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Variablen
TARGET_USER=$(whoami)

echo -e "${BLUE}=== Kiosk Konfiguration & Installation ===${NC}\n"

# --- INTERAKTIVE ABFRAGE ---

# 1. Netzwerk-Interface erkennen
DEFAULT_IFACE=$(ip link | grep -E '^[0-9]+: (en|eth)' | awk -F: '{print $2}' | tr -d ' ' | head -n1)
read -p "Netzwerk-Interface [$DEFAULT_IFACE]: " INTERFACE
INTERFACE=${INTERFACE:-$DEFAULT_IFACE}

# 2. IP-Adresse
read -p "Gewünschte IP-Adresse (z.B. 192.168.1.100): " IP_ADDR
if [[ -z "$IP_ADDR" ]]; then 
    echo -e "${YELLOW}Warnung: Keine IP angegeben. DHCP wird beibehalten oder manuell benötigt.${NC}"
    STATIC_IP=false
else
    STATIC_IP=true
fi

# 3. Subnetzmaske
if [ "$STATIC_IP" = true ]; then
    read -p "Subnetz-Prefix (z.B. 24 für 255.255.255.0) [24]: " PREFIX
    PREFIX=${PREFIX:-24}
fi

# 4. Webseite
read -p "Kiosk-URL [https://ubuntu.com]: " KIOSK_URL
KIOSK_URL=${KIOSK_URL:-https://ubuntu.com}

# Falls nur IP/Hostname eingegeben wurde, automatisch http:// ergänzen.
if [[ ! "$KIOSK_URL" =~ ^https?:// ]]; then
    KIOSK_URL="http://$KIOSK_URL"
fi

echo -e "\n${YELLOW}Zusammenfassung:${NC}"
if [ "$STATIC_IP" = true ]; then
    echo -e "IP-Adresse: $IP_ADDR/$PREFIX"
else
    echo -e "IP-Adresse: (DHCP/Keine Änderung)"
fi
echo -e "Interface:  $INTERFACE"
echo -e "URL:        $KIOSK_URL"
echo -e "User:       $TARGET_USER"
read -p "Konfiguration so anwenden? (y/n) " CONFIRM

if [[ "$CONFIRM" != "y" ]]; then echo "Abgebrochen."; exit 1; fi

# --- AUSFÜHRUNG ---

# 1. Netzwerk konfigurieren (falls IP angegeben)
if [ "$STATIC_IP" = true ]; then
    echo -e "\n${GREEN}>>> Konfiguriere Netzwerk via Netplan...${NC}"
    sudo tee /etc/netplan/01-netcfg.yaml > /dev/null <<EOF
network:
  version: 2
  renderer: networkd
  ethernets:
    $INTERFACE:
      dhcp4: no
      addresses:
        - $IP_ADDR/$PREFIX
EOF
    sudo netplan apply
fi

# 2. System-Update und Installation der Pakete
echo -e "${GREEN}>>> Installiere Kiosk-Komponenten (X11, Openbox, Chromium)...${NC}"
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

# 3. LightDM Konfiguration (Autologin)
echo -e "${GREEN}>>> Konfiguriere Autologin...${NC}"
sudo bash -c "cat > /etc/lightdm/lightdm.conf" <<EOF
[Seat:*]
autologin-user=$TARGET_USER
autologin-user-timeout=0
user-session=openbox
EOF

# 4. Openbox Konfiguration (Autostart Script)
echo -e "${GREEN}>>> Konfiguriere Openbox Autostart...${NC}"
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

# 5. Gruppenberechtigungen für Hardware-Zugriff
echo -e "${GREEN}>>> Setze Gruppenberechtigungen...${NC}"
sudo usermod -a -G video,plugdev $TARGET_USER

# 6. Abschluss
echo -e "\n${BLUE}---------------------------------------------------------${NC}"
echo -e "${GREEN} SETUP ABGESCHLOSSEN!${NC}"
echo -e "${BLUE}---------------------------------------------------------${NC}"
echo "Das System wird nun neu gestartet."
echo "Nach dem Reboot sollte Chromium im Vollbild mit $KIOSK_URL erscheinen."
echo -e "${BLUE}---------------------------------------------------------${NC}"

sleep 3
sudo reboot