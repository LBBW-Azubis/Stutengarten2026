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
        """Insert company data into database"""
        if not company_data:
            print("No company data to insert")
            return 0

        cursor = self.db_connector.get_connection().cursor()
        inserted_count = 0

        # insert query for unternehmen table
        insert_query = """
        INSERT INTO unternehmen (bezeichnung)
        VALUES (%s)
        """

        for company in company_data:
            try:
                # map xlsx columns to database columns
                company_name =      company.get('Unternehmen' or \
                                    company.get('Bezeichnung') or \
                                    company.get('Name')) or \
                                    company.get('Firma')

                if not company_name:
                    print(f"Skipping company with missing required fields; {company}")
                    continue

                values = (company_name,) # comma is necessary because its a tuple

                cursor.execute(insert_query, values)
                inserted_count += 1

                print(f"Inserted company: {company_name}")

            except Exception as e: # pylint: disable=broad-except
                print(f"Error inserting company {company}: {e}")
                continue

        # commit all changes
        self.db_connector.get_connection().commit()
        cursor.close()

        return inserted_count

    # End-of-file
