"""Importing xlsx_fle_reader for importing data from xlsx-file"""

from xlsx_file_reader import XlsxFileReader

class CompanyImport:
    """Class to handle company data import from xlsx-File to MariaDB"""
    def __init__(self, db_connector):
        """Initialize class with existing database connector"""
        self.db_connector = db_connector
        self.xlsx_reader = XlsxFileReader()

    def import_company(self, file_object = None):
        """Import company data from xlsx-file to MariaDB"""
        try:
            # check if file we have file
            if not file_object:
                return {"status": "error", "message": "No file provided"}
            company_data = self.xlsx_reader.read(file_object)

            # insert data into database
            inserted_count = self.insert_companies(company_data)
            result = {
                "status": "success",
                "message": f"Successfully imported {inserted_count} companies to database",
                "total_records": len(company_data),
                "inserted_records": inserted_count
            }
            print(result["message"])
            return result

        except Exception as e: # pylint: disable=broad-except
            error_msg = f"Error during import: {e}"
            return {"status": "error", "message": error_msg}

    @staticmethod
    def _generate_symbol(name: str) -> str:
        """
        Generates a stock symbol from a company name.
        Takes letters only, uppercased, max 5 characters.
        e.g. "Apfel AG" -> "APFLA"
        """
        letters_only = ''.join(c for c in name if c.isalpha())
        return letters_only[:5].upper()

    def insert_companies(self, company_data):
        """Insert company data into database using Bulk Insert.
        Also inserts each company as a share (Aktie) in the aktien table."""
        if not company_data:
            print("No company data to insert")
            return 0

        conn = self.db_connector.get_connection()
        cursor = conn.cursor()

        insert_company_query = """
        INSERT IGNORE INTO unternehmen (bezeichnung)
        VALUES (%s)
        """

        insert_share_query = """
        INSERT IGNORE INTO aktien (name, symbol, beschreibung)
        VALUES (%s, %s, %s)
        """

        companies_to_insert = []
        shares_to_insert = []

        try:
            # 1. Daten sammeln
            for company in company_data:
                try:
                    company_name =      company.get('name') or \
                                        company.get('Unternehmen') or \
                                        company.get('Bezeichnung') or \
                                        company.get('Name') or \
                                        company.get('Firma')

                    if not company_name:
                        continue

                    company_name = str(company_name).strip()
                    symbol = self._generate_symbol(company_name)

                    companies_to_insert.append((company_name,))
                    shares_to_insert.append((
                        company_name,
                        symbol,
                        f"Aktie des Unternehmens {company_name}"
                    ))

                except Exception:  # pylint: disable=broad-except
                    continue

            if not companies_to_insert:
                return 0

            # 2. Unternehmen einfügen
            cursor.executemany(insert_company_query, companies_to_insert)
            inserted_count = cursor.rowcount

            # 3. Aktien einfügen (INSERT IGNORE überspringt bereits vorhandene)
            cursor.executemany(insert_share_query, shares_to_insert)
            shares_inserted = cursor.rowcount

            # 4. Spabücher für diese Unternehmen erstellen (oder sicherstellen, dass sie existieren)
            company_names = [row[0] for row in companies_to_insert]
            if company_names:
                format_strings = ','.join(['%s'] * len(company_names))
                cursor.execute(f"SELECT id FROM unternehmen WHERE bezeichnung IN ({format_strings})", tuple(company_names))
                company_ids = [(row[0],) for row in cursor.fetchall()]
                if company_ids:
                    cursor.executemany("INSERT IGNORE INTO unternehmenssparbuecher (unternehmen_fk, saldo) VALUES (%s, 0)", company_ids)

            conn.commit()
            print(f"Inserted {inserted_count} companies and {shares_inserted} shares.")
            return inserted_count

        except Exception as e:  # pylint: disable=broad-except
            print(f"Major error during bulk insert: {e}")
            conn.rollback()
            raise e  # Fehler weiterwerfen, damit er oben gefangen wird
        finally:
            cursor.close()
            conn.close()
# End-of-file