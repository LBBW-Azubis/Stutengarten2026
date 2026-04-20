"""
    import db_connector for connection to database
    customer for connection to specific customer
"""
from datetime import datetime
from db_connector import DbConnector
from customer import Customer, CustomerException
from share import Share


class CustomerShares:
    """
    Class to handle shares (Aktien) operations of customers.
    All methods use dicts for better JSON compatibility.
    """

    def __init__(self, db: DbConnector, share_id, customer_stutengarten_id,
                 invested_amount, customer_shares_id=None, customer_savings_book=None):
        """
        Buys a new share for a customer.

        Args:
            db: connection to database
            share_id: ID of share (from aktien table)
            customer_stutengarten_id: Stutengarten ID of the customer
            invested_amount: amount customer wants to invest
            customer_shares_id: ID (when loading from db)
            customer_savings_book: Savings book object
        """
        self.db = db
        weekdays_german = ['MONTAG', 'DIENSTAG', 'MITTWOCH', 'DONNERSTAG', 'FREITAG', 'SAMSTAG', 'SONNTAG']
        current_weekday_index = datetime.now().weekday()  # Monday is 0, Sunday is 6
        current_weekday = weekdays_german[current_weekday_index]

        if customer_shares_id is None:
            # NEW PURCHASE
            Share.get_by_id(db, share_id)

            # Check balance
            if customer_savings_book and (customer_savings_book.balance - invested_amount < 0):
                raise CustomerException("Not enough balance")

            conn = db.get_connection()
            cursor = conn.cursor()

            try:
                # The foreign key `besitzer_fk` refers to `kunden(stutengarten_id)`
                cursor.execute(
                    """INSERT INTO kundenaktien 
                       (besitzer_fk, aktie_fk, investierter_betrag, aktueller_wert, wochentage) 
                       VALUES (%s, %s, %s, %s, %s)""",
                    (customer_stutengarten_id, share_id, invested_amount,
                     invested_amount, current_weekday)
                )
                self.id = cursor.lastrowid
                self.customer_stutengarten_id = customer_stutengarten_id
                self.share_id = share_id
                self.invested_amount = invested_amount
                self.current_value = invested_amount
                self.current_weekday = current_weekday

                # Deduct amount from savings book
                if customer_savings_book:
                    cursor.execute(
                        "UPDATE kundensparbuecher SET saldo = saldo - %s WHERE kunden_fk = %s",
                        (invested_amount, customer_stutengarten_id)
                    )
                    customer_savings_book.balance -= invested_amount

                conn.commit()

            except Exception as err:
                conn.rollback()
                raise CustomerException(f"Error buying share: {err}") from err
            finally:
                cursor.close()
                conn.close()
        else:
            # LOAD FROM DB
            self.id = customer_shares_id
            self.customer_stutengarten_id = customer_stutengarten_id
            self.share_id = share_id
            self.invested_amount = invested_amount
            self.current_value = invested_amount
            self.current_weekday = current_weekday

    @staticmethod
    def get_all_customer_shares(db: DbConnector, stutengarten_id):
        """Returns all shares of a customer with profit/loss"""
        shares = []
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            query = """
            SELECT ka.*, 
                   a.name as aktien_name, 
                   a.symbol,
                   k.vorname, k.nachname, k.stutengarten_id
            FROM kundenaktien ka
            JOIN aktien a ON ka.aktie_fk = a.id
            JOIN kunden k ON ka.besitzer_fk = k.stutengarten_id
            WHERE k.stutengarten_id = %s
            ORDER BY ka.id DESC
            """
            cursor.execute(query, (stutengarten_id,))

            for row in cursor.fetchall():
                share = CustomerShares(
                    db,
                    share_id=row['aktie_fk'],
                    customer_stutengarten_id=row['stutengarten_id'],
                    invested_amount=row['investierter_betrag'],
                    customer_shares_id=row['id']
                )

                # Set current value from DB
                share.current_value = row['aktueller_wert']

                share.share_name = row['aktien_name']  # pylint: disable=attribute-defined-outside-init
                share.symbol = row['symbol']  # pylint: disable=attribute-defined-outside-init
                share.customer_name = f"{row['vorname']} {row['nachname']}"  # pylint: disable=attribute-defined-outside-init

                # Calculate profit/loss
                invested = float(share.invested_amount)
                current = float(share.current_value)
                share.profit_loss = current - invested  # pylint: disable=attribute-defined-outside-init
                share.profit_loss_percent = ((current / invested) - 1) * 100 if invested > 0 else 0  # pylint: disable=attribute-defined-outside-init

                shares.append(share)

            return shares
        finally:
            cursor.close()
            conn.close()

    def sell(self, customer_savings_book=None):
        """Sells share at current value"""
        conn = self.db.get_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            # Book current value to savings book
            if customer_savings_book:
                cursor.execute(
                    "UPDATE kundensparbuecher SET saldo = saldo + %s WHERE kunden_fk = %s",
                    (self.current_value, self.customer_stutengarten_id)
                )
                customer_savings_book.balance += self.current_value

            cursor.execute("DELETE FROM kundenaktien WHERE id = %s", (self.id,))
            conn.commit()

            profit = float(self.current_value) - float(self.invested_amount)

            return {
                "status": "success",
                "share_id": self.id,
                "invested_amount": float(self.invested_amount),
                "sell_value": float(self.current_value),
                "profit": profit
            }

        except Exception as err:
            conn.rollback()
            raise CustomerException(f"Error selling share: {err}") from err
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def update_share_value(db: DbConnector, aktie_fk, new_value, stutengarten_id):
        """
        MANUAL: Updates share value after physical wheel of fortune
        
        Args:
            db: Database connector
            aktie_fk: ID of the Aktien-Symbol (from aktien table)
            new_value: New value based on wheel result
            stutengarten_id: Stutengarten ID for validation
        
        Returns:
            dict with update information
        """
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            # Get total old value
            cursor.execute(
                """SELECT SUM(aktueller_wert) as total_val, COUNT(id) as count_shares 
                   FROM kundenaktien
                   WHERE aktie_fk = %s AND besitzer_fk = %s""",
                (aktie_fk, stutengarten_id)
            )
            share = cursor.fetchone()

            if not share or share['total_val'] is None:
                raise CustomerException("Share not found for this customer")

            old_value = float(share['total_val'])

            # Minimum value: 0 Euro (total loss possible)
            if new_value < 0:
                new_value = 0

            # Update: proportionally update total
            if old_value > 0:
                factor = new_value / old_value
                cursor.execute(
                    """UPDATE kundenaktien 
                       SET aktueller_wert = aktueller_wert * %s 
                       WHERE aktie_fk = %s AND besitzer_fk = %s""",
                    (factor, aktie_fk, stutengarten_id)
                )
            else:
                count = share['count_shares']
                cursor.execute(
                    """UPDATE kundenaktien 
                       SET aktueller_wert = %s 
                       WHERE aktie_fk = %s AND besitzer_fk = %s""",
                    (new_value / count, aktie_fk, stutengarten_id)
                )

            if cursor.rowcount == 0:
                raise CustomerException("Could not update share")

            conn.commit()

            change = new_value - old_value
            change_percent = (change / old_value * 100) if old_value > 0 else 0

            return {
                "status": "success",
                "old_value": old_value,
                "new_value": new_value,
                "change": round(change, 2),
                "change_percent": round(change_percent, 2)
            }

        except Exception as err:
            conn.rollback()
            raise CustomerException(f"Error updating share: {err}") from err
        finally:
            cursor.close()
            conn.close()

    def to_dict(self):
        """Converts to dictionary"""
        result = {
            'id': self.id,
            'share_id': self.share_id,
            'invested_amount': float(self.invested_amount),
            'current_value': float(self.current_value),
            'customer_stutengarten_id': self.customer_stutengarten_id
        }

        if hasattr(self, 'share_name'):
            result['share_name'] = self.share_name
        if hasattr(self, 'symbol'):
            result['symbol'] = self.symbol
        if hasattr(self, 'profit_loss'):
            result['profit_loss'] = float(self.profit_loss)
            result['profit_loss_percent'] = round(float(self.profit_loss_percent), 2)

        return result

    # Old getter methods for compatibility
    def get_id(self):
        """Returns share ID"""
        return self.id

    def get_customer_stutengarten_id(self):
        """Returns customer stutengarten ID"""
        return self.customer_stutengarten_id

    def get_value(self):
        """Returns current share value"""
        return float(self.current_value)

#End-of-file
