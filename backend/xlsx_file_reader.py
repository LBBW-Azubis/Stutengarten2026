"""import pandas for xlsx reading"""
import pandas as pd

def read_xlsx(file):
    """
    reads xlsx files and returns a list of dictionarys
    """
    df = pd.read_excel(file)

    data = df.to_dict(orient="records")
    return data
# End of file