import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

/**
 * ScreenshotService
 *
 * Captures screenshots of web pages using Playwright and saves them to the
 * project's images directory. Lightweight wrapper intended for CLI usage.
 */
export class ScreenshotService {
  private imagesDir: string;

  constructor() {
    this.imagesDir = path.join(process.cwd(), 'images');
    this.ensureImagesDirectory();
  }

  private ensureImagesDirectory(): void {
    if (!fs.existsSync(this.imagesDir)) {
      fs.mkdirSync(this.imagesDir, { recursive: true });
      console.log(`✓ Created images directory: ${this.imagesDir}`);
    }
  }

  /**
   * Capture a screenshot for the given URL and return the saved file path.
   */
  async capture(url: string, options?: { fullPage?: boolean; width?: number; height?: number; filename?: string }): Promise<string> {
    const browser = await chromium.launch({ headless: true });
    try {
      const context = await browser.newContext({ viewport: { width: options?.width || 1280, height: options?.height || 800 } });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: 'networkidle' });

      const timestamp = new Date().toISOString().replace(/[-T:]/g, '').slice(0, 14);
      const safeName = (options?.filename || url).replace(/[^a-z0-9]/gi, '_').slice(0, 40);
      const filename = `screenshot_${safeName}_${timestamp}.png`;
      const filePath = path.join(this.imagesDir, filename);

      await page.screenshot({ path: filePath, fullPage: !!options?.fullPage });

      await context.close();
      return filePath;
    } finally {
      await browser.close();
    }
  }

  getImagesDirectory(): string {
    return this.imagesDir;
  }
}

export default ScreenshotService;
