import { BaseCommand } from '../core/BaseCommand';
import { ICommandSchema, ICommandResult } from '../types/index';
import { GeminiService } from '../services/GeminiService';
import { FileService } from '../services/FileService';
import * as path from 'path';

/**
 * AnalyzeMediaCommand
 * 
 * Analyzes images and videos using Gemini 3 multimodal capabilities.
 * Saves AI feedback to the ai_feedback subfolder in references.
 * Follows SOLID: Single Responsibility & Dependency Inversion Principles
 */

export class AnalyzeMediaCommand extends BaseCommand {
  private geminiService?: GeminiService;
  private fileService?: FileService;

  constructor(geminiService?: GeminiService, fileService?: FileService) {
    super();
    // Defer creating services until execute to avoid requiring API keys at CLI startup
    this.geminiService = geminiService;
    this.fileService = fileService;
  }

  /**
   * Get command schema for AI agent introspection
   */
  getSchema(): ICommandSchema {
    return {
      name: 'analyze-media',
      description: 'Analyze images and videos using Gemini 3 multimodal AI',
      longDescription:
        'Analyzes media files (images or videos) using Google Gemini 3 AI. ' +
        'You can provide a custom analysis prompt or use the default detailed analysis. ' +
        'Results are automatically saved to the references/ai_feedback directory.',
      category: 'Analysis',
      parameters: [
        this.createParameter({
          name: 'file',
          type: 'string',
          description: 'Path to image or video file to analyze',
          required: true,
          example: '/path/to/image.jpg',
        }),
        this.createParameter({
          name: '--prompt',
          type: 'string',
          description: 'Custom analysis prompt',
          required: false,
          default: 'Analyze this media in detail. Describe what you see, identify objects, text, and provide insights.',
          example: 'Identify all text visible in this image',
        }),
      ],
      examples: [
        'analyze-media /path/to/image.jpg',
        'analyze-media /path/to/image.jpg --prompt "Identify all text"',
        'analyze-media /path/to/video.mp4',
      ],
    };
  }

  /**
   * Execute media analysis
   */
  async execute(args: Record<string, unknown>): Promise<ICommandResult> {
    try {
      const filePath = args.file as string;
      const promptText = (args['--prompt'] as string) ||
        'Analyze this image in detail. Describe what you see, identify objects, text, and provide insights.';

      // Lazy-init services
      if (!this.geminiService) this.geminiService = new GeminiService();
      if (!this.fileService) this.fileService = new FileService();

      // Validate file path
      if (!filePath || filePath.trim().length === 0) {
        return this.failure('File path cannot be empty');
      }

      // Validate file exists
      if (!this.fileService!.fileExists(filePath)) {
        return this.failure(`File not found: ${filePath}`);
      }

      // Validate file type
      const ext = path.extname(filePath).toLowerCase();
      const supportedFormats = this.geminiService!.getSupportedFormats();
      const isSupported =
        supportedFormats.images.includes(ext) ||
        supportedFormats.videos.includes(ext);

      if (!isSupported) {
        const supported = [...supportedFormats.images, ...supportedFormats.videos].join(', ');
        return this.failure(`Unsupported file type: ${ext}. Supported: ${supported}`);
      }


      const fileType = supportedFormats.images.includes(ext) ? 'image' : 'video';

      // Lazy-init services
      if (!this.geminiService) this.geminiService = new GeminiService();
      if (!this.fileService) this.fileService = new FileService();

      console.log(`\n🔍 Analyzing ${fileType}: "${filePath}"`);
      console.log(`📝 Prompt: "${promptText}"\n`);

      let analysis: string;

      if (fileType === 'image') {
        analysis = await this.geminiService.analyzeImage(filePath, promptText);
      } else {
        analysis = await this.geminiService.analyzeImage(filePath, promptText);
      }

      // Display result
      console.log('─'.repeat(50));
      console.log(analysis);
      console.log('─'.repeat(50));

      // Save to ai_feedback folder
      const baseFilename = path.basename(filePath);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const outputFilename = `analysis_${baseFilename}_${timestamp}.md`;

      const filepath = this.fileService.saveAiFeedback(outputFilename, analysis);
      console.log(`\n✓ Analysis saved to: ${filepath}`);

      return this.success({ filePath, analysisLength: analysis.length });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      return this.failure(`Media analysis failed: ${message}`);
    }
  }
}

export default AnalyzeMediaCommand;
