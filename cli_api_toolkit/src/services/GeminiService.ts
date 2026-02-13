import OpenAI from 'openai';
import { FileService } from './FileService';
import { config } from 'dotenv';

config();

/**
 * GeminiService
 * 
 * Handles Gemini 3 API interactions for multimodal analysis.
 * Supports image and video file uploads and analysis.
 * Follows SOLID: Single Responsibility Principle
 */

export class GeminiService {
  private client: OpenAI;
  private model: string;
  private fileService: FileService;

  constructor() {
    // Prefer a dedicated Gemini key, fall back to OpenAI key if necessary
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY or OPENAI_API_KEY is not set. Please add it to your .env file.'
      );
    }

    this.client = new OpenAI({ apiKey });
    // Allow overriding the Gemini model via GEMINI_MODEL env var
    this.model = process.env.GEMINI_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    this.fileService = new FileService();
  }

  /**
   * Analyze an image file
   */
  async analyzeImage(imagePath: string, prompt: string): Promise<string> {
    try {
      if (!this.fileService.fileExists(imagePath)) {
        throw new Error(`Image file not found: ${imagePath}`);
      }

      const mimeType = this.fileService.getMimeType(imagePath);
      const imageData = this.fileService.readFileAsBase64(imagePath);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${imageData}`,
                },
              },
            ],
          },
        ],
        max_tokens: 2048,
      });

      return response.choices[0].message.content || 'No analysis generated';
    } catch (error) {
      throw new Error(
        `Image analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Analyze multiple images
   */
  async analyzeMultipleImages(
    imagePaths: string[],
    prompt: string
  ): Promise<string> {
    try {
      const content: any[] = [
        {
          type: 'text',
          text: prompt,
        },
      ];

      for (const imagePath of imagePaths) {
        if (!this.fileService.fileExists(imagePath)) {
          throw new Error(`Image file not found: ${imagePath}`);
        }

        const mimeType = this.fileService.getMimeType(imagePath);
        const imageData = this.fileService.readFileAsBase64(imagePath);

        content.push({
          type: 'image_url',
          image_url: {
            url: `data:${mimeType};base64,${imageData}`,
          },
        });
      }

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content,
          },
        ],
        max_tokens: 2048,
      });

      return response.choices[0].message.content || 'No analysis generated';
    } catch (error) {
      throw new Error(
        `Multiple image analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generic chat completion for text-based queries
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
        `Chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get supported file formats
   */
  getSupportedFormats(): {
    images: string[];
    videos: string[];
  } {
    return {
      images: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      videos: ['.mp4', '.avi', '.mov', '.mkv', '.webm'],
    };
  }
}
