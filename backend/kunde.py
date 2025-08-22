from db_connector import DbConnector
import mysql.connector


class CustomException(Exception):
    pass


class KundeException(Exception):
    pass


class Sparbuch:
    def __init__(self, kunden_id, saldo):
        self.kunden_id = kunden_id
        self.saldo = saldo



class Kunde:
    def __init__(self, db: DbConnector, stutengarten_id=None, vorname=None, nachname=None, id=None):
        self.db = db

        if id is None:
            # Validierung der Pflichtfelder vor dem Insert
            if stutengarten_id is None or vorname is None or nachname is None:
                raise KundeException("stutengarten_id, vorname und nachname müssen gesetzt sein, um einen neuen Kunden anzulegen.")

            # neuen Kunden in DB anlegen
            conn = db.get_connection()
            cursor = conn.cursor()
            try:
                cursor.execute(
                    "INSERT INTO kunden (stutengarten_id, vorname, nachname) VALUES (%s, %s, %s)",
                    (stutengarten_id, vorname, nachname)
                )
                self.id = cursor.lastrowid
                self.stutengarten_id = stutengarten_id
                self.vorname = vorname
                self.nachname = nachname
                conn.commit()
            except mysql.connector.Error as err:
                raise CustomException(f"Fehler beim Anlegen des Kunden: {err}")
            finally:
                cursor.close()
        else:
            # Kunde-Objekt aus bestehenden Daten
            self.id = id
            self.stutengarten_id = stutengarten_id
            self.vorname = vorname
            self.nachname = nachname

    def delete(self):
        """
        Delete this customer from the database.
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("DELETE FROM kunden WHERE id = %s", (self.id,))
            conn.commit()
        finally:
            cursor.close()


    # Static Methoden
    @staticmethod
    def get_by_stutengarten_id(db: DbConnector, stutengarten_id):
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM kunden WHERE stutengarten_id = %s", (stutengarten_id,))
            row = cursor.fetchone()
        finally:
            cursor.close()
        if row:
            return Kunde(db, row["stutengarten_id"], row["vorname"], row["nachname"], id=row["id"])
        else:
            raise KundeException("Kein Kunde gefunden!")

    @staticmethod
    def get_by_db_id(db: DbConnector, kunden_id):
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM kunden WHERE id = %s", (kunden_id,))
            row = cursor.fetchone()
        finally:
            cursor.close()
        if row:
            return Kunde(db, row["stutengarten_id"], row["vorname"], row["nachname"], id=row["id"])
        else:
            raise KundeException("Kein Kunde gefunden!")

    # Methoden
    def get_sparbuch(self):
        conn = self.db.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            # Erster Versuch: Spaltenname 'kunden'
            try:
                cursor.execute("SELECT * FROM sparbuecher WHERE kunden = %s", (self.id,))
                row = cursor.fetchone()
            except mysql.connector.Error:
                # Fallback: falls die Spalte 'kunden' nicht existiert, 'kunden_id' versuchen
                cursor.close()
                cursor = conn.cursor(dictionary=True)
                cursor.execute("SELECT * FROM sparbuecher WHERE kunden_id = %s", (self.id,))
                row = cursor.fetchone()
        finally:
            cursor.close()
        if row:
            return Sparbuch(self.id, row["saldo"])
        else:
            raise CustomException("Kein Sparbuch vorhanden")


    # Update-Methoden
    def update_stutengarten_id(self, neue_id):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("UPDATE kunden SET stutengarten_id = %s WHERE id = %s", (neue_id, self.id))
            conn.commit()
            # Kein Fehler mehr wenn rowcount == 0 (z. B. gleicher Wert)
            self.stutengarten_id = neue_id
        finally:
            cursor.close()

    def update_vorname(self, neuer_vorname):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("UPDATE kunden SET vorname = %s WHERE id = %s", (neuer_vorname, self.id))
            conn.commit()
            self.vorname = neuer_vorname
        finally:
            cursor.close()

    def update_nachname(self, neuer_nachname):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("UPDATE kunden SET nachname = %s WHERE id = %s", (neuer_nachname, self.id))
            conn.commit()
            self.nachname = neuer_nachname
        finally:
            cursor.close()

    # help (ich brauch hilfe)
    def to_dict(self):
        return {
            "id": self.id,
            "stutengarten_id": self.stutengarten_id,
            "vorname": self.vorname,
            "nachname": self.nachname
        }