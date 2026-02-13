# Image Generation CLI Command Guide

**Document Type:** User Guide  
**Date:** February 5, 2026  
**Command:** `generate-image`  
**Status:** Production Ready

---

## Quick Start

### Basic Usage

```bash
npm run dev generate-image "Your prompt here"
```

### Example: Simple Landscape

```bash
npm run dev generate-image "A serene mountain landscape at sunset"
```

**Result:**
- Image generated using DALL-E 3
- Automatically saved to `images/` folder
- Filename: `image_a_serene_mountain_landscape_at_sunset_20260205232216.png`

---

## Command Syntax

```bash
npm run dev generate-image <prompt> [options]

Aliases: gen-img, genimage, image
```

### Required Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `<prompt>` | Image description | `"A golden retriever in a park"` |

### Optional Parameters

| Option | Values | Default | Example |
|--------|--------|---------|---------|
| `--size` | 1024x1024, 1792x1024, 1024x1792 | 1024x1024 | `--size 1792x1024` |
| `--quality` | standard, hd | standard | `--quality hd` |
| `--count` | 1-10 | 1 | `--count 3` |

---

## Usage Examples

### Example 1: Simple Image Generation

```bash
npm run dev generate-image "A golden retriever playing in autumn leaves"
```

**Output:**
```
🎨 Image Generation Command
══════════════════════════════════════════════════

🎨 Generating 1 image(s) with DALL-E 3...
📝 Prompt: A golden retriever playing in autumn leaves
📐 Size: 1024x1024
✓ Image 1/1 saved: image_a_golden_retriever_playing_in_autumn_20260205232216.png

✅ Successfully generated 1 image(s)!

📁 Saved to:
   ✓ image_a_golden_retriever_playing_in_autumn_20260205232216.png

📂 Images directory: C:\Users\Tirth Patel\IS219\cli_api_toolkit/images
📊 Total images stored: 1
```

---

### Example 2: Landscape Format

For wider images, use `--size 1792x1024`:

```bash
npm run dev generate-image "Cyberpunk city at night with neon signs" --size 1792x1024
```

**Result:** Widescreen image (1792x1024 pixels)

---

### Example 3: Portrait Format

For taller images, use `--size 1024x1792`:

```bash
npm run dev generate-image "A fantasy warrior in armor portrait" --size 1024x1792
```

**Result:** Portrait-oriented image (1024x1792 pixels)

---

### Example 4: High Quality

For premium quality output, use `--quality hd`:

```bash
npm run dev generate-image "A luxury sports car in details" --quality hd
```

**Note:** HD quality may take slightly longer and costs more per image.

---

### Example 5: Multiple Images

Generate multiple images with same prompt:

```bash
npm run dev generate-image "A dragon flying over mountains" --count 3
```

**Result:** Generates 3 images with slightly different interpretations

---

### Example 6: Combined Options

```bash
npm run dev generate-image "A serene Japanese garden" --size 1792x1024 --quality hd --count 2
```

**Result:** 2 landscape HD images

---

## Image Organization

### Folder Structure

```
cli_api_toolkit/
├── images/
│   ├── image_a_serene_mountain_landscape_at_sunset_20260205232216.png
│   ├── image_cyberpunk_city_at_night_neon_signs_20260205232245.png
│   ├── image_fantasy_warrior_in_armor_portrait_20260205232301.png
│   └── ... (more generated images)
├── references/
├── src/
└── ... (other files)
```

### Filename Format

```
image_<sanitized_prompt>_<timestamp>.png
```

**Example breakdown:**
```
image_a_serene_mountain_landscape_at_sunset_20260205232216.png
       ↑                                           ↑
       └─ Prompt-based name                      └─ Timestamp (YYYYMMDDHHMMSS)
```

**Features:**
- Prompt automatically sanitized (special characters removed)
- Limited to 50 characters for brevity
- Underscores replace spaces
- Timestamp ensures uniqueness
- Chronologically sortable

---

## Prompting Tips for Better Results

### 1. Be Specific and Detailed

❌ **Bad:**
```bash
npm run dev generate-image "A cat"
```

✅ **Good:**
```bash
npm run dev generate-image "A fluffy Persian cat with blue eyes sitting on a windowsill, afternoon sunlight"
```

---

### 2. Include Style Direction

```bash
npm run dev generate-image "A landscape in oil painting style, impressionist, vibrant colors"
```

---

### 3. Specify Lighting and Mood

```bash
npm run dev generate-image "A portrait with dramatic backlighting, film noir style, moody atmosphere"
```

---

### 4. Use Size Strategically

- **1024x1024** (Square): Portraits, logos, centered compositions
- **1792x1024** (Landscape): Scenery, panoramas, wide shots
- **1024x1792** (Portrait): Character designs, vertical compositions

---

### 5. Combine Best Practices

```bash
npm run dev generate-image "A majestic dragon perched on a mountain, scales glistening in golden sunset light, fantasy art style, highly detailed, cinematic quality, 8K resolution"
```

---

## Common Use Cases

### 1. Social Media Content

```bash
npm run dev generate-image "Instagram-ready thumbnail for productivity tips, eye-catching design, bold colors, 1024x1024"
```

---

### 2. Blog Illustrations

```bash
npm run dev generate-image "Minimalist illustration for technology article, flat design, modern aesthetic, 1792x1024" --size 1792x1024
```

---

### 3. Concept Art

```bash
npm run dev generate-image "Sci-fi spaceship design concept, detailed technical drawing style, multiple angles shown" --quality hd
```

---

### 4. Character Designs

```bash
npm run dev generate-image "RPG character class warrior, detailed armor design, professional game art quality, character sheet style"
```

---

### 5. Background Images

```bash
npm run dev generate-image "Abstract geometric background, vibrant colors, modern design" --size 1792x1024
```

---

### 6. Product Mockups

```bash
npm run dev generate-image "Modern smartphone mockup on wooden desk, product photography style, professional lighting"
```

---

## Troubleshooting

### Issue: Image doesn't match expectations

**Solution:** Refine your prompt with more specific details:
- Add style descriptors
- Specify lighting
- Include composition guidance
- Use reference artists/styles

**Try again:**
```bash
npm run dev generate-image "Your refined prompt with more details"
```

---

### Issue: Command not recognized

**Solution:** Ensure you're using correct command name:

✅ Correct:
```bash
npm run dev generate-image
```

❌ Incorrect:
```bash
npm run dev image-generate  # Wrong order
npm run dev img             # Incomplete
```

---

### Issue: Images folder not created

**Solution:** The CLI automatically creates the `images/` folder on first run:

```bash
npm run dev generate-image "test"
# Will create: images/ folder if it doesn't exist
```

---

### Issue: API rate limits

**Solution:** DALL-E 3 has rate limits. If you get an error:
- Wait a few moments
- Retry with simpler prompt
- Use smaller dimensions (1024x1024)

---

## Pricing Information

### Cost Per Image (2026)

| Size | Standard | Cost |
|------|----------|------|
| 1024x1024 | $0.080 | Cheapest |
| 1792x1024 | $0.120 | 50% more |
| 1024x1792 | $0.120 | 50% more |

**HD Quality:** Additional 25% cost increase

### Budget Planning

- **1 image (1024x1024):** ~$0.08
- **10 images (mixed):** ~$1.00
- **100 images:** ~$10.00
- **1000 images:** ~$82-92 (depending on sizes/quality)

### Cost Optimization

1. **Prototype with small (1024x1024) before expanding** to larger sizes
2. **Use standard quality first** - upgrade to HD when needed
3. **Refine prompts before generating** - fewer revisions = lower cost
4. **Batch related images** - similar prompts may reuse calculations

---

## File Management

### Viewing Generated Images

Navigate to images folder and open with any image viewer:
```
C:\Users\Tirth Patel\IS219\cli_api_toolkit\images\
```

### Organizing Images

#### By Date
Images have timestamps - older images have earlier timestamps:
```
image_..._20260205232216.png  (oldest)
image_..._20260205232245.png
image_..._20260205232301.png  (newest)
```

#### By Theme
Manually organize in subfolders:
```
images/
├── landscapes/
├── portraits/
├── abstract/
└── logos/
```

---

## Advanced Features

### Batch Generation

Generate multiple variations:

```bash
npm run dev generate-image "A specific scene" --count 5 --size 1024x1024
```

Creates 5 different interpretations of the prompt.

---

### Options Combinations

Create themed batch:

```bash
# Professional product images
npm run dev generate-image "Luxury watch photography" --size 1792x1024 --quality hd --count 3
```

---

## Integration with Other Commands

### Use web-search for prompts

First, research prompting styles:

```bash
npm run dev web-search "best practices for AI image generation prompts"
```

Then apply findings to your image generation:

```bash
npm run dev generate-image "Your research-informed prompt"
```

---

### Analyze generated images

Generate image, then analyze it:

```bash
npm run dev generate-image "A portrait of a wizard"
npm run dev analyze-media images/image_a_portrait_of_a_wizard_*.png
```

---

## Best Practices Summary

✅ **DO:**
- Be specific and detailed in prompts
- Include style and artistic direction
- Specify lighting and mood
- Choose appropriate size for use case
- Refine prompts based on results
- Organize images in meaningful folders
- Document what prompts produced best results

❌ **DON'T:**
- Use vague, one-word prompts
- Mix conflicting styles without reason
- Ignore size requirements
- Generate full batch without testing first
- Ignore API costs for high-volume work

---

## Command Reference Quick Summary

```bash
# Basic
npm run dev generate-image "prompt"

# With size
npm run dev generate-image "prompt" --size 1792x1024

# With quality
npm run dev generate-image "prompt" --quality hd

# Multiple images
npm run dev generate-image "prompt" --count 5

# All options combined
npm run dev generate-image "prompt" \
  --size 1792x1024 \
  --quality hd \
  --count 3

# Using aliases
npm run dev gen-img "prompt"
npm run dev genimage "prompt"
npm run dev image "prompt"
```

---

## Support & Documentation

- **Full API Guide:** See `OPENAI_IMAGE_GENERATION_GUIDE_2026.md` for comprehensive DALL-E 3 documentation
- **Prompting Guide:** See `DALLE_3_BEST_PRACTICES_2026.md` for advanced prompting techniques
- **Main Toolkit:** See `TOOLKIT_SETUP_GUIDE_2026.md` for overall CLI setup

---

**Last Updated:** February 5, 2026  
**Status:** Production Ready ✅  
**Tested:** DALL-E 3 integration verified ✅
