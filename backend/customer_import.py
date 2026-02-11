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

        # Hole die Verbindung EINMAL am Anfang
        conn = self.db_connector.get_connection()
        cursor = conn.cursor()

        # INSERT IGNORE sorgt dafür, dass bei doppelten IDs der Batch nicht abstürzt,
        # sondern die Duplikate einfach ignoriert werden.
        insert_query = """
        INSERT IGNORE INTO kunden (stutengarten_id, vorname, nachname)
        VALUES (%s, %s, %s)
        """

        data_to_insert = []

        try:
            # 1. Daten sammeln und vorbereiten (reine Python-Operation -> schnell)
            for customer in customer_data:
                try:
                    # map xlsx columns to database columns
                    stutengarten_id =   customer.get('Stutengarten ID' or \
                                        customer.get('Stutengarten_ID') or \
                                        customer.get('ID'))

                    vorname = customer.get('Vorname')
                    nachname = customer.get('Nachname')

                    if not stutengarten_id or not vorname or not nachname:
                        # Stille Skip oder Loggen ohne I/O Blockierung
                        continue

                    # Als Tupel zur Liste hinzufügen
                    data_to_insert.append((stutengarten_id, vorname, nachname))

                except Exception:
                    # Falls beim Dictionary-Zugriff was schief läuft
                    continue

            # 2. Bulk Insert ausführen (Ein einziger Netzwerk-Roundtrip!)
            if data_to_insert:
                cursor.executemany(insert_query, data_to_insert)
                conn.commit()
                # rowcount gibt bei executemany die Anzahl der eingefügten Zeilen zurück
                return cursor.rowcount
            else:
                return 0

        except Exception as e:
            print(f"Major error during bulk insert: {e}")
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()
# End-of-file
