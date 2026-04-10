"""import pandas for xlsx reading"""
import pandas as pd

class XlsxFileReader:
    """class to read xlsx files"""

    def read(self, file):
        """
        reads xlsx files and returns a list of dictionarys
        """
        stream = getattr(file, "stream", file)
        if hasattr(stream, "seek"):
            stream.seek(0)

        try:
            df = pd.read_excel(stream, engine="openpyxl")
        except ValueError:
            if hasattr(stream, "seek"):
                stream.seek(0)
            df = pd.read_excel(stream)

        return df.to_dict(orient="records")
# End of file
