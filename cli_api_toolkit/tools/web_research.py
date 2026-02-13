import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI()

def research_topic(topic: str, output_file: str = "research.md"):
    response = client.responses.create(
        model="gpt-4.1",
        tools=[{"type": "web_search"}],
        input=f"Conduct detailed research on: {topic}. Include citations."
    )

    content = response.output_text

    with open(output_file, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"Research saved to {output_file}")
