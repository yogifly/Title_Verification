from google import genai
from dotenv import load_dotenv
import os

# Load environment variables from the .env file
load_dotenv()

# Get the API key from the environment variable
api_key = os.getenv("GOOGLE_API_KEY")

if api_key is None:
    print("API key is missing. Please set the GOOGLE_API_KEY in your .env file.")
else:
    # Initialize the GenAI client with your API key
    client = genai.Client(api_key=api_key)

    # Call the model to generate content based on your prompt
    response = client.models.generate_content(
        model="gemini-2.0-flash",  # Replace with the correct model name
        contents="Essay on Ai"
    )

    # Print the generated content
    print(response.text)
