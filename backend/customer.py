"""import db_connector for connection to database"""
from db_connector import DbConnector

class CustomException(Exception):
    """special exception"""

class CustomerException(Exception):
    """special exception"""

class SavingsBookRef:
    """Class for referencing on savingsbook"""
    def __init__(self, customer_id, balance):
        self.customer_id = customer_id
        self.balance = balance

class Customer:
    """Class for creating customer object"""
    def __init__(self, db: DbConnector,
                 stutengarten_id=None,
                 first_name=None,
                 last_name=None,
                 id=None): # pylint: disable=redefined-builtin
        self.db = db

        if id is None:
            # Validate required fields before insert
            if stutengarten_id is None or first_name is None or last_name is None:
                raise CustomerException("stutengarten_id, first_name and last_name must be set to create a new customer.") # pylint:disable=line-too-long

            # Create new customer in DB
            conn = db.get_connection()
            cursor = conn.cursor()
            try:
                cursor.execute(
                    "INSERT INTO kunden (stutengarten_id, vorname, nachname) VALUES (%s, %s, %s)",
                    (stutengarten_id, first_name, last_name),
                )
                self.id = cursor.lastrowid
                self.stutengarten_id = stutengarten_id
                self.first_name = first_name
                self.last_name = last_name
                conn.commit()
            except Exception as err:
                raise CustomException(f"Error creating customer: {err}") from err
            finally:
                cursor.close()
                conn.close()
        else:
            # Customer object from existing data
            self.id = id
            self.stutengarten_id = stutengarten_id
            self.first_name = first_name
            self.last_name = last_name

    def delete(self):
        """
        Delete this customer from the database.
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("DELETE FROM kunden WHERE stutengarten_id = %s", (self.stutengarten_id,))
            conn.commit()
        finally:
            cursor.close()
            conn.close()

    # Static methods
    @staticmethod
    def get_by_stutengarten_id(db: DbConnector, stutengarten_id):
        """getting customer by their id"""
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM kunden WHERE stutengarten_id = %s", (stutengarten_id,))
            row = cursor.fetchone()
        finally:
            cursor.close()
            conn.close()
        if row:
            return Customer(db,
                            row["stutengarten_id"],
                            row["vorname"],
                            row["nachname"],
                            id=row["id"])
        else:
            raise CustomerException("No customer found!")

    @staticmethod
    def get_by_db_id(db: DbConnector, customer_id):
        """getting customer by their id in the database"""
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM kunden WHERE id = %s", (customer_id,))
            row = cursor.fetchone()
        finally:
            cursor.close()
            conn.close()
        if row:
            return Customer(db,
                            row["stutengarten_id"],
                            row["vorname"],
                            row["nachname"],
                            id=row["id"])
        else:
            raise CustomerException("No customer found!")

    # Methods
    def get_savings_book(self):
        conn = self.db.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM kundensparbuecher WHERE kunden_fk = %s", (self.id,))
            row = cursor.fetchone()
        finally:
            cursor.close()
            conn.close()
        if row:
            return SavingsBookRef(self.stutengarten_id, row["saldo"])
        else:
            raise CustomException("No savings book available")

    # Update methods
    def update_stutengarten_id(self, new_id):
        """updating the stutengarten_id of a customer"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("UPDATE kunden SET stutengarten_id = %s WHERE stutengarten_id = %s", (new_id, self.stutengarten_id)) # pylint:disable=line-too-long
            conn.commit()
            self.stutengarten_id = new_id
        finally:
            cursor.close()
            conn.close()

    def update_first_name(self, new_first_name):
        """updating customers first name"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("UPDATE kunden SET vorname = %s WHERE stutengarten_id = %s", (new_first_name, self.stutengarten_id)) # pylint:disable=line-too-long
            conn.commit()
            self.first_name = new_first_name
        finally:
            cursor.close()
            conn.close()

    def update_last_name(self, new_last_name):
        """updating customers last name"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("UPDATE kunden SET nachname = %s WHERE stutengarten_id = %s", (new_last_name, self.stutengarten_id)) # pylint:disable=line-too-long
            conn.commit()
            self.last_name = new_last_name
        finally:
            cursor.close()
            conn.close()

    def to_dict(self):
        """converting object into dictionary"""
        return {
            "id": self.id,
            "stutengarten_id": self.stutengarten_id,
            "first_name": self.first_name,
            "last_name": self.last_name,
        }
#End-of-file
