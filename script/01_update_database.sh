#!/bin/bash
# =============================================================================
# Stutengarten 2026 – Datenbank-Update
# Spielt eine SQL-Datei in die bestehende Datenbank ein (z.B. Schema-Änderungen
# oder Migrationen). Erstellt vorher automatisch ein Backup.
#
# Nutzung:
#   ./update_database.sh                     -> nutzt backend/database.sql
#   ./update_database.sh pfad/zur/datei.sql   -> nutzt angegebene Datei
# =============================================================================
set -e

# ── Farben ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── Konfiguration – hier anpassen ───────────────────────────────────────────
REPO_DIR="$HOME/Stutengarten2026"
DB_NAME="stutengarten"
DB_USER="root"
DB_PASS="1234"

# ============================================================================
SQL_FILE="${1:-$REPO_DIR/backend/database.sql}"

[ -f "$SQL_FILE" ] || error "SQL-Datei nicht gefunden: ${SQL_FILE}"

info "=== 1. Backup der aktuellen Datenbank erstellen ==="
BACKUP_FILE="/tmp/${DB_NAME}_backup_$(date +%Y%m%d_%H%M%S).sql"
if sudo mariadb-dump -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null; then
    info "Backup gespeichert unter: ${BACKUP_FILE}"
else
    warn "Backup konnte nicht erstellt werden – fahre trotzdem fort."
fi

info "=== 2. SQL-Datei einspielen: ${SQL_FILE} ==="
sudo mariadb -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SQL_FILE"
info "SQL-Datei erfolgreich eingespielt."

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Datenbank-Update abgeschlossen!${NC}"
echo -e "${GREEN}  Backup liegt unter: ${BACKUP_FILE}${NC}"
echo -e "${GREEN}  Falls etwas schiefgeht, Wiederherstellung mit:${NC}"
echo -e "${GREEN}  sudo mariadb -u ${DB_USER} -p ${DB_NAME} < ${BACKUP_FILE}${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
