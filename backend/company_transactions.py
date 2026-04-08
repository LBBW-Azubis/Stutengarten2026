"""
    Import db_connector for connection to database
    datetime for statistics
    company for unique exceptions
    import locale for german wording of current_weekday
"""

import locale
from datetime import datetime
from db_connector import DbConnector
from company import CustomCompanyException

try:
    locale.setlocale(locale.LC_TIME, 'de_DE.UTF-8')
except locale.Error:
    try:
        locale.setlocale(locale.LC_TIME, 'German_Germany.1252')
    except locale.Error:
        print("Warning: German Locale couldnt be set. Weekdays will be in English and wont work with statistics")


class CompanyTransactionException(Exception):
    """Special exception for company transaction-related errors"""

class CompanyTransaction:
    """
    Class for handling transactions for company savings books.
    Corresponds to the 'unternehmensumsaetze' table in the database
    """

    def __init__(self, db:DbConnector, company_savings_book_id, amount, purpose,
                 company_savings_book=None, transaction_id=None):
        """
        Creates a new company transaction and writes it to the database.

        Args:
            db: Database connector
            company_savings_book_id: ID of the company savings book
            amount: Transaction amount (can be negative)
            purpose: Purpose of the transaction ("Verwendunszweck")
            company_savings_book: CompanySavingsBook objext to check balance
            transaction_id: ID for existing transactions (for loading from DB)
        """
        self.db = db

        if transaction_id is None:
            #Create new transaction
            if company_savings_book and (company_savings_book.balance + amount < 0):
                raise CustomCompanyException("Balance would go below 0")

            conn = db.get_connection()
            cursor = conn.cursor()
            try:
                cursor.execute(
                    "INSERT INTO unternehmensumsaetze (unternehmenssparbuecher_fk, betrag, verwendungszweck) VALUES (%s, %s, %s)", #pylint: disable=line-too-long
                    (company_savings_book_id, amount, purpose)
                )
                self.id = cursor.lastrowid
                self.company_savings_book_id = company_savings_book_id
                self.amount = amount
                self.purpose = purpose

                #Update company savings book balance if provided
                if company_savings_book:
                    cursor.execute(
                        "UPDATE unternehmenssparbuecher SET saldo = saldo + %s WHERE id = %s",
                        (amount, company_savings_book_id)
                    )
                    company_savings_book.balance += amount

                conn.commit()

                #Add to statistics
                self.add_to_statistics()

            except Exception as err: #pylint: disable=broad-except
                conn.rollback()
                raise CustomCompanyException(f"Error creating company transaction: {err}") from err
            finally:
                cursor.close()
                conn.close()
        else:
            #Load existing transactions from database
            self.id = transaction_id
            self.company_savings_book_id = company_savings_book_id
            self.amount = amount
            self.purpose = purpose

    @staticmethod
    def get_all_transactions_for_company(db:DbConnector, company_id):
        """
        Returns all transactions for a specific company.
        Since each company has only one savings book, this returns all company transactions.

        Args:
            db: Database connector
            company_id: Id of the company
        
        Returns:
            List of CompanyTransaction object with company info
        """
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            query = """
            SELECT uu.id,
                uu.unternehmenssparbuecher_fk as company_savings_book_id,
                uu.betrag as amount,
                uu.verwendungszweck as purpose,
                u.bezeichnung as company_name
            FROM unternehmensumsaetze uu
            JOIN unternehmenssparbuecher us ON uu.unternehmenssparbuecher_fk = us.id
            JOIN unternehmen u ON us.unternehmen_fk = u.id
            WHERE u.id = %s
            ORDER BY uu.id DESC
            """
            cursor.execute(query, (company_id,))

            return cursor.fetchall()
        finally:
            cursor.close()
            conn.close()

    def add_to_statistics(self):
        """
        Adds this transaction amount to the daily statistics.
        Updates or creates entry for current weekday.
        """
        weekdays_german = ['MONTAG', 'DIENSTAG', 'MITTWOCH', 'DONNERSTAG', 'FREITAG', 'SAMSTAG', 'SONNTAG']
        current_weekday = weekdays_german[datetime.now().weekday()]

        conn = self.db.get_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            # Check if entry for current weekdays exists
            cursor.execute(
                "SELECT * FROM unternehmensstatistik WHERE wochentage = %s",
                (current_weekday,)
            )
            row = cursor.fetchone()

            if not row:
                #Create new entry
                cursor.execute(
                    "INSERT INTO unternehmensstatistik (wochentage, gesamtumsatz) VALUES (%s, %s)",
                    (current_weekday, self.amount)
                )
            else:
                #Update existing entry
                cursor.execute(
                    "UPDATE unternehmensstatistik SET gesamtumsatz = gesamtumsatz + %s WHERE wochentage = %s", #pylint: disable=line-too-long
                    (self.amount, current_weekday)
                )

            conn.commit()

        except Exception as err: #pylint: disable=broad-except
            conn.rollback()
            print(f"Error updating company statistics: {err}")
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_company_statistics(db:DbConnector):
        """
        Returns company transaction statistics by weekday.

        Returns:
            List of dicts: [{"weekday"}: "MONDAY", "total_amount": 1000}, ...]
        """
        result = []
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            cursor.execute("SELECT * FROM unternehmensstatistik ORDER BY id")
            for row in cursor.fetchall():
                result.append({
                    "weekday": row["wochentage"],
                    "total_amount": row["gesamtumsatz"] or 0
                })
            return result
        finally:
            cursor.close()
            conn.close()

    def to_dict(self):
        """
        Converts company transaction objects to dictionary for JSON serialization.
        
        Returns:
            Dict with transaction data
        """
        result = {
            "id": self.id,
            "company_savings_book_id": self.company_savings_book_id,
            "amount": self.amount,
            "purpose": self.purpose
        }

        #Add company name if available
        if hasattr(self, 'company_name'):
            result["company_name"] = self.company_name

        return result

    #Getter methods for compatibility
    def get_id(self):
        """Returns transaction id"""
        return self.id

    def get_company_savings_book_id(self):
        """Returns company savings book ID"""
        return self.company_savings_book_id

    def get_amount(self):
        """Returns transaction amount"""
        return self.amount

    def get_purpose(self):
        """Returns transaction purpose ("Verwendungszweck")"""
        return self.purpose

#End-of-file
