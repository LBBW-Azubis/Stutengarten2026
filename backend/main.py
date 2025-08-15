"""
flask endpoint to read an uploaded XLSX file using the helper
library `xlsx_file_reader`.
"""
from flask import Flask, request, jsonify
import xlsx_file_reader

app = Flask(__name__)


@app.route("/read_xlsx_file", methods=["POST"])
def read_xlsx_file():
    """
    expects a multipart/form-data POST with the field name "file".
    xlsx_file_reader.read_xlsx processes the file.

    Returns:
      - 200 JSON {"status": "success", "data": ...} on success
      - 400 JSON {"error": "No file uploaded"} when no file was sent
      - 500 JSON {"status": "error", "message": "..."} on unexpected errors
    """
    try:
        file = request.files.get("file")
        if not file:
            return jsonify({"error": "No file uploaded"}), 400

        data = xlsx_file_reader.read_xlsx(file)
        return jsonify({"status": "success", "data": data})
    
    except Exception as exc:  # pylint: disable=broad-except
        return jsonify({"status": "error", "message": str(exc)}), 500


if __name__ == "__main__":
    app.run(debug=True)

# End of file