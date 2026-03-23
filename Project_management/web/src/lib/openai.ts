import OpenAI from "openai";

import { DEFAULT_OPENAI_MODEL } from "@/config/chat";

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY. Add it to .env.local.");
  }

  return new OpenAI({ apiKey });
}

export function getOpenAIModel() {
  return process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL;
}
