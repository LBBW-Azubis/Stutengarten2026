"""import db_connector for connection to database"""

import random
import string
from db_connector import DbConnector

def _generate_unique_symbol(cursor, base_name):
    base_chars = ''.join([c for c in base_name if c.isalnum()]).upper()
    prefix = base_chars[:3] if len(base_chars) >= 3 else (base_chars + "CTX")[:3]
    
    cursor.execute("SELECT symbol FROM aktien WHERE symbol = %s", (prefix,))
    if not cursor.fetchone():
        return prefix
        
    for i in range(1, 100):
        symbol = f"{prefix}{(i):02d}"[:5]
        cursor.execute("SELECT symbol FROM aktien WHERE symbol = %s", (symbol,))
        if not cursor.fetchone():
            return symbol
            
    while True:
        symbol = (prefix[:2] + ''.join(random.choices(string.ascii_uppercase + string.digits, k=3)))[:5]
        cursor.execute("SELECT symbol FROM aktien WHERE symbol = %s", (symbol,))
        if not cursor.fetchone():
            return symbol

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
                 id=None): # pylint: disable=redefined-builtin
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
                
                # Automatically create company savings book
                cursor.execute(
                    "INSERT INTO unternehmenssparbuecher (unternehmen_fk, saldo) VALUES (%s, 0)",
                    (self.id,)
                )
                
                # Automatically create share (aktie) for this company
                symbol = _generate_unique_symbol(cursor, name)
                cursor.execute(
                    "INSERT INTO aktien (name, symbol, beschreibung) VALUES (%s, %s, %s)",
                    (name, symbol, f"Aktie für {name}")
                )
                
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
            conn.close()

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
            conn.close()
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
            conn.close()
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
            cursor.execute("SELECT * FROM unternehmenssparbuecher WHERE unternehmen_fk = %s", (self.id,)) # pylint:disable=line-too-long
            row = cursor.fetchone()
        finally:
            cursor.close()
            conn.close()
        if row:
            return CompanySavingsBookRef(self.id, row["saldo"])
        else:
            raise CustomCompanyException("No company savingsbook available")

    def update_name(self, new_name):
        """updating company name"""
        conn = self.db.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("UPDATE unternehmen SET bezeichnung = %s WHERE id = %s", (new_name, self.id)) # pylint:disable=line-too-long
            conn.commit()
            self.name = new_name
        finally:
            cursor.close()
            conn.close()

    def update_folder_handed_over(self, folder_handed_over):
        """updating status on folder"""
        conn = self.db.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("UPDATE unternehmen SET mappe_abgegeben = %s WHERE id = %s", (folder_handed_over, self.id)) # pylint:disable=line-too-long
            conn.commit()
            self.folder_handed_over = folder_handed_over
        finally:
            cursor.close()
            conn.close()

    def to_dict(self):
        """converting object into dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "folder_handed_over": self.folder_handed_over,
        }
#End-of-file
