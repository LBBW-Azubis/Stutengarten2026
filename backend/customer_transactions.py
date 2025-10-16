"""Import db_connector for connection to database and datetime for statistics"""
from datetime import datetime
from db_connector import DbConnector
from customer import CustomerException

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
                    "INSERT INTO kundenumsaetze (sparbuch_fk, betrag, verwendungszweck) VALUES (%s, %s, %s)",
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
                raise CustomerException(f"Error creating customer transaction: {err}") from err
            finally:
                cursor.close()
        else:
            #Load existing transactions from database
            self.id = transaction_id
            self.customer_savings_book_id = customer_savings_book_id
            self.amount = amount
            self.purpose = purpose

    @staticmethod
    def get_all_transactions_for_customer(db:DbConnector, customer_id):
        """
        Returns all transactions for a specific customer.
        Since each customer has only one savings book, this returns all customer transactions.

        Args:
            db: Database connector
            customer_id: Id of the customer
        
        Returns:
            List of CustomerTransaction object with customer info
        """
        transactions = []
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            query = """
            SELECT ku.*, k.vorname, k.nachname
            FROM kundenumsaetze ku
            JOIN kundensparbuecher ks ON ku.sparbuch_fk = ks.id
            JOIN kunden k ON ks.kunden_fk = k.id
            WHERE k.id = %s
            ORDER BY ku.id DESC
            """
            cursor.execute(query, (customer_id,))

            for row in cursor.fetchall():
                transaction = CustomerTransaction(
                    db,
                    row["sparbuch_fk"],
                    row["betrag"],
                    row["verwendungszweck"],
                    transaction_id=row["id"]
                )
                #Add customer name for convenience
                transaction.customer_name = f'{row["vorname"]} {row["nachname"]}' # pylint:disable=attribute-defined-outside-init
                transactions.append(transaction)

            return transactions
        finally:
            cursor.close()

    def add_to_statistics(self):
        """
        Adds this transaction amount to the daily statistics.
        Updates or creates entry for current weekday.
        """
        current_weekday = datetime.now().strftime("%A").upper()

        conn = self.db.get_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            # Check if entry for current weekdays exists
            cursor.execute(
                "SELECT * FROM kundenstatistik WHERE wochentage = %s",
                (current_weekday,)
            )
            row = cursor.fetchone()

            if not row:
                #Create new entry
                cursor.execute(
                    "INSERT INTO kundenstatistik (wochentage, gesamtumsatz) VALUES (%s, %s)",
                    (current_weekday, self.amount)
                )
            else:
                #Update existing entry
                cursor.execute(
                    "UPDATE kundenstatistik SET gesamtumsatz = gesamtumsatz + %s WHERE wochentage = %s",
                    (self.amount, current_weekday)
                )

            conn.commit()

        except Exception as err:
            conn.rollback()
            print(f"Error updating customer statistics: {err}")
        finally:
            cursor.close()

    @staticmethod
    def get_customer_statistics(db:DbConnector):
        """
        Returns customer transaction statistics by weekday.

        Returns:
            List of dicts: [{"weekday"}: "MONDAY", "total_amount": 1000}, ...]
        """
        result = []
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            cursor.execute("SELECT * FROM kundenstatistik ORDER BY id")
            for row in cursor.fetchall():
                result.append({
                    "weekday": row["wochentage"],
                    "total_amount": row["gesamtumsatz"] or 0
                })
            return result
        finally:
            cursor.close()

    def to_dict(self):
        """
        Converts customer transaction objects to dictionary for JSON serialization.
        
        Returns:
            Dict with transaction data
        """
        result = {
            "id": self.id,
            "customer_savings_book_id": self.customer_savings_book_id,
            "amount": self.amount,
            "purpose": self.purpose
        }

        #Add customer name if available
        if hasattr(self, 'customer_name'):
            result["customer_name"] = self.customer_name

        return result

    #Getter methods for compatibility
    def get_id(self):
        """Returns transaction id"""
        return self.id

    def get_customer_savings_book_id(self):
        """Returns customer savings book ID"""
        return self.customer_savings_book_id

    def get_amount(self):
        """Returns transaction amount"""
        return self.amount

    def get_purpose(self):
        """Returns transaction purpose ("Verwendungszweck")"""
        return self.purpose

#End-of-file