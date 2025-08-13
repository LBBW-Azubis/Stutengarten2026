"""Import of MySQL"""
import mysql.connector


class DbConnector:
    """Class for connecting the database"""
    def __init__(self):
        self.connection = None


    def connect(self, host, user, password, database):
        """Function to connect to the database"""    

        try:
            self.connection = mysql.connector.connect(
                host = host,
                user = user,
                password = password,
                database = database
            )
        except mysql.connector.Errror as e:
            print("Error connecting to database", e)

    def get_connection(self):
        """Function to get the connection to the database"""
        return self.connection
    # End of file
