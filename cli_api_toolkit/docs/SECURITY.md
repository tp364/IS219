**Security and API Keys**

- **Never commit real API keys.** Use `.env` locally and add it to `.gitignore`.
- This repository includes `.env.example` as a template for required variables.
- If you previously added keys to the repo, remove them and rotate the credentials.

Getting API keys:

- OpenAI: Create an account at https://platform.openai.com and create an API key under "View API keys".
- Google/Gemini: Use Google Cloud Console to create API credentials. For prototype usage you can create a simple API key and restrict it later.

Local setup:

1. Copy the template:

```bash
cp .env.example .env
```

2. Edit `.env` and paste your keys locally (do not commit).

3. To run the Playwright screenshot tool you must install Playwright and browsers:

```bash
npm install
npx playwright install
```

Notes:

- The project's `.env` file contained sensitive keys and they were removed; please set your own keys.
- If you share this repo, be sure `.env` remains excluded and rotate any keys that were exposed.
