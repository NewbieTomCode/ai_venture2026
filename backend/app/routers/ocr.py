import os
from google.cloud import vision

def extract_paragraphs(image_path):
    """Detects document features (paragraphs) in a local image."""
    client = vision.ImageAnnotatorClient()

    with open(image_path, "rb") as image_file:
        content = image_file.read()

    image = vision.Image(content=content)

    # Use document_text_detection for dense text/paragraphs
    response = client.document_text_detection(image=image)
    annotation = response.full_text_annotation

    print(f"--- Extracting Text from: {image_path} ---\n")

    for page in annotation.pages:
        for block in page.blocks:
            for paragraph in block.paragraphs:
                para_text = ""
                for word in paragraph.words:
                    word_text = "".join([symbol.text for symbol in word.symbols])
                    para_text += word_text + " "
                
                # Print the completed paragraph with a double newline
                print(f"{para_text.strip()}\n")

    if response.error.message:
        raise Exception(f"API Error: {response.error.message}")

# To run the script:
# 1. Ensure you've run: gcloud auth application-default login
# 2. Update the filename below

if __name__ == "__main__":
    test_image = "antanddove.jpg" # Ensure this file is in the same folder as your script
    
    if not os.path.exists(test_image):
        print(f"❌ Error: Could not find the file '{test_image}'")
    else:
        try:
            print("🚀 Connecting to Google Cloud Vision API...")
            extract_paragraphs(test_image)
            print("✅ Success!")
        except Exception as e:
            print(f"❌ An error occurred:\n{e}")