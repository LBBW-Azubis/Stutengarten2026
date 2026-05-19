#!/bin/bash

# =================================================================
# 100_setup_frame.sh (Interaktiv + Frame Optimiert + Hardening)
# =================================================================

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Echter User auch bei sudo-Ausführung
TARGET_USER=${SUDO_USER:-$(whoami)}
TARGET_HOME=$(getent passwd "$TARGET_USER" | cut -d: -f6)

echo -e "${BLUE}=== Frame Kiosk Konfiguration & Hardening ===${NC}\n"
echo -e "${YELLOW}Erkannter User: $TARGET_USER (Home: $TARGET_HOME)${NC}\n"

# --- INTERAKTIVE ABFRAGE ---
DEFAULT_IFACE=$(ip link | grep -E '^[0-9]+: (en|eth)' | awk -F: '{print $2}' | tr -d ' ' | head -n1)
read -p "Netzwerk-Interface LAN [$DEFAULT_IFACE]: " INTERFACE
INTERFACE=${INTERFACE:-$DEFAULT_IFACE}

DEFAULT_WIFI_IFACE=$(ip link | grep -E '^[0-9]+: (wl)' | awk -F: '{print $2}' | tr -d ' ' | head -n1)
read -p "Netzwerk-Interface WLAN (zum Deaktivieren) [$DEFAULT_WIFI_IFACE]: " WIFI_IFACE
WIFI_IFACE=${WIFI_IFACE:-$DEFAULT_WIFI_IFACE}

read -p "Gewünschte IP-Adresse (192.168.1.*** oder leer für DHCP): " IP_ADDR
if [[ -z "$IP_ADDR" ]]; then STATIC_IP=false; else STATIC_IP=true; fi

read -p "Frame Kiosk-URL [http://192.168.1.10]: " KIOSK_URL
KIOSK_URL=${KIOSK_URL:-http://192.168.1.10}

# Sicherstellen, dass http:// vorangestellt ist, falls vergessen
if [[ ! "$KIOSK_URL" =~ ^https?:// ]]; then
    KIOSK_URL="http://$KIOSK_URL"
fi

echo -e "${YELLOW}Kiosk-URL: $KIOSK_URL${NC}\n"

# --- AUSFÜHRUNG ---
echo -e "${GREEN}>>> Installiere Komponenten...${NC}"
sudo apt update
sudo apt install -y --no-install-recommends \
    xorg xserver-xorg-core xserver-xorg xinit openbox \
    lightdm lightdm-gtk-greeter chromium-browser \
    udevil xdg-desktop-portal-gtk x11-xserver-utils \
    dbus-x11 at-spi2-core libgles2

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
  wifis:
    wlo1:
      dhcp4: true
      optional: true
      access-points:
        "iPhone":
          password: "stutengarten"
EOF
    sudo netplan apply
fi

# LightDM aktivieren
sudo systemctl enable lightdm
sudo systemctl set-default graphical.target

# LightDM Konfiguration (Autologin)
echo -e "${GREEN}>>> Konfiguriere Autologin für $TARGET_USER...${NC}"
sudo tee /etc/lightdm/lightdm.conf > /dev/null <<EOF
[Seat:*]
autologin-user=$TARGET_USER
autologin-user-timeout=0
user-session=openbox
EOF

# Openbox Config im richtigen User-Home anlegen
mkdir -p "$TARGET_HOME/.config/openbox"

# Autostart – KIOSK_URL wird hier direkt eingebettet
cat > "$TARGET_HOME/.config/openbox/autostart" <<EOF
export DISPLAY=:0
xset s off
xset s noblank
xset -dpms
sleep 5

until ping -c1 -W2 $(echo "$KIOSK_URL" | sed 's|https\?://||' | cut -d'/' -f1) &>/dev/null; do
    sleep 2
done

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
    --disable-gpu \\
    --use-fake-ui-for-media-stream \\
    --autoplay-policy=no-user-gesture-required \\
    --kiosk $KIOSK_URL
  sleep 2
done
EOF

# Hardening Block
cat > "$TARGET_HOME/.config/openbox/rc.xml" <<EOF
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
    <keybind key="C-minus"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-plus"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-equal"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-apostrophe"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-acute"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-KP_Subtract"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-KP_Add"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-Tab"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-S-Tab"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="C-Esc"><action name="Execute"><command>true</command></action></keybind>

    <!-- Shift + Kombis -->
    <keybind key="S-Escape"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="S-F3"><action name="Execute"><command>true</command></action></keybind>

    <!-- Blockiere ALT + Kombis -->
    <keybind key="A-F4"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="A-Tab"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="A-S-Tab"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="A-Esc"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="A-Space"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="A-Left"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="A-Right"><action name="Execute"><command>true</command></action></keybind>
    <keybind key="A-Home"><action name="Execute"><command>true</command></action></keybind>
    
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

chmod +x "$TARGET_HOME/.config/openbox/autostart"
sudo chown -R "$TARGET_USER:$TARGET_USER" "$TARGET_HOME/.config/openbox"
sudo usermod -a -G video,plugdev,audio "$TARGET_USER"

echo -e "${GREEN}>>> Deaktiviere WLAN...${NC}"
if [[ -n "$WIFI_IFACE" ]] && ip link show "$WIFI_IFACE" > /dev/null 2>&1; then
    sudo rfkill block wifi
    sudo ip link set "$WIFI_IFACE" down
    echo -e "${GREEN}WLAN-Interface $WIFI_IFACE deaktiviert.${NC}"
else
    echo -e "${YELLOW}Kein gültiges WLAN-Interface angegeben oder gefunden, übersprungen.${NC}"
fi

echo -e "${GREEN}SETUP ABGESCHLOSSEN!${NC}"
sleep 20
sudo reboot