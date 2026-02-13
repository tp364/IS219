import { BaseCommand } from '../core/BaseCommand';
import { ICommandSchema, ICommandResult } from '../types/index';
import ImageService from '../services/ImageService';

/**
 * ImageGeneratorCommand
 * 
 * Implements image generation using DALL-E 3
 * Follows SOLID: Single Responsibility & Dependency Inversion Principles
 */

export class ImageGeneratorCommand extends BaseCommand {
  private imageService: ImageService;

  constructor(imageService?: ImageService) {
    super();
    this.imageService = imageService || new ImageService();
  }

  /**
   * Get command schema for AI agent introspection
   */
  getSchema(): ICommandSchema {
    return {
      name: 'generate-image',
      description: 'Generate images using DALL-E 3',
      longDescription:
        'Generates one or more images based on a text prompt using OpenAI DALL-E 3. ' +
        'Images are automatically saved to the images directory.',
      category: 'Generation',
      parameters: [
        this.createParameter({
          name: 'prompt',
          type: 'string',
          description: 'The image description prompt',
          required: true,
          example: 'A serene mountain landscape at sunset',
        }),
        this.createParameter({
          name: '--size',
          type: 'string',
          description: 'Image size',
          required: false,
          default: '1024x1024',
          choices: ['1024x1024', '1792x1024', '1024x1792'],
        }),
        this.createParameter({
          name: '--quality',
          type: 'string',
          description: 'Image quality level',
          required: false,
          default: 'standard',
          choices: ['standard', 'hd'],
        }),
        this.createParameter({
          name: '--count',
          type: 'number',
          description: 'Number of images to generate (1-10)',
          required: false,
          default: 1,
        }),
      ],
      examples: [
        'generate-image "a futuristic city"',
        'generate-image "mountain landscape" --size 1792x1024 --quality hd',
        'generate-image "abstract art" --count 3',
      ],
    };
  }

  /**
   * Execute image generation
   */
  async execute(args: Record<string, unknown>): Promise<ICommandResult> {
    try {
      const prompt = args.prompt as string;
      const size = (args['--size'] || '1024x1024') as '1024x1024' | '1792x1024' | '1024x1792';
      const quality = (args['--quality'] || 'standard') as 'standard' | 'hd';
      let count = (args['--count'] as number) || 1;

      // Validate parameters
      if (!prompt || prompt.trim().length === 0) {
        return this.failure('Image prompt cannot be empty');
      }

      if (count < 1 || count > 10) {
        return this.failure('Count must be between 1 and 10');
      }

      count = Math.floor(count);

      console.log('\n🎨 Image Generation');
      console.log('═'.repeat(50));

      const generatedImages = await this.imageService.generateImages(prompt, {
        size,
        quality,
        count,
      });

      console.log(`\n✓ Successfully generated ${generatedImages.length} image(s)!`);
      console.log('\n📁 Saved to:');
      generatedImages.forEach((imagePath) => {
        const filename = imagePath.split('\\').pop() || imagePath;
        console.log(`   ✓ ${filename}`);
      });

      console.log(`\n📂 Images directory: ${this.imageService.getImagesDirectory()}`);
      console.log(`📊 Total images stored: ${this.imageService.getImageCount()}`);

      return this.success({
        generatedCount: generatedImages.length,
        imagePaths: generatedImages,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      return this.failure(`Image generation failed: ${message}`);
    }
  }
}

export default ImageGeneratorCommand;
