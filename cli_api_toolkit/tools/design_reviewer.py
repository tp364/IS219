import os
import asyncio
from playwright.async_api import async_playwright
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

async def capture_screenshot(url: str, filename: str):
    os.makedirs("assets/screenshots", exist_ok=True)
    path = f"assets/screenshots/{filename}.png"

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto(url)
        await page.screenshot(path=path, full_page=True)
        await browser.close()

    return path
def review_design(image_path: str):
    model = genai.GenerativeModel("gemini-1.5-pro")

    with open(image_path, "rb") as img:
        image_bytes = img.read()

    response = model.generate_content([
        "Provide professional UX/UI feedback for this website design.",
        {"mime_type": "image/png", "data": image_bytes}
    ])

    return response.text
async def analyze_website(url: str, filename: str):
    screenshot_path = await capture_screenshot(url, filename)
    feedback = review_design(screenshot_path)

    report_file = f"assets/screenshots/{filename}_review.txt"
    with open(report_file, "w", encoding="utf-8") as f:
        f.write(feedback)

    print(f"Design review saved to {report_file}")
