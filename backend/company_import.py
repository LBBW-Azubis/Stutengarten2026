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

    def insert_companies(self, company_data):
        """Insert company data into database using Bulk Insert"""
        if not company_data:
            print("No company data to insert")
            return 0

        conn = self.db_connector.get_connection()
        cursor = conn.cursor()

        # INSERT IGNORE verhindert Absturz bei doppelten Namen
        insert_query = """
        INSERT IGNORE INTO unternehmen (bezeichnung)
        VALUES (%s)
        """

        data_to_insert = []

        try:
            # 1. Daten sammeln
            for company in company_data:
                try:
                    company_name =      company.get('Unternehmen' or \
                                        company.get('Bezeichnung') or \
                                        company.get('Name')) or \
                                        company.get('Firma')

                    if not company_name:
                        continue

                    # WICHTIG: Das Komma macht es zu einem Tupel (company_name,)
                    data_to_insert.append((company_name,))

                except Exception:
                    continue

            # 2. Alles auf einmal einfügen
            if data_to_insert:
                cursor.executemany(insert_query, data_to_insert)
                conn.commit()
                return cursor.rowcount
            else:
                return 0

        except Exception as e: #pylint: disable=broad-except
            print(f"Major error during bulk insert: {e}")
            conn.rollback()
            raise e # Fehler weiterwerfen, damit er oben gefangen wird
        finally:
            cursor.close()
            conn.close()
# End-of-file
