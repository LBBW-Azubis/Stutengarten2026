"""import db_connector for connection to database"""
from db_connector import DbConnector
from customer import Customer
from customer import CustomException

class CustomerSavingsBook:
    """
    Class to handle savings book (Sparbuch) operations for customers.
    All methods use dicts for better JSON compatibility.
    """

    @staticmethod
    def get_all_savings_books(db: DbConnector):
        """
        Returns a list of all savings books with corresponding customer data.
        Returns: List of dicts: [{"stutengarten_id", "first_name", "last_name", "balance"}]
        """
        result = []
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor2 = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM kundensparbuecher")
            for row in cursor.fetchall():
                customer_id = row.get("kunden_fk")
                balance = row["saldo"]
                cursor2.execute("SELECT * FROM kunden WHERE id = %s", (customer_id,))
                customer_row = cursor2.fetchone()
                if customer_row:
                    result.append({
                        "stutengarten_id": customer_row["stutengarten_id"],
                        "first_name": customer_row["vorname"],
                        "last_name": customer_row["nachname"],
                        "balance": balance,
                    })
                else:
                    raise CustomException("No customer found for this savings book!")
            return result
        finally:
            cursor.close()
            cursor2.close()
            conn.close()

    @staticmethod
    def get_savings_book_overview(db: DbConnector, stutengarten_id):
        """
        Returns a list with the balance and stutengarten_id for a specific customer's savings book.
        Returns: List of dicts: [{"stutengarten_id", "balance"}]
        """
        result = []
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor2 = conn.cursor(dictionary=True)
        try:
            # stutengarten_id -> numerische kunden.id auflösen
            customer = Customer.get_by_stutengarten_id(db, stutengarten_id)
            customer_id = customer.id
            cursor.execute("SELECT * FROM kundensparbuecher WHERE kunden_fk=%s", (customer_id,))
            for row in cursor.fetchall():
                balance = row["saldo"]
                cursor2.execute("SELECT * FROM kunden WHERE id = %s", (customer_id,))
                customer_row = cursor2.fetchone()
                if customer_row:
                    result.append({
                        "stutengarten_id": customer_row["stutengarten_id"],
                        "balance": balance,
                    })
                else:
                    raise CustomException("No customer found for this savings book!")
            return result
        finally:
            cursor.close()
            cursor2.close()
            conn.close()

    @staticmethod
    def create_new(db: DbConnector, stutengarten_id):
        """
        Creates a new savings book for the given customer.
        Returns: dict {"customer_id": ..., "balance": 0}
        """
        customer = Customer.get_by_stutengarten_id(db, stutengarten_id)
        customer_id = customer.id
        conn = db.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("INSERT INTO kundensparbuecher (kunden_fk, saldo) VALUES (%s, 0)", (customer_id,)) #pylint: disable=line-too-long
            conn.commit()
            return {"stutengarten_id": stutengarten_id, "balance": 0}
        except Exception as e:
            raise CustomException(f"Error creating savings book: {e}") from e
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def set_balance(db: DbConnector, stutengarten_id, balance):
        """
        Updates the balance for a customer's savings book.
        Returns: dict {"customer_id": ..., "balance": ...}
        """
        conn = db.get_connection()
        cursor = conn.cursor()
        try:
            customer = Customer.get_by_stutengarten_id(db, stutengarten_id)
            numeric_customer_id = customer.id

            cursor.execute("UPDATE kundensparbuecher SET saldo=%s WHERE kunden_fk=%s",
                           (balance, numeric_customer_id))
            if cursor.rowcount == 0:
                raise CustomException("Could not update balance")
            conn.commit()
            return {"stutengarten_id": stutengarten_id, "balance": balance}
        except Exception as e:
            raise CustomException(f"Error updating balance: {e}") from e
        finally:
            cursor.close()
            conn.close()
#End-of-file
