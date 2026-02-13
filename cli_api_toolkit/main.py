import argparse
import asyncio
from tools.web_research import research_topic
from tools.image_generator import generate_image
from tools.design_reviewer import analyze_website

def main():
    parser = argparse.ArgumentParser(description="Agentic Orchestration Toolkit")
    subparsers = parser.add_subparsers(dest="command")

    # Research
    research_parser = subparsers.add_parser("research")
    research_parser.add_argument("topic")

    # Image
    image_parser = subparsers.add_parser("image")
    image_parser.add_argument("prompt")
    image_parser.add_argument("filename")

    # Review
    review_parser = subparsers.add_parser("review")
    review_parser.add_argument("url")
    review_parser.add_argument("filename")

    args = parser.parse_args()

    if args.command == "research":
        research_topic(args.topic)

    elif args.command == "image":
        generate_image(args.prompt, args.filename)

    elif args.command == "review":
        asyncio.run(analyze_website(args.url, args.filename))

if __name__ == "__main__":
    main()
