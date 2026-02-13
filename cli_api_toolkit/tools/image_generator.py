import os
import base64
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI()

def generate_image(prompt: str, filename: str):
    result = client.images.generate(
        model="gpt-image-1",
        prompt=prompt,
        size="1024x1024"
    )

    image_base64 = result.data[0].b64_json
    image_bytes = base64.b64decode(image_base64)

    os.makedirs("assets/images", exist_ok=True)
    filepath = f"assets/images/{filename}.png"

    with open(filepath, "wb") as f:
        f.write(image_bytes)

    print(f"Image saved to {filepath}")
