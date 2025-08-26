"""import db_connector for connection to database"""
from db_connector import DbConnector

class CustomCompanyException(Exception):
    """special exception"""

class CompanyException(Exception):
    """special exception"""

class CompanySavingsBookRef:
    """Class for referencing on company savingsbook"""
    def __init__(self, company_id, balance):
        self.company_id = company_id
        self.balance = balance

class Company:
    """Class for creating company object"""
    def __init__(self, db:DbConnector,
                 name=None,
                 folder_handed_over=False,
                 id=None):
        self.db = db

        if id is None:
            #Validate required fields before insert
            if name is None:
                raise CompanyException("name must be set to create a new company")

            #Create new company in db
            conn = db.get_connection()
            cursor = conn.cursor()
            try:
                cursor.execute(
                    "INSERT INTO unternehmen (bezeichnung, mappe_abgegeben) VALUES (%s, %s)",
                    (name, folder_handed_over)
                )
                self.id = cursor.lastrowid
                self.name = name
                self.folder_handed_over = folder_handed_over
                conn.commit()
            except Exception as err:
                raise CustomCompanyException(f"Error creating company: {err}") from err
            finally:
                cursor.close()
        else:
            #Company object from existing data
            self.id = id
            self.name = name
            self.folder_handed_over = folder_handed_over

    def delete(self):
        """
        Delete this company from database
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("DELETE FROM unternehmen WHERE id = %s", (self.id,))
            conn.commit()
        finally:
            cursor.close()

    #Static methods
    @staticmethod
    def get_by_name(db: DbConnector, name):
        """getting company by their name"""
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM unternehmen WHERE bezeichnung = %s", (name,))
            row = cursor.fetchone()
        finally:
            cursor.close()
        if row:
            return Company(db,
                        row["bezeichnung"],
                        row["mappe_abgegeben"],
                        id=row["id"])
        else:
            raise CompanyException("No company found!")

    @staticmethod
    def get_by_db_id(db: DbConnector, company_id):
        """getting company by their id in the database"""
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM unternehmen WHERE id = %s", (company_id,))
            row = cursor.fetchone()
        finally:
            cursor.close()
        if row:
            return Company(db,
                        row["bezeichnung"],
                        row["mappe_abgegeben"],
                        id=row["id"])
        else:
            raise CompanyException("No company found!")

    #Methods
    def get_savings_book(self):
        """getting company savingsbook"""
        conn = self.db.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM unternehmenssparbuecher WHERE unternehmen_fk = %s", (self.id,))
            row = cursor.fetchone()
        finally:
            cursor.close()
        if row:
            return CompanySavingsBookRef(self.id, row["saldo"])
        else:
            raise CustomCompanyException("No company savingsbook available")

    def update_name(self, new_name):
        """updating company name"""
        conn = self.db.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("UPDATE unternehmen SET bezeichnung = %s WHERE id = %s", (new_name, self.id))
            conn.commit()
            self.name = new_name
        finally:
            cursor.close()

    def update_folder_handed_over(self, folder_handed_over):
        """updating status on folder"""
        conn = self.db.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("UPDATE unternehmen SET mappe_abgegeben = %s WHERE id = %s", (folder_handed_over, self.id))
            conn.commit()
            self.folder_handed_over = folder_handed_over
        finally:
            cursor.close()

    def to_dict(self):
        """converting object into dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "folder_handed_over": self.folder_handed_over,
        }
#End-of-file
