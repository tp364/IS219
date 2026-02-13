import { BaseCommand } from '../core/BaseCommand';
import { ICommandSchema, ICommandResult } from '../types/index';
import ScreenshotService from '../services/ScreenshotService';
import ImageService from '../services/ImageService';

export class HealthCheckCommand extends BaseCommand {
  getSchema(): ICommandSchema {
    return {
      name: 'health-check',
      description: 'Run local environment checks (Playwright, images dir, env vars)',
      longDescription: 'Quickly verify that Playwright browsers are installed, images directory is writeable, and environment variables are set.',
      category: 'Utility',
      parameters: [],
      examples: ['health-check'],
    };
  }

  async execute(_args: Record<string, unknown>): Promise<ICommandResult> {
    const results: Record<string, string> = {};

    // Check env vars
    results.OPENAI_API_KEY = process.env.OPENAI_API_KEY ? 'OK' : 'MISSING';
    results.GEMINI_API_KEY = process.env.GEMINI_API_KEY ? 'OK' : 'MISSING';

    // Check images directory via ImageService
    try {
      const img = new ImageService();
      results.imagesDir = `OK (${img.getImagesDirectory()})`;
    } catch (err) {
      results.imagesDir = `ERROR: ${err instanceof Error ? err.message : String(err)}`;
    }

    // Check Playwright by creating ScreenshotService and launching browser
    try {
      new ScreenshotService();
      results.playwright = 'OK';
    } catch (err) {
      results.playwright = `ERROR: ${err instanceof Error ? err.message : String(err)}`;
    }

    return this.success(results);
  }
}

export default HealthCheckCommand;
