"""
    import db_connector for connection to database
    customer for connection to specific customer
"""
from datetime import datetime
from db_connector import DbConnector
from customer import CustomerException


class CustomerShares:
    """
    Class to handle shares (Aktien) operations of customers.
    All methods use dicts for better JSON compatibility.
    """

    def __init__(self, db:DbConnector, value, customer_savings_book_id,
                  customer_savings_book=None, share_id=None):
        """
        Creates a new share and writes it to the database.

        Args:
            db: Database connector
            value: current value of share
            customer_savings_book_id: ID of customer savings book
            customer_savings_book: CustomerSavingsBook object to check balance
            share_id: ID for existing shares (for loading from DB)
        """
        current_weekday = datetime.now().strftime("%A").upper()
        self.db = db

        if share_id is None:
            #Create new share
            if customer_savings_book and (customer_savings_book.balance - value < 0):
                raise CustomerException("Balance would go below 0")

            conn = db.get_connection()
            cursor = conn.cursor()
            try:
                cursor.execute(
                    "INSERT INTO kundenaktien (besitzer_fk, wert, wochentage) VALUES (%s, %s, %s)", #pylint: disable=line-too-long
                    (customer_savings_book_id, value, current_weekday)
                )
                self.id = cursor.lastrowid
                self.customer_savings_book_id = customer_savings_book_id
                self.value = value
                self.current_weekday = current_weekday

                #Update customer savings book balance if provided
                if customer_savings_book:
                    cursor.execute(
                        "UPDATE kundensparbuecher SET saldo = saldo - %s WHERE id = %s",
                        (value, customer_savings_book_id)
                    )
                    customer_savings_book.balance -= value

                conn.commit()

            except Exception as err:
                conn.rollback()
                raise CustomerException(f"Error creating customer share purchase: {err}") from err
            finally:
                cursor.close()
                conn.close()
        else:
            # Load existing share from database
            self.id = share_id
            self.customer_savings_book_id = customer_savings_book_id
            self.value = value
            self.current_weekday = current_weekday

    @staticmethod
    def get_all_customer_shares(db: DbConnector, stutengarten_id):
        """
        Returns a list with all shares for a specific customer.
        """
        shares = []
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            query = """
            SELECT ka.*, k.vorname, k.nachname, k.stutengarten_id
            FROM kundenaktien ka
            JOIN kunden k ON ka.besitzer_fk = k.id
            WHERE k.stutengarten_id = %s
            ORDER BY ka.id DESC
            """
            cursor.execute(query, (stutengarten_id,))

            for row in cursor.fetchall():
                share = CustomerShares(
                    db,
                    row["wert"],
                    row["besitzer_fk"],
                    customer_savings_book=None,
                    share_id=row["id"]
                )
                # Add customer name for convenience
                share.customer_name = f'{row["vorname"]} {row["nachname"]}'  # pylint:disable=attribute-defined-outside-init
                share.stutengarten_id = row["stutengarten_id"]  # pylint:disable=attribute-defined-outside-init
                shares.append(share)

            return shares
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def sell_share(db:DbConnector, share_id, stutengarten_id,
                   customer_savings_book=None):
        """
        Sells a share and deletes it from database
    
        Args:
            db: Database connector
            share_id: ID of selling Aktie
            stutengarten_id: stutengarten_id of customer (NOT savings book id!)
            customer_savings_book: CustomerSavingsBook object to update balance
        
        Returns:
            dict with information on sell
        """
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            # First, get the numeric customer ID from stutengarten_id
            cursor.execute("SELECT id FROM kunden WHERE stutengarten_id = %s", (stutengarten_id,))
            customer_row = cursor.fetchone()
            if not customer_row:
                raise CustomerException("Customer not found")
            numeric_customer_id = customer_row['id']

            # Load share from database - besitzer_fk is numeric customer id
            cursor.execute(
                "SELECT * FROM kundenaktien WHERE id = %s AND besitzer_fk = %s",
                (share_id, numeric_customer_id)
            )
            share = cursor.fetchone()

            if not share:
                raise CustomerException("Share not found or does not belong to this customer")

            # Update balance of savings book
            share_value = share['wert']

            if customer_savings_book:
                cursor.execute(
                    "UPDATE kundensparbuecher SET saldo = saldo + %s WHERE kunden_fk = %s",
                    (share_value, numeric_customer_id)
                )
                customer_savings_book.balance += share_value

            # Delete from database
            cursor.execute(
                "DELETE FROM kundenaktien WHERE id = %s",
                (share_id,)
            )

            conn.commit()

            return {
                "status": "success",
                "share_id": share_id,
                "sold_value": share_value,
                "new_balance": customer_savings_book.balance if customer_savings_book else None
            }

        except Exception as err:
            conn.rollback()
            raise CustomerException(f"Error selling share: {err}") from err
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def update_share_value(db: DbConnector, share_id, new_value,
                       stutengarten_id=None):
        """
            Updates value of specific share.
        
            Args:
                db: Database connector
                share_id: ID of updating share
                new_value: new value of specific share
                stutengarten_id: Optional - stutengarten_id for validation of customer
            
            Returns:
                dict with updated information of share
        """
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            if stutengarten_id:
                # Get numeric customer ID
                cursor.execute("SELECT id FROM kunden WHERE stutengarten_id = %s", (stutengarten_id,)) #pylint: disable=line-too-long
                customer_row = cursor.fetchone()
                if not customer_row:
                    raise CustomerException("Customer not found")
                numeric_customer_id = customer_row['id']

                cursor.execute(
                    "SELECT * FROM kundenaktien WHERE id = %s AND besitzer_fk = %s",
                    (share_id, numeric_customer_id)
                )
            else:
                cursor.execute(
                    "SELECT * FROM kundenaktien WHERE id = %s",
                    (share_id,)
                )

            share = cursor.fetchone()

            if not share:
                raise CustomerException("Share not found or does not belong to this customer")

            old_value = share['wert']

            # Update the value
            cursor.execute(
                "UPDATE kundenaktien SET wert = %s WHERE id = %s",
                (new_value, share_id)
            )

            if cursor.rowcount == 0:
                raise CustomerException("Could not update share value")

            conn.commit()

            return {
                "status": "success",
                "share_id": share_id,
                "old_value": old_value,
                "new_value": new_value,
                "value_change": new_value - old_value
            }

        except Exception as err:
            conn.rollback()
            raise CustomerException(f"Error updating share value: {err}") from err
        finally:
            cursor.close()
            conn.close()



    #Getter methods for compatibility
    def get_id(self):
        """Returns share ID"""
        return self.id

    def get_customer_savings_book_id(self):
        """Returns customer savings book ID"""
        return self.customer_savings_book_id

    def get_value(self):
        """Returns share value"""
        return self.value

#End-of-file
