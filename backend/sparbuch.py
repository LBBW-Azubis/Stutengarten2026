from db_connector import DbConnector
from kunde import CustomException
import mysql.connector

class Sparbuch:
    """
    Class to handle bankbook (Sparbuch) operations for customers.
    All methods use dicts instead of custom data classes for better JSON compatibility and Python style.
    """

    @staticmethod
    def get_all_savings_books(db: DbConnector):
        """
        Returns a list of all savings books with corresponding customer data.
        Returns: List of dicts: [{"stutengarten_id", "vorname", "nachname", "saldo"}]
        """
        result = []
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor2 = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM kundensparbuecher")
            for row in cursor.fetchall():
                kunden_id = row.get("kunden_fk")
                saldo = row["saldo"]
                cursor2.execute("SELECT * FROM kunden WHERE id = %s", (kunden_id,))
                kunde_row = cursor2.fetchone()
                if kunde_row:
                    result.append({
                        "stutengarten_id": kunde_row["stutengarten_id"],
                        "vorname": kunde_row["vorname"],
                        "nachname": kunde_row["nachname"],
                        "saldo": saldo
                    })
                else:
                    raise CustomException("No customer found for this savings book!")
            return result
        finally:
            cursor.close()
            cursor2.close()

    @staticmethod
    def get_savings_book_overview(db: DbConnector, kunden_id):
        """
        Returns a list with the balance and stutengarten_id for a specific customer's savings book.
        Returns: List of dicts: [{"stutengarten_id", "saldo"}]
        """
        result = []
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor2 = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM kundensparbuecher WHERE kunden_fk=%s", (kunden_id,))
            for row in cursor.fetchall():
                saldo = row["saldo"]
                cursor2.execute("SELECT * FROM kunden WHERE id = %s", (kunden_id,))
                kunde_row = cursor2.fetchone()
                if kunde_row:
                    result.append({
                        "stutengarten_id": kunde_row["stutengarten_id"],
                        "saldo": saldo
                    })
                else:
                    raise CustomException("No customer found for this savings book!")
            return result
        finally:
            cursor.close()
            cursor2.close()

    @staticmethod
    def create_new(db: DbConnector, kunden_id):
        """
        Creates a new savings book for the given customer.
        Returns: dict {"kunden_id": ..., "saldo": 0}
        """
        conn = db.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("INSERT INTO kundensparbuecher (kunden_fk) VALUES (%s)", (kunden_id,))
            conn.commit()
            return {"kunden_id": kunden_id, "saldo": 0}
        except mysql.connector.Error as e:
            raise CustomException(f"Error creating savings book: {e}")
        finally:
            cursor.close()

    @staticmethod
    def set_balance(db: DbConnector, kunden_id, saldo):
        """
        Updates the balance for a customer's savings book.
        Returns: dict {"kunden_id": ..., "saldo": ...}
        """
        conn = db.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("UPDATE kundensparbuecher SET saldo=%s WHERE kunden_fk=%s", (saldo, kunden_id))
            if cursor.rowcount == 0:
                raise CustomException("Could not update balance")
            conn.commit()
            return {"kunden_id": kunden_id, "saldo": saldo}
        except mysql.connector.Error as e:
            raise CustomException(f"Error updating balance: {e}")
        finally:
            cursor.close()