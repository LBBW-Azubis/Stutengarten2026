"""import db_connector for connection to database"""

from db_connector import DbConnector
from company import CustomCompanyException, Company, CompanyException

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

        query = """
            SELECT 
            u.bezeichnung AS name, 
            u.mappe_abgegeben AS folder_handed_over, 
            us.saldo AS balance
            FROM unternehmenssparbuecher us
            JOIN unternehmen u ON us.unternehmen_fk = u.id
            """

        try:
            cursor.execute(query)
            for row in cursor.fetchall():
                result.append({
                    "name": row["name"],
                    "folder_handed_over": row["folder_handed_over"],
                    "balance": row["balance"]
                })
            return result
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_company_savings_book_overview(db:DbConnector, company_id):
        """
        Returns a list with the balance and name for a specific company's savings book.
        Returns: List of dicts: [{"name", "balance"}]
        """
        result = []
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
        SELECT 
            u.bezeichnung AS name,
            us.saldo AS balance
        FROM unternehmenssparbuecher us
        JOIN unternehmen u ON us.unternehmen_fk = u.id
        WHERE us.unternehmen_fk = %s
        """

        try:
            cursor.execute(query, (company_id,))
            for row in cursor.fetchall():
                result.append({
                    "name": row["name"],
                    "balance": row["balance"]
                })
            return result
        finally:
            cursor.close()
            conn.close()

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
            conn.close()

    @staticmethod
    def set_balance(db:DbConnector, company_id, balance):
        """
        Updates the balance for a company's savings book.
        Returns: dict {"company_id": ..., "name": ..., "balance": ...}
        """
        try:
            balance = int(balance)
        except ValueError as exc:
            raise CustomCompanyException("Der Betrag muss eine Zahl sein.") from exc

        conn = db.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("UPDATE unternehmenssparbuecher SET saldo=%s WHERE unternehmen_fk=%s",
                           (balance, company_id))
            if cursor.rowcount == 0:
                try:
                    Company.get_by_db_id(db, company_id)
                    raise CustomCompanyException("Could not update balance. Savings book might not exist.")
                except CompanyException as exc:
                    raise CustomCompanyException(
                        f"Company with id {company_id} does not exist.") from exc

            conn.commit()

            # Get company data to return with the balance
            company = Company.get_by_db_id(db, company_id)
            return {
                "company_id": company_id,
                "name": company.name,
                "balance": balance                
            }
        except Exception as e:
            conn.rollback()
            raise CustomCompanyException(f"Error updating balance: {e}") from e
        finally:
            cursor.close()
            conn.close()
#End-of-file
