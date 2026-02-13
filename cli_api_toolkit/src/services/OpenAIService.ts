import OpenAI from 'openai';
import { config } from 'dotenv';

config();

/**
 * OpenAIService
 * 
 * Encapsulates all OpenAI API interactions.
 * Follows SOLID: Single Responsibility Principle
 */

export class OpenAIService {
  private client: OpenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        'OPENAI_API_KEY is not set. Please add it to your .env file.'
      );
    }

    this.client = new OpenAI({ apiKey });
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  /**
   * Perform a web search using OpenAI's function calling
   */
  async webSearch(query: string): Promise<string> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content: `Search the web and provide comprehensive information about: ${query}`,
      },
    ];

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: 2048,
      });

      return (
        response.choices[0].message.content || 'Unable to process search request.'
      );
    } catch (error) {
      throw new Error(
        `OpenAI API Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generic chat completion method for extensibility
   */
  async chat(messages: OpenAI.Chat.ChatCompletionMessageParam[]): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: 2048,
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      throw new Error(
        `OpenAI API Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
