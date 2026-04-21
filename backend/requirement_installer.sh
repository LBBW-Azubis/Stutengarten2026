#!/bin/bash
# Setup-Skript für den Main PC (Backend + Frontend) auf Ubuntu

echo "🚀 Starte Main PC Setup..."

# 1. System updaten
echo "🔄 Aktualisiere Paketquellen..."
sudo apt update && sudo apt upgrade -y

# 2. Node.js und npm für das Frontend installieren
echo "📦 Installiere Node.js und npm..."
sudo apt install -y nodejs npm

# 3. Python 3, pip und venv für das Backend installieren
echo "📦 Installiere Python 3, pip und venv..."
sudo apt install -y python3 python3-pip python3-venv

# 4. MariaDB Server installieren
echo "📦 Installiere MariaDB Server..."
sudo apt install -y mariadb-server

# 5. MariaDB Konfiguration anpassen (skip-name-resolve einfügen)
# Auf Ubuntu liegt die Config meist in /etc/mysql/mariadb.conf.d/50-server.cnf
MARIADB_CONF="/etc/mysql/mariadb.conf.d/50-server.cnf"
if [ -f "$MARIADB_CONF" ]; then
    if ! grep -q "skip-name-resolve" "$MARIADB_CONF"; then
        echo "⚙️ Füge 'skip-name-resolve' zur MariaDB-Konfiguration hinzu..."
        # Sucht den "[mysqld]" Block und fügt eine Zeile danach ein
        sudo sed -i '/\[mysqld\]/a skip-name-resolve' "$MARIADB_CONF"
        sudo systemctl restart mariadb
    else
        echo "✅ 'skip-name-resolve' ist bereits in der Datenbank konfiguriert."
    fi
else
    echo "⚠️ MariaDB Konfigurationsdatei ($MARIADB_CONF) nicht gefunden. Bitte manuell anpassen, falls abweichend."
fi

# 6. Virtuelles Environment (Backend) einrichten und installieren
echo "🐍 Richte Python Virtual Environment ein und installiere Pakete..."
python3 -m venv venv
source venv/bin/activate
pip install Flask Flask-Cors pandas mysql-connector-python pyinstaller openpyxl

# 7. Frontend Abhängigkeiten installieren
echo "📦 Installiere NPM-Abhängigkeiten im Frontend..."

# Die Frontend-Verzeichnisse gemäß deiner Ordnerstruktur
FRONTEND_DIRS=(
    "frontend/Eva_React"
    "frontend/Frontend_Stutengarten/FrontendStutengarten"
)

for DIR in "${FRONTEND_DIRS[@]}"; do
    if [ -d "$DIR" ]; then
        echo "➡️ Führe 'npm install' in $DIR aus..."
        (cd "$DIR" && npm install)
    else
        echo "⚠️ Ordner $DIR nicht gefunden (übersprungen)."
    fi
done

echo "✅ Komplettes Setup (Backend + Frontend) erfolgreich abgeschlossen!"
echo "Du kannst nun die Datenbank-Dateien (.sql) importieren und deine Server starten."