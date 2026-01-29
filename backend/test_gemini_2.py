import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

try:
    genai.configure(api_key=api_key)
    # Trying the alias which usually points to the stable free model
    print("Attempting generation with gemini-flash-latest...")
    model = genai.GenerativeModel('gemini-flash-latest')
    response = model.generate_content("Hello")
    print(f"Success! Response: {response.text}")

except Exception as e:
    print(f"Error: {e}")
