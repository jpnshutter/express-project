from PyPDF2 import PdfWriter, PdfReader
from PyPDF2.generic import NameObject, DictionaryObject, ArrayObject, TextStringObject

# Create a simple PDF with embedded JavaScript
def create_pdf_with_js(output_filename):
    # Initialize a PDF writer
    pdf_writer = PdfWriter()

    # Add a blank page (minimal content)
    pdf_writer.add_blank_page(width=612, height=792)  # Standard US Letter size in points

    # Define the JavaScript code
    js_code = """
    app.alert("Hello from JavaScript!");
    """

    # Create a JavaScript action object
    js_action = DictionaryObject()
    js_action.update({
        NameObject("/Type"): NameObject("/Action"),
        NameObject("/S"): NameObject("/JavaScript"),  # Specify this is a JavaScript action
        NameObject("/JS"): TextStringObject(js_code)  # The JS code itself
    })

    # Create an OpenAction to run the JavaScript when the PDF is opened
    open_action = ArrayObject([NameObject("/OpenAction"), js_action])

    # Attach the action to the PDF's catalog
    pdf_writer._root_object.update({
        NameObject("/OpenAction"): js_action
    })

    # Write the PDF to a file
    with open(output_filename, "wb") as output_file:
        pdf_writer.write(output_file)

    print(f"PDF created as '{output_filename}' with embedded JavaScript.")

# Run the function
if __name__ == "__main__":
    create_pdf_with_js("example_with_js.pdf")