"""Import db_connector for connection to database and datetime for statistics"""
from datetime import datetime
from db_connector import DbConnector
from customer import Customer,CustomerException, CustomException

class CustomerTransactionException(Exception):
    """Special exception for customer transaction-related errors"""

class CustomerTransaction:
    """
    Class for handling transactions for customer savings books.
    Corresponds to the 'kundenumsaetze' table in the database
    """

    def __init__(self, db:DbConnector, customer_savings_book_id, amount, purpose,
                 customer_savings_book=None, transaction_id=None):
        """
        Creates a new customer transaction and writes it to the database.

        Args:
            db: Database connector
            customer_savings_book_id: ID of the customer savings book
            amount: Transaction amount (can be negative)
            purpose: Purpose of the transaction ("Verwendungszweck")
            customer_savings_book: CustomerSavingsBook object to check balance
            transaction_id: ID for existing transactions (for loading from DB)
        """
        self.db = db

        if transaction_id is None:
            #Create new transaction
            if customer_savings_book and (customer_savings_book.balance + amount < 0):
                raise CustomerException("Balance would go below 0")

            conn = db.get_connection()
            cursor = conn.cursor()
            try:
                cursor.execute(
                    "INSERT INTO kundenumsaetze (kundensparbuch_fk, betrag, verwendungszweck) VALUES (%s, %s, %s)",
                    (customer_savings_book_id, amount, purpose)
                    )
                self.id = cursor.lastrowid
                self.customer_savings_book_id = customer_savings_book_id
                self.amount = amount
                self.purpose = purpose

                #Update customer savings book balance if provided
                if customer_savings_book:
                    cursor.execute(
                        "UPDATE kundensparbuecher SET saldo = saldo + %s WHERE id = %s",
                        (amount, customer_savings_book_id)
                    )
                    customer_savings_book.balance += amount

                conn.commit()

                #Add to statistics
                self.add_to_statistics()

            except Exception as err:
                conn.rollback()
                raise CustomException(f"Error creating customer transaction: {err}") from err
            finally:
                cursor.close()
                conn.close()
        else:
            #Load existing transactions from database
            self.id = transaction_id
            self.customer_savings_book_id = customer_savings_book_id
            self.amount = amount
            self.purpose = purpose

    @staticmethod
    def get_all_transactions_for_customer(db:DbConnector, stutengarten_id):
        """
        Returns all transactions for a specific customer.
        """
        transactions = []
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            # This query correctly joins through the tables using the correct keys.
            query = """
            SELECT ku.*, k.vorname, k.nachname
            FROM kundenumsaetze ku
            JOIN kundensparbuecher ks ON ku.kundensparbuch_fk = ks.id
            JOIN kunden k ON ks.kunden_fk = k.stutengarten_id
            WHERE k.stutengarten_id = %s
            ORDER BY ku.id DESC
            """
            cursor.execute(query, (stutengarten_id,))

            for row in cursor.fetchall():
                transaction = CustomerTransaction(
                    db,
                    row["kundensparbuch_fk"],
                    row["betrag"],
                    row["verwendungszweck"],
                    transaction_id=row["id"]
                )
                transaction.customer_name = f'{row["vorname"]} {row["nachname"]}'
                transactions.append(transaction)

            return transactions
        finally:
            cursor.close()
            conn.close()

    def add_to_statistics(self):
        """
        Adds this transaction amount to the daily statistics.
        """
        current_weekday = datetime.now().strftime("%A").upper()
        conn = self.db.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM kundenstatistik WHERE wochentage = %s",
                           (current_weekday,))
            if not cursor.fetchone():
                cursor.execute("INSERT INTO kundenstatistik (wochentage, gesamtumsatz) VALUES (%s, %s)",
                               (current_weekday, self.amount))
            else:
                cursor.execute("UPDATE kundenstatistik SET gesamtumsatz = gesamtumsatz + %s WHERE wochentage = %s",
                               (self.amount, current_weekday))
            conn.commit()
        except Exception as err: # pylint:disable=broad-except
            conn.rollback()
            print(f"Error updating customer statistics: {err}")
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_customer_statistics(db:DbConnector):
        """
        Returns customer transaction statistics by weekday.
        """
        result = []
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM kundenstatistik ORDER BY id")
            for row in cursor.fetchall():
                result.append({"weekday": row["wochentage"],
                               "total_amount": row["gesamtumsatz"] or 0})
            return result
        finally:
            cursor.close()
            conn.close()

    def to_dict(self):
        """
        Converts customer transaction objects to dictionary for JSON serialization.
        """
        result = {
            "id": self.id,
            "customer_savings_book_id": self.customer_savings_book_id,
            "amount": self.amount,
            "purpose": self.purpose
        }
        if hasattr(self, 'customer_name'):
            result["customer_name"] = self.customer_name
        return result

    # ... (getter methods)

    @staticmethod
    def transfer(db:DbConnector, from_stutengarten_id, to_stutengarten_id, amount, purpose=""):
        """
        Transfers an amount between the savings books of two customers.

        The method ensures the entire transfer is an atomic database
        transaction. If any step fails, the entire operation is rolled back.

        Args:
            db (DbConnector): The database connector instance.
            from_stutengarten_id (str): ID of the sending customer.
            to_stutengarten_id (str): ID of the receiving customer.
            amount (int): The amount to be transferred.
            purpose (str, optional): The purpose for the transaction.

        Returns:
            dict: A confirmation of the successful transfer.

        Raises:
            CustomerTransactionException: For a missing savings book or insufficient funds.
            CustomerException: If a customer does not exist.
        """
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            # Ensure customers exist
            Customer.get_by_stutengarten_id(db, from_stutengarten_id)
            Customer.get_by_stutengarten_id(db, to_stutengarten_id)

            # KORREKTUR: Lock savings books using the correct foreign key (stutengarten_id)
            cursor.execute("SELECT id, saldo FROM kundensparbuecher WHERE kunden_fk = %s FOR UPDATE",
                           (from_stutengarten_id,))
            sb_sender = cursor.fetchone()
            cursor.execute("SELECT id, saldo FROM kundensparbuecher WHERE kunden_fk = %s FOR UPDATE",
                           (to_stutengarten_id,))
            sb_receiver = cursor.fetchone()

            if not sb_sender or not sb_receiver:
                raise CustomerTransactionException("Savings book not found for sender or receiver")
            if sb_sender["saldo"] < amount:
                raise CustomerTransactionException("Insufficient funds")

            # Update balances using the INT primary key of the savings book
            cursor.execute("UPDATE kundensparbuecher SET saldo = saldo - %s WHERE id = %s",
                           (amount, sb_sender["id"]))
            cursor.execute("UPDATE kundensparbuecher SET saldo = saldo + %s WHERE id = %s",
                           (amount, sb_receiver["id"]))

            # Create transaction records using the INT primary key of the savings book
            cursor.execute("INSERT INTO kundenumsaetze (kundensparbuch_fk, betrag, verwendungszweck) VALUES (%s, %s, %s)",
                           (sb_sender["id"], -amount, purpose))
            cursor.execute("INSERT INTO kundenumsaetze (kundensparbuch_fk, betrag, verwendungszweck) VALUES (%s, %s, %s)",
                           (sb_receiver["id"], amount, purpose))

            conn.commit()
            return {"status": "success", "from": from_stutengarten_id,
                    "to": to_stutengarten_id, "amount": amount}
        except Exception as err:
            conn.rollback()
            raise err
        finally:
            cursor.close()
            conn.close()

#End-of-file
