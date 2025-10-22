"""import db_connector for connection to database"""

from db_connector import DbConnector
from company import CustomCompanyException

class CompanySavingsBook:
    """
    Class to handle companies savings book (Sparbuch) operations for companies
    All methods use dicts for better JSON compatibility.
    """

    @staticmethod
    def get_all_company_savings_books(db: DbConnector):
        """
        Returns a list of all savings books with corresponding company data.
        Returns: List of dicts: [{"name", "folder_handed_over"}]
        """
        result = []
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor2 = conn.cursor(dictionary=True)

        try:
            cursor.execute("SELECT * FROM unternehmenssparbuecher")
            for row in cursor.fetchall():
                company_id = row.get("unternehmen_fk")
                balance = row["saldo"]
                cursor2.execute("SELECT * FROM unternehmen WHERE id = %s", (company_id,))
                company_row = cursor2.fetchone()
                if company_row:
                    result.append({
                        "name":company_row["bezeichnung"],
                        "folder_handed_over":company_row["mappe_abgegeben"],
                        "balance":balance
                    })
                else:
                    raise CustomCompanyException("No company found for this savings book!")
            return result
        finally:
            cursor.close()
            cursor2.close()

    @staticmethod
    def get_company_savings_book_overview(db:DbConnector, company_id):
        """
        Returns a list with the balance and name for a specific company's savings book.
        Returns: List of dicts: [{"name", "balance"}]
        """
        result = []
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor2 = conn.cursor(dictionary=True)

        try:
            cursor.execute("SELECT * FROM unternehmenssparbuecher WHERE unternehmen_fk = %s", (company_id,)) # pylint:disable=line-too-long
            for row in cursor.fetchall():
                balance = row["saldo"]
                cursor2.execute("SELECT * FROM unternehmen WHERE id = %s", (company_id,))
                customer_row = cursor2.fetchone()
                if customer_row:
                    result.append({
                        "name": customer_row["bezeichnung"],
                        "balance": balance
                    })
                else:
                    raise CustomCompanyException("No company found for this savings book!")
            return result
        finally:
            cursor.close()
            cursor2.close()

    @staticmethod
    def create_new(db:DbConnector, company_id):
        """
        Creates a new savings book for the given company.
        Returns: dict {"name": ..., "balance": 0}
        """
        conn = db.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("INSERT INTO unternehmenssparbuecher (unternehmen_fk) VALUES (%s)", (company_id,)) # pylint:disable=line-too-long
            conn.commit()
            return {"company_id": company_id, "balance": 0}
        except Exception as e:
            raise CustomCompanyException(f"Error creating savings book: {e}") from e
        finally:
            cursor.close()

    @staticmethod
    def set_balance(db:DbConnector, company_id, balance):
        """
        Updates the balance for a company's savings book.
        Returns: dict {"company_id": ..., "balance": ...}
        """
        conn = db.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("UPDATE unternehmenssparbuecher SET saldo=%s WHERE unternehmen_fk=%s",
                           (balance, company_id))
            if cursor.rowcount == 0:
                raise CustomCompanyException("Could not update balance")
            conn.commit()
            return {"company_id": company_id, "balance": balance}
        except Exception as e:
            raise CustomCompanyException(f"Error updating balance: {e}") from e
        finally:
            cursor.close()
#End-of-file
