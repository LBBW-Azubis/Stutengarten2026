"""
    import db_connector for connection to database
"""
from db_connector import DbConnector

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
            if not name or not symbol:
                raise ShareException("Name and symbol required")

            conn = db.get_connection()
            cursor = conn.cursor()
            try:
                cursor.execute(
                    "INSERT INTO aktien (name, symbol, beschreibung) VALUES (%s, %s, %s)",
                    (name, symbol, description)
                )
                self.id = cursor.lastrowid
                self.name = name
                self.symbol = symbol
                self.description = description
                conn.commit()
            except Exception as err:
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
