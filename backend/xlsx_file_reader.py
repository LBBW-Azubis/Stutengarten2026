"""import pandas for xlsx reading"""
import pandas as pd

class XlsxFileReader:
    """class to read xlsx files"""

    def read(self, file):
        """
        reads xlsx files and returns a list of dictionarys
        """
        df = pd.read_excel(file)
        return df.to_dict(orient="records")
# End of file