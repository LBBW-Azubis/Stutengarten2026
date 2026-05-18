"""
    import db_connector for connection to database
"""
import logging
from db_connector import DbConnector

log = logging.getLogger(__name__)

def _generate_unique_symbol(cursor, base_name):
    base_chars = ''.join([c for c in base_name if c.isalnum()]).upper()
    prefix = base_chars[:3] if len(base_chars) >= 3 else (base_chars + "CTX")[:3]
    
    cursor.execute("SELECT symbol FROM aktien WHERE symbol = %s", (prefix,))
    if cursor.fetchone():
        raise ShareException(f"Kürzel '{prefix}' ist bereits vergeben")
        
    return prefix

class ShareException(Exception):
    """Exception for share errors"""

class Share:
    """Represents a tradeable share (f.ex. Apfel, Mercedes)"""

    def __init__(self, db: DbConnector, share_id=None, name=None,
                 symbol=None, description=None):
        """
        Create or load a share
        
        Args:
            db: Database connector
            name: Share name
            symbol: Share symbol (e.g., 'APF')
            description: Share description
            share_id: ID for loading existing share
        """
        self.db = db

        if share_id is None:
            if not name:
                raise ShareException("Name required")

            conn = db.get_connection()
            cursor = conn.cursor()
            try:
                cursor.execute("SELECT id FROM aktien WHERE name = %s", (name,))
                if cursor.fetchone():
                    raise ShareException(f"Aktienname '{name}' ist bereits vergeben")

                if not symbol:
                    symbol = _generate_unique_symbol(cursor, name)
                else:
                    cursor.execute("SELECT id FROM aktien WHERE symbol = %s", (symbol,))
                    if cursor.fetchone():
                        raise ShareException(f"Kürzel '{symbol}' ist bereits vergeben")

                cursor.execute(
                    "INSERT INTO aktien (name, symbol, beschreibung) VALUES (%s, %s, %s)",
                    (name, symbol, description)
                )
                self.id = cursor.lastrowid
                log.info("Inserted share '%s' id=%s symbol=%s", name, self.id, symbol)
                self.name = name
                self.symbol = symbol
                self.description = description
                conn.commit()
            except ShareException:
                raise
            except Exception as err:
                log.exception("Error inserting share %s (%s)", name, symbol)
                raise ShareException(f"Error creating share: {err}") from err
            finally:
                cursor.close()
                conn.close()
        else:
            # Load existing share
            self.id = share_id
            self.name = name
            self.symbol = symbol
            self.description = description

    @staticmethod
    def get_all_available_shares(db: DbConnector):
        """Returns all tradeable shares"""
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)
        shares = []

        try:
            cursor.execute("SELECT * FROM aktien ORDER BY name")
            for row in cursor.fetchall():
                share = Share(
                    db,
                    share_id=row['id'],
                    name=row['name'],
                    symbol=row['symbol'],
                    description=row.get('beschreibung')
                )
                shares.append(share)
            return shares
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_by_id(db: DbConnector, share_id):
        """Returns share by its id"""
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            cursor.execute("SELECT * FROM aktien WHERE id = %s", (share_id,))
            row = cursor.fetchone()
            if not row:
                raise ShareException("Share not found")

            return Share(
                db,
                share_id=row['id'],
                name=row['name'],
                symbol=row['symbol'],
                description=row.get('beschreibung')
            )
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_by_name(db: DbConnector, name):
        """
        Returns share by its name
        
        Args:
            db: Database connector
            name: name of share (f.ex. "Apfel AG")
        
        Returns:
            Share object
        
        Raises:
            ShareException: if no share was found
        """
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            cursor.execute("SELECT * FROM aktien WHERE name = %s", (name,))
            row = cursor.fetchone()
            if not row:
                raise ShareException(f"Aktie '{name}' nicht gefunden")

            return Share(
                db,
                share_id=row['id'],
                name=row['name'],
                symbol=row['symbol'],
                description=row.get('beschreibung')
            )
        finally:
            cursor.close()
            conn.close()

    def to_dict(self):
        """Converts to dict for JSON"""
        return {
            'id': self.id,
            'name': self.name,
            'symbol': self.symbol,
            'description': self.description
        }

#End-of-file
