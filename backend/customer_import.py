"""Importing xlsx_fle_reader for importing data from xlsx-file"""
from xlsx_file_reader import XlsxFileReader

class CustomerImport:
    """Class to handle customer data import from xlsx-File to MariaDB"""
    def __init__(self, db_connector):
        """Initialize class with existing database connector"""
        self.db_connector = db_connector
        self.xlsx_reader = XlsxFileReader()

    def import_customers(self, file_object = None):
        """Import customer data from xlsx-file to MariaDB"""
        try:
            # check if file we have file
            if not file_object:
                return {"status": "error", "message": "No file provided"}
            customer_data = self.xlsx_reader.read(file_object)

            # insert data into database
            inserted_count = self.insert_customers(customer_data)
            result = {
                "status": "success",
                "message": f"Successfully imported {inserted_count} customers to database",
                "total_records": len(customer_data),
                "inserted_records": inserted_count
            }
            print(result["message"])
            return result

        except Exception as e: # pylint: disable=broad-except
            error_msg = f"Error during import: {e}"
            return {"status": "error", "message": error_msg}

    def insert_customers(self, customer_data):
        """Insert customer data into database"""
        if not customer_data:
            print("No customer data to insert")
            return 0

        cursor = self.db_connector.get_connection().cursor()
        inserted_count = 0

        # insert query for kunden table
        insert_query = """
        INSERT INTO kunden (stutengarten_id, vorname, nachname)
        VALUES (%s, %s, %s)
        """

        for customer in customer_data:
            try:
                # map xlsx columns to database columns
                # handels both Stungarten_ID and without underscore (Stutengarten ID)
                stutengarten_id =   customer.get('Stutengarten ID' or \
                                    customer.get('Stutengarten_ID') or \
                                    customer.get('ID'))

                vorname = customer.get('Vorname')
                nachname = customer.get('Nachname')

                if not stutengarten_id or not vorname or not nachname:
                    print(f"Skipping customer with missing required fields; {customer}")
                    continue

                values = (stutengarten_id, vorname, nachname)

                cursor.execute(insert_query, values)
                inserted_count += 1

                print(f"Inserted customer: {stutengarten_id} {vorname} {nachname}")

            except Exception as e: # pylint: disable=broad-except
                print(f"Error inserting customer {customer}: {e}")
                continue

        # commit all changes
        self.db_connector.get_connection().commit()
        cursor.close()

        return inserted_count

    # End-of-file
