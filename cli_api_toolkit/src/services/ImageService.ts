import OpenAI from "openai";
import fs from "fs";
import path from "path";

// ImageService creates an OpenAI client only when needed to avoid throwing
// during module import if API keys are not present.

interface ImageGenerationOptions {
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "standard" | "hd";
  count?: number;
}

class ImageService {
  private imagesDir = process.cwd() + "/images";
  private client: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
    }

    this.ensureImagesDirectory();
  }

  /**
   * Ensure images directory exists
   */
  private ensureImagesDirectory(): void {
    if (!fs.existsSync(this.imagesDir)) {
      fs.mkdirSync(this.imagesDir, { recursive: true });
      console.log(`✓ Created images directory: ${this.imagesDir}`);
    }
  }

  /**
   * Generate images using DALL-E 3
   * @param prompt The image prompt
   * @param options Generation options
   * @returns Array of saved image file paths
   */
  async generateImages(
    prompt: string,
    options: ImageGenerationOptions = {}
  ): Promise<string[]> {
    const { size = "1024x1024", quality = "standard", count = 1 } = options;

    console.log(`\n🎨 Generating ${count} image(s) with DALL-E 3...`);
    console.log(`📝 Prompt: ${prompt}`);
    console.log(`📐 Size: ${size}`);

    const generatedFilePaths: string[] = [];

    try {
      for (let i = 0; i < count; i++) {
        if (!this.client) {
          throw new Error('OPENAI_API_KEY is not set. Please add it to your .env file.');
        }

        const response = await this.client.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          n: 1, // DALL-E 3 only supports n=1
          size: size as "1024x1024" | "1792x1024" | "1024x1792",
          quality: quality,
          response_format: "url", // Get URL to download image
        });

        if (response.data && response.data.length > 0) {
          const imageUrl = response.data[0].url;

          if (!imageUrl) {
            throw new Error("No image URL in response");
          }

          // Download image from URL
          const imageBuffer = await this.downloadImage(imageUrl);

          // Generate filename from prompt
          const filename = this.generateFilename(prompt, i, count);

          // Save image
          const filePath = path.join(this.imagesDir, filename);
          fs.writeFileSync(filePath, imageBuffer);

          generatedFilePaths.push(filePath);

          console.log(`✓ Image ${i + 1}/${count} saved: ${filename}`);
        }
      }

      return generatedFilePaths;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`❌ Error generating images: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Download image from URL
   * @param url Image URL
   * @returns Image buffer
   */
  private async downloadImage(url: string): Promise<Buffer> {
    const https = await import("https");

    return new Promise((resolve, reject) => {
      https
        .get(url, (response) => {
          const chunks: Buffer[] = [];

          response.on("data", (chunk: Buffer) => {
            chunks.push(chunk);
          });

          response.on("end", () => {
            resolve(Buffer.concat(chunks));
          });

          response.on("error", reject);
        })
        .on("error", reject);
    });
  }

  /**
   * Generate meaningful filename from prompt
   * @param prompt The image prompt
   * @param index Image index (for multiple generations)
   * @param total Total number of images
   * @returns Filename with timestamp
   */
  private generateFilename(prompt: string, index: number, total: number): string {
    // Sanitize prompt for filename
    let sanitized = prompt
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "") // Remove special characters
      .replace(/\s+/g, "_") // Replace spaces with underscores
      .slice(0, 50); // Limit length

    // Add index if multiple images
    const indexStr = total > 1 ? `_${index + 1}of${total}` : "";

    // Add timestamp for uniqueness
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:]/g, "")
      .slice(0, 14);

    return `image_${sanitized}${indexStr}_${timestamp}.png`;
  }

  /**
   * Get all generated images
   * @returns Array of image file paths
   */
  getGeneratedImages(): string[] {
    if (!fs.existsSync(this.imagesDir)) {
      return [];
    }

    return fs
      .readdirSync(this.imagesDir)
      .filter((file) => file.endsWith(".png"))
      .map((file) => path.join(this.imagesDir, file));
  }

  /**
   * Delete an image
   * @param filename Image filename
   */
  deleteImage(filename: string): void {
    const filePath = path.join(this.imagesDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✓ Deleted: ${filename}`);
    } else {
      console.warn(`⚠️ File not found: ${filename}`);
    }
  }

  /**
   * Get images directory path
   */
  getImagesDirectory(): string {
    return this.imagesDir;
  }

  /**
   * Get image count
   */
  getImageCount(): number {
    return this.getGeneratedImages().length;
  }
}

export default ImageService;
