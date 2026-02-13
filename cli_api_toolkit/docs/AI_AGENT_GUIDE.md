# AI Agent Toolkit - Quick Start Guide

## Overview
This toolkit provides AI agents with access to specialized tools for research, analysis, and content generation. All tools follow a consistent interface and return structured, machine-readable results.

---

## 🚀 Getting Started

### 1. Discover Available Tools
```bash
npm run dev --help
```

Output shows all available commands with descriptions and categories.

### 2. Learn Tool Capabilities
```bash
npm run dev <tool-name> --help
```

Shows full command schema including:
- Parameter names and types
- Required vs optional parameters
- Default values and choices
- Usage examples

### 3. Check Machine-Readable Format
All tools expose JSON schemas that agents can parse:
```typescript
const schema = command.getSchema(); // Full command metadata
```

---

## 🔍 Web Search Tool (`web-search`)

The foundational research tool for accessing information outside knowledge cutoff.

### Basic Usage
```bash
npm run dev web-search "your query"
```

### Advanced Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | required | Search query |
| `--mode` | string | quick | quick \| deep \| academic \| news \| recent |
| `--limit` | number | 10 | Results to return (1-50) |
| `--time` | string | any | day \| week \| month \| year \| any |
| `--domain` | string | none | Filter to domain (github.com, arxiv.org) |
| `--format` | string | text | text \| json \| markdown |
| `--save` | boolean | true | Save results to references/ |

### Search Modes Explained

**Quick Mode** (default)
```bash
npm run dev web-search "new AI models" --mode quick
# Returns: 5-10 most relevant results
# Best for: Quick lookups, API info
# Time: ~2-5 seconds
```

**Deep Mode**
```bash
npm run dev web-search "machine learning best practices" --mode deep
# Returns: 15-20 comprehensive results
# Includes: Academic papers, implementation guides, tutorials
# Best for: Understanding a complex topic
# Time: ~5-10 seconds
```

**Academic Mode**
```bash
npm run dev web-search "quantum error correction" --mode academic --domain arxiv.org
# Returns: Peer-reviewed sources only
# Includes: Institutional affiliations, citations
# Best for: Research-grade information
# Time: ~5-8 seconds
```

**News Mode**
```bash
npm run dev web-search "AI regulation news" --mode news --time week
# Returns: Latest news articles
# Includes: Publication date, recency indicators
# Best for: Current events, breaking information
# Time: ~3-5 seconds
```

**Recent Mode**
```bash
npm run dev web-search "breaking tech news" --mode recent
# Returns: Information from last 7 days
# Includes: Freshness indicators
# Best for: Latest developments
# Time: ~3-5 seconds
```

### Output Formats

**Text Format** (Human-readable, default)
```
🔍 Web Search - QUICK MODE
============================================================
Query: "AI safety alignment"
Results: 10 | Time Range: any | Format: text

Found 10 results

1. Anthropic AI Safety Research
   🔗 https://www.anthropic.com/
   📄 Anthropic is an AI safety company building reliable, interpretable...
   💾 Source: anthropic.com
   ⭐ Trust: ██████████ (95%)
   📈 Relevance: █████░░░░░ (85%)
```

**JSON Format** (Structured, for agents)
```bash
npm run dev web-search "topic" --format json
```

Returns:
```json
{
  "query": "topic",
  "resultCount": 10,
  "results": [
    {
      "title": "Result Title",
      "url": "https://...",
      "snippet": "...",
      "trustScore": 0.92,
      "relevanceScore": 0.85,
      "source": "domain.com",
      "domain": "domain.com",
      "publishedDate": "2026-02-05"
    }
  ],
  "executionTimeMs": 2341,
  "relatedQueries": ["related topic 1", "related topic 2"],
  "summary": "Found 10 relevant results..."
}
```

**Markdown Format** (Publication-ready)
```bash
npm run dev web-search "topic" --format markdown
```

Returns publication-ready markdown with:
- Numbered results
- Clickable links
- Trust/relevance metrics
- Related searches
- Source citations

### Smart Features

**Trust Scoring**
- Automatically rates source credibility
- GitHub/StackOverflow: 95% (community code)
- Wikipedia: 90% (reference info)
- Unknown sites: 65% (neutral)
- Visual progress bars in text format

**Relevance Scoring**
- Measures how well result matches query
- Based on keyword matching
- Helps prioritize results
- Shown as percentage in all formats

**Caching**
- Automatically caches searches
- Same query returns instantly on repeat
- Cache limited to 100 results
- Cleared between sessions

**Related Queries**
- Suggests follow-up searches
- Helps explore topics deeper
- Extracted from search results
- Useful for multi-stage research

### Real-World Examples

**Research AI Safety Alignment (Deep)**
```bash
npm run dev web-search "AI alignment safety challenges 2026" \
  --mode deep \
  --limit 20 \
  --time year
```

**Find GitHub Repositories (Quick)**
```bash
npm run dev web-search "TypeScript REST API framework" \
  --domain github.com \
  --format json
```

**News Research (Recent)**
```bash
npm run dev web-search "latest AI regulations" \
  --mode news \
  --time day \
  --format markdown
```

**Academic Research (Academic)**
```bash
npm run dev web-search "machine learning interpretability" \
  --mode academic \
  --domain arxiv.org \
  --limit 30
```

**Batch Searches**
```typescript
const webSearch = new WebSearchService();
const results = await webSearch.searchBatch([
  "AI safety",
  "machine learning best practices",
  "TypeScript patterns"
]);
```

---

## 📊 Result Processing Examples

### Extract Top Domains
```bash
npm run dev web-search "topic" --format json | \
  jq '.results | map(.domain) | unique'
```

### Filter High-Trust Sources
```bash
npm run dev web-search "topic" --format json | \
  jq '.results | map(select(.trustScore > 0.85))'
```

### Get All URLs
```bash
npm run dev web-search "topic" --format json | \
  jq '.results[].url'
```

### Summary Statistics
```bash
npm run dev web-search "topic" --format json | \
  jq '{
    total: (.resultCount),
    avgTrust: (.results | map(.trustScore) | add / length),
    avgRelevance: (.results | map(.relevanceScore) | add / length),
    executionTime: .executionTimeMs
  }'
```

---

## 📁 File Management

### Saved Results
Results are automatically saved to `references/` directory:
```
references/
├── search_ai_safety_quick_20260209.md
├── search_machine_learning_deep_20260209.md
└── ...
```

### Reading Saved Results
```bash
cat references/search_*.md
# View all search results

cat "references/search_ai_safety_quick_20260209.md"
# View specific search
```

---

## 🔄 For AI Agents: Integration Pattern

### Step 1: Introspect
```typescript
const schema = webSearchCommand.getSchema();
console.log(schema.description);        // What it does
console.log(schema.parameters);         // What it accepts
console.log(schema.examples);           // How to use it
```

### Step 2: Validate
```typescript
// Command handles validation
const executor = new CommandExecutor();
const result = await executor.execute(command, [
  'query',
  '--mode', 'deep',
  '--limit', '20'
]);
```

### Step 3: Parse Result
```typescript
if (result.success) {
  console.log(result.data);     // Structured data
  console.log(result.timestamp); // When executed
  console.log(result.executionTimeMs); // How long
} else {
  console.log(result.error);    // What went wrong
  console.log(result.status);   // Error code
}
```

### Step 4: Use Data
```typescript
const urls = result.data.sources.map(s => s.url);
const topSource = result.data.sources[0];
// Process as needed
```

---

## 🛠️ Troubleshooting

### Search Returns No Results
```bash
# Try different mode or time range
npm run dev web-search "topic" --mode deep --time month

# Check if domain filter is too restrictive
npm run dev web-search "topic" --domain github.com
```

### Need More Results
```bash
# Increase limit to 50 (max)
npm run dev web-search "topic" --limit 50

# Try deep mode for more comprehensive results
npm run dev web-search "topic" --mode deep
```

### Want to Deep Dive
```bash
# Use academic mode for research-grade sources
npm run dev web-search "topic" --mode academic

# Use related queries from results for follow-up research
```

---

## 📚 Additional Tools

This toolkit includes other tools following the same interface:

- **analyze-media**: Analyze images and videos with Gemini 3 AI
- **generate-image**: Create images using DALL-E 3

All use the same:
- Schema introspection
- Parameter validation
- Structured results
- Help system

---

## 💡 Best Practices

1. **Always check help first**: `npm run dev <tool> --help`
2. **Start with --format json**: Parse structured data reliably
3. **Use appropriate mode**: Quick for simple lookups, deep for understanding
4. **Filter by domain when relevant**: github.com for code, arxiv.org for papers
5. **Check execution time**: Adjust limits if taking too long
6. **Review trust scores**: High scores indicate reliable sources
7. **Use related queries**: Follow-up on interesting topics
8. **Save results**: --save flag stores in references/ for review

---

**Ready to research!** Start with:
```bash
npm run dev web-search "your question"
```

For detailed examples, see the ARCHITECTURE.md documentation.
