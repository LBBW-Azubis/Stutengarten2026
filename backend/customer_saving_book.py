"""import db_connector for connection to database"""
from db_connector import DbConnector
from customer import Customer, CustomerException
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
        try:
            query = """
            SELECT ks.saldo, k.stutengarten_id, k.vorname, k.nachname
            FROM kundensparbuecher ks
            JOIN kunden k ON ks.kunden_fk = k.stutengarten_id
            """
            cursor.execute(query)
            for row in cursor.fetchall():
                result.append({
                    "stutengarten_id": row["stutengarten_id"],
                    "first_name": row["vorname"],
                    "last_name": row["nachname"],
                    "balance": row["saldo"],
                })
            return result
        finally:
            cursor.close()
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
        try:
            query = """
            SELECT ks.saldo, k.stutengarten_id
            FROM kundensparbuecher ks
            JOIN kunden k ON ks.kunden_fk = k.stutengarten_id
            WHERE k.stutengarten_id = %s
            """
            cursor.execute(query, (stutengarten_id,))
            for row in cursor.fetchall():
                result.append({
                    "stutengarten_id": row["stutengarten_id"],
                    "balance": row["saldo"],
                })
            return result
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def create_new(db: DbConnector, stutengarten_id):
        """
        Creates a new savings book for the given customer.
        Returns: dict {"customer_id": ..., "balance": 0}
        """

        conn = db.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO kundensparbuecher (kunden_fk, saldo) VALUES (%s, 0)", 
                (stutengarten_id,)
            )
            conn.commit()
            return {"stutengarten_id": stutengarten_id, "balance": 0}
        except Exception as e:
            conn.rollback()
            # Check for duplicate entry
            if "Duplicate entry" in str(e):
                raise CustomException(f"Savings book for customer {stutengarten_id} already exists.") from e #pylint: disable=line-too-long
            if "foreign key constraint fails" in str(e).lower():
                 raise CustomException(f"Customer with stutengarten_id {stutengarten_id} does not exist.") from e
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

            cursor.execute(
                "UPDATE kundensparbuecher SET saldo=%s WHERE kunden_fk=%s",
                (balance, stutengarten_id)
            )
            if cursor.rowcount == 0:
                try:
                    Customer.get_by_stutengarten_id(db, stutengarten_id)
                    raise CustomException("Could not update balance. Savings book might not exist.")
                except CustomException:
                    raise CustomerException(f"Customer with stutengarten_id {stutengarten_id} does not exist.")

            conn.commit()
            return {"stutengarten_id": stutengarten_id, "balance": balance}
        except Exception as e:
            conn.rollback()
            raise CustomException(f"Error updating balance: {e}") from e
        finally:
            cursor.close()
            conn.close()
#End-of-file
