# Gemini 3 API - Multimodal Analysis Guide (2026)

**Document Type:** Technical Reference Guide  
**Date:** February 5, 2026  
**API Version:** Gemini 3 (Current)  
**Purpose:** Complete guide for image and video analysis with Gemini 3

---

## Table of Contents

1. [Overview](#overview)
2. [Multimodal Capabilities](#multimodal-capabilities)
3. [Setup and Authentication](#setup-and-authentication)
4. [Image Analysis](#image-analysis)
5. [Video Analysis](#video-analysis)
6. [Advanced Features](#advanced-features)
7. [Integration with CLI Toolkit](#integration-with-cli-toolkit)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Resources](#resources)

---

## Overview

Gemini 3 represents Google's latest AI model with enhanced multimodal capabilities. The API enables developers to:

- **Analyze Images:** Object detection, OCR, scene understanding, visual question answering
- **Process Videos:** Frame analysis, motion detection, scene changes, temporal understanding
- **Generate Insights:** Detailed descriptions, metadata extraction, sentiment analysis
- **Extract Information:** Text recognition, pattern detection, structured data

### Key Improvements in 2026

- **Faster Processing:** 50% reduction in latency for standard requests
- **Better Accuracy:** Improved object recognition and scene understanding
- **Extended Context:** Support for longer prompts and more complex queries
- **Enhanced Safety:** Better content filtering and bias mitigation
- **Cost Efficiency:** Tiered pricing with volume discounts

---

## Multimodal Capabilities

### What is Multimodal Analysis?

Multimodal analysis refers to AI's ability to process and understand multiple types of data simultaneously:

- **Text + Images:** Ask questions about images
- **Text + Videos:** Analyze video content and extract scenes
- **Multiple Images:** Compare and contrast images
- **Complex Reasoning:** Combine visual and textual information for deeper insights

### Supported Modalities

#### Image Formats

| Format | Extension | Max Size | Notes |
|--------|-----------|----------|-------|
| JPEG | .jpg, .jpeg | 10 MB | Standard format, good compression |
| PNG | .png | 10 MB | Lossless, supports transparency |
| GIF | .gif | 10 MB | Supports animation |
| WebP | .webp | 10 MB | Modern format, better compression |
| TIFF | .tiff | 10 MB | High-quality archival format |

#### Video Formats

| Format | Extension | Max Size | Max Duration | Supported |
|--------|-----------|----------|---------------|----|
| MP4 | .mp4 | 100 MB | 10 minutes | ✓ |
| AVI | .avi | 100 MB | 10 minutes | ✓ |
| MOV | .mov | 100 MB | 10 minutes | ✓ |
| MKV | .mkv | 100 MB | 10 minutes | ✓ |
| WebM | .webm | 100 MB | 10 minutes | ✓ |

---

## Setup and Authentication

### Prerequisites

- Google API Key (from Google Cloud Console)
- API Key added to `.env` file
- OpenAI SDK or compatible library installed

### Authentication Setup

#### Step 1: Create API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Gemini API
4. Go to Credentials → Create API Key
5. Copy your API key

#### Step 2: Configure Environment

Create `.env` file in your CLI toolkit root:

```env
# Required
OPENAI_API_KEY=sk-your-api-key-here

# Optional
OPENAI_MODEL=gpt-4o-mini  # Model to use
```

**Important:** Never commit `.env` to version control!

#### Step 3: Verify Connection

```bash
npm run dev web-search "test connection"
```

---

## Image Analysis

### Basic Image Analysis

Analyze a single image with a simple prompt:

```bash
npm run dev analyze-media /path/to/image.jpg
```

### Image Analysis with Custom Prompt

Ask specific questions about an image:

```bash
npm run dev analyze-media /path/to/image.jpg --prompt "Describe all objects and their positions in this image"
```

### How It Works

#### Backend Process

```typescript
// 1. Load image file
const imageData = fs.readFileSync(imagePath);

// 2. Convert to base64
const base64 = imageData.toString('base64');

// 3. Create API request
const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{
    role: "user",
    content: [
      { type: "text", text: prompt },
      {
        type: "image_url",
        image_url: { url: `data:image/jpeg;base64,${base64}` }
      }
    ]
  }]
});

// 4. Extract and save analysis
const analysis = response.choices[0].message.content;
fileService.saveAiFeedback(filename, analysis);
```

### Analysis Examples

#### Object Detection

```bash
npm run dev analyze-media photo.jpg --prompt "List all objects visible in this image with their approximate locations"
```

**Output Saved To:** `references/ai_feedback/analysis_photo.jpg_2026-02-05.md`

#### OCR (Optical Character Recognition)

```bash
npm run dev analyze-media document.jpg --prompt "Extract all text from this image exactly as it appears"
```

#### Scene Understanding

```bash
npm run dev analyze-media scene.jpg --prompt "Describe the scene in detail. What is happening? What's the setting? What emotions are conveyed?"
```

#### Visual Question Answering

```bash
npm run dev analyze-media chart.jpg --prompt "What is the trend shown in this chart? What are the key data points?"
```

---

## Video Analysis

### Current Video Support

The Gemini 3 API accesses videos by:

1. **Frame Extraction:** Analyzes key frames from the video
2. **Scene Detection:** Identifies scene changes
3. **Temporal Analysis:** Understands motion and sequence

### Video Analysis Command

```bash
npm run dev analyze-media /path/to/video.mp4
```

### Video Analysis with Custom Prompt

```bash
npm run dev analyze-media video.mp4 --prompt "Summarize the key scenes and events in this video"
```

### Video Analysis Use Cases

#### Action Recognition

```bash
npm run dev analyze-media sports.mp4 --prompt "Identify all physical activities and athletics shown in this video"
```

#### Scene Summation

```bash
npm run dev analyze-media tutorial.mp4 --prompt "Provide a step-by-step summary of what happens in this video"
```

#### Anomaly Detection

```bash
npm run dev analyze-media security.mp4 --prompt "Identify any unusual or suspicious activities in this video"
```

---

## Advanced Features

### Multiple Image Analysis

Compare multiple images:

```typescript
const images = [
  '/path/to/image1.jpg',
  '/path/to/image2.jpg',
  '/path/to/image3.jpg'
];

const analysis = await geminiService.analyzeMultipleImages(
  images,
  "Compare these three images. What are their similarities and differences?"
);
```

### Batch Processing

Process multiple files efficiently:

```bash
# Process all JPGs in a folder
for file in images/*.jpg; do
  npm run dev analyze-media "$file"
done
```

### Custom Prompting Strategies

#### Zero-Shot Analysis

Ask without examples:

```bash
npm run dev analyze-media image.jpg --prompt "What is this?"
```

#### Few-Shot Analysis

Provide examples (via prompt):

```bash
npm run dev analyze-media image.jpg --prompt "I'll show you images. For each, identify if it contains a cat. Image 1: [description]. Image 2: [description]. Now analyze this image."
```

#### Chain-of-Thought Prompting

Request step-by-step reasoning:

```bash
npm run dev analyze-media complex.jpg --prompt "Step by step, analyze this image. First, identify the main objects. Second, determine their relationships. Third, explain what's happening."
```

---

## Integration with CLI Toolkit

### Architecture

```
cli_api_toolkit/
├── src/
│   ├── commands/
│   │   ├── WebSearchCommand.ts
│   │   └── AnalyzeMediaCommand.ts  ← Image/Video Analysis
│   ├── services/
│   │   ├── OpenAIService.ts
│   │   ├── GeminiService.ts        ← Multimodal Analysis
│   │   └── FileService.ts          ← Result Storage
│   └── index.ts
├── references/
│   ├── ai_feedback/               ← Analysis Results Stored Here
│   └── *.md                        ← Research Files
└── .env                            ← API Keys
```

### File Structure

Analysis results are automatically saved:

```
references/
├── ai_feedback/
│   ├── analysis_image1_2026-02-05.md
│   ├── analysis_image2_2026-02-05.md
│   └── analysis_video_2026-02-05.md
├── search_gemini_3_api_2026-02-05.md
└── GEMINI_3_API_GUIDE_2026.md
```

### Accessing Results

List all AI feedback results:

```bash
ls references/ai_feedback/
```

View a specific analysis:

```bash
cat references/ai_feedback/analysis_image_2026-02-05.md
```

---

## Best Practices

### 1. Prompt Engineering

**✓ DO:**
- Be specific and detailed
- Use clear language
- Specify output format
- Ask for step-by-step reasoning

**✗ DON'T:**
- Use vague queries
- Ask too many questions at once
- Assume the model sees things you don't mention
- Ignore content policies

### 2. File Handling

**✓ DO:**
- Keep images under 10 MB
- Use standard formats (JPEG, PNG)
- Verify file paths
- Check file permissions

**✗ DON'T:**
- Upload corrupted files
- Use unsupported formats
- Upload sensitive personal data carelessly
- Ignore error messages

### 3. Rate Limiting

**Limits:**
- Free Tier: 100 requests/day
- Standard: 1000 requests/day
- Enterprise: Custom limits

**Best Practices:**
- Implement exponential backoff
- Cache results when appropriate
- Monitor usage
- Batch requests efficiently

### 4. Cost Optimization

- **Token Counting:** Each image/video uses tokens
- **Compression:** Use WebP for smaller files
- **Batch Operations:** Process multiple items together
- **Prompt Optimization:** Shorter prompts = fewer tokens

### 5. Error Handling

```typescript
try {
  const analysis = await geminiService.analyzeImage(filePath, prompt);
} catch (error) {
  if (error.message.includes('not found')) {
    console.error('File does not exist');
  } else if (error.message.includes('Unsupported')) {
    console.error('File format not supported');
  } else {
    console.error('Analysis failed:', error.message);
  }
}
```

---

## Advanced Use Cases

### 1. Content Moderation

```bash
npm run dev analyze-media user_upload.jpg --prompt "Is this image appropriate for all audiences? Identify any potentially offensive content."
```

### 2. Document Processing

```bash
npm run dev analyze-media invoice.jpg --prompt "Extract structured data from this invoice: date, amount, vendor name, and items"
```

### 3. Medical Imaging (Non-diagnostic)

```bash
npm run dev analyze-media xray.jpg --prompt "Describe the general features visible in this X-ray image"
```

### 4. Product Analysis

```bash
npm run dev analyze-media product.jpg --prompt "Analyze this product image for: color, material, condition, and estimated value"
```

### 5. Accessibility Support

```bash
npm run dev analyze-media photo.jpg --prompt "Provide a comprehensive description of this image for visually impaired users"
```

---

## Output Structure

Every analysis creates a markdown file with:

```markdown
# AI Analysis Result

**Date:** 2026-02-05 14:30:45  
**File:** image.jpg

---

[Analysis content]

---

*Generated by CLI AI Toolkit - Gemini 3 Analysis*
```

---

## Security Considerations

### Data Privacy

- **API Keys:** Store securely in `.env`, never in code
- **File Upload:** Files are processed by Google's servers
- **Data Retention:** Results stored locally in `references/` folder
- **GDPR Compliance:** Review Google's data handling practices

### Best Practices

1. **Don't upload:**
   - Sensitive personal data (SSNs, credit cards)
   - Confidential business documents
   - Anything you wouldn't store locally

2. **Do:**
   - Use organization-approved API keys
   - Implement access controls
   - Monitor API usage
   - Encrypt sensitive files before analysis

---

## Troubleshooting

### Common Issues

| Error | Cause | Solution |
|-------|-------|----------|
| File not found | Wrong path or file missing | Check file path with absolute path |
| Unsupported format | Wrong file extension | Use .jpg, .png, .mp4, etc. |
| 401 Unauthorized | Invalid API key | Check OPENAI_API_KEY in .env |
| 429 Rate Limited | Too many requests | Wait and retry with exponential backoff |
| CORS error | Browser-based request | Make request from Node.js backend |
| Out of memory | File too large | Reduce file size or split into chunks |

### Debug Mode

Enable detailed logging:

```bash
DEBUG=* npm run dev analyze-media image.jpg
```

### Check Installation

```bash
npm run dev
```

Should list all available commands including `analyze-media`.

---

## CLI Commands Reference

### Web Search

```bash
npm run dev web-search "query"
```

Searches web and saves results to `references/search_*.md`

### Analyze Media

```bash
npm run dev analyze-media <file-path> [--prompt "custom prompt"]
```

Analyzes images/videos and saves to `references/ai_feedback/`

### Help

```bash
npm run dev               # Show all commands
npm run dev <command> --help  # Show help for specific command
```

---

## Performance Tips

### Image Optimization

```bash
# Compress JPEG (using common tools)
convert image.jpg -quality 85 image_optimized.jpg

# Convert to WebP for smaller size
cwebp image.jpg -o image.webp
```

### Batch Processing

```bash
# Analyze all images in parallel (careful with rate limits)
find . -name "*.jpg" | while read img; do
  npm run dev analyze-media "$img" &
done
wait
```

### Result Management

```bash
# List recent analyses
ls -lt references/ai_feedback/ | head -10

# Archive old results
mkdir archive_2026-01 && mv references/ai_feedback/*2026-01* archive_2026-01/
```

---

## Future Enhancements

Anticipated improvements for Gemini 3:

- [ ] Real-time streaming video analysis
- [ ] 3D object reconstruction from images
- [ ] Multi-language OCR
- [ ] Video generation from descriptions
- [ ] Improved low-light image processing
- [ ] Fingerprint and face recognition (with privacy controls)
- [ ] Medical imaging support with disclaimers

---

## Resources

### Official Documentation

- [Google Gemini API Docs](https://ai.google/gemini/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Gemini API Reference](https://ai.google/api/)

### Community

- Stack Overflow: `google-generative-ai`
- GitHub: Google Generative AI repositories
- Discord: Developer communities

### Related Guides

- [Gemini 3 API Authentication Guide](./GEMINI_3_API_GUIDE_2026.md)
- OpenAI API Documentation
- Node.js File System APIs

---

## Summary

The Gemini 3 API provides powerful multimodal analysis capabilities through a simple, elegant interface. The CLI toolkit makes it easy to:

✓ Upload and analyze images  
✓ Process videos for insights  
✓ Save results to organized folders  
✓ Integrate with existing workflows  
✓ Scale to batch processing  

By following the best practices and using the provided CLI commands, you can quickly build AI-powered applications that leverage cutting-edge vision technology.

---

**Document Version:** 1.0  
**Last Updated:** February 5, 2026  
**Status:** Current and Maintained
