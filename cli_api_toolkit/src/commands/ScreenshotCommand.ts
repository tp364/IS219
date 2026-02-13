import { BaseCommand } from '../core/BaseCommand';
import { ICommandSchema, ICommandResult } from '../types/index';
import ScreenshotService from '../services/ScreenshotService';
import { GeminiService } from '../services/GeminiService';
import { FileService } from '../services/FileService';

/**
 * ScreenshotCommand
 *
 * Usage:
 *   npm run dev screenshot-feedback <url> "Optional design feedback prompt"
 */
export class ScreenshotCommand extends BaseCommand {
  getSchema(): ICommandSchema {
    return {
      name: 'screenshot-feedback',
      description: 'Capture website screenshot and get design feedback from Gemini',
      longDescription: 'Capture a full-page screenshot of a URL and send it to Gemini for UX/design feedback. Results are saved to references/ai_feedback.',
      category: 'Analysis',
      parameters: [
        this.createParameter({ name: 'url', type: 'string', description: 'The URL to capture', required: true, example: 'https://example.com' }),
        this.createParameter({ name: '--prompt', type: 'string', description: 'Optional analysis prompt for Gemini', required: false, default: 'Provide feedback on the visual design and usability of this page.' }),
      ],
      examples: ['screenshot-feedback https://example.com', 'screenshot-feedback https://example.com --prompt "Assess layout and color use"'],
    };
  }

  async execute(args: Record<string, unknown>): Promise<ICommandResult> {
    try {
      const url = args.url as string;
      const prompt = (args['--prompt'] as string) || 'Provide feedback on the visual design and usability of this page.';

      const fileService = new FileService();
      const screenshotService = new ScreenshotService();
      const gemini = new GeminiService();

      if (!url || url.trim().length === 0) {
        return this.failure('URL parameter is required');
      }

      this.success();

      console.log(`\n📸 Capturing screenshot for: ${url}`);
      const imagePath = await screenshotService.capture(url, { fullPage: true });
      console.log(`✓ Screenshot saved: ${imagePath}`);

      console.log('🔎 Sending screenshot to Gemini for analysis...');
      const analysis = await gemini.analyzeImage(imagePath, prompt);

      console.log('\n=== Gemini Analysis ===\n');
      console.log(analysis);

      // Save the analysis
      const filename = `screenshot_analysis_${new Date().toISOString().split('T')[0]}.md`;
      const savedPath = fileService.saveAiFeedback(filename, analysis);
      console.log(`\n✓ Analysis saved to: ${savedPath}`);

      return this.success({ imagePath, analysisPath: savedPath });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return this.failure(`Screenshot feedback failed: ${message}`);
    }
  }
}

export default ScreenshotCommand;
