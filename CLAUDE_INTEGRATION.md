# Claude Integration Guide

## Overview

VibesAI now supports both **Google Gemini** and **Anthropic Claude** as AI providers. You can seamlessly switch between them in the UI or configure them in your environment variables.

## Setup

### 1. Get Your API Keys

#### Google Gemini
- Visit [Google AI Studio](https://aistudio.google.com/apikey)
- Create a new API key
- Copy your key

#### Anthropic Claude
- Visit [Anthropic Console](https://console.anthropic.com/)
- Create a new API key
- Copy your key

### 2. Configure Environment Variables

Create a `.env.local` file in your project root:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_CLAUDE_API_KEY=your_claude_api_key_here
```

Or set them as environment variables in your system or deployment platform.

### 3. Both APIs Are Optional

- If only `VITE_GEMINI_API_KEY` is set → Only Gemini will be available
- If only `VITE_CLAUDE_API_KEY` is set → Only Claude will be available
- If both are set → You can switch between them in the UI
- If neither is set → You'll see a warning to configure at least one

## Using Multiple Providers

### In the UI

Look for the **AI Provider Selector** in the top header (next to the editor mode selector):

```
[Claude 3.5 Sonnet ▼]  [Code Mode ▼]  [Dark/Light]
```

Click to open the dropdown and select your preferred provider.

### In Code

```typescript
import { getUnifiedAIService } from './services/unifiedAIService';

const aiService = getUnifiedAIService();

// Get available providers
const providers = aiService.getAvailableProviders();
console.log(providers); // ['gemini', 'claude']

// Switch provider
aiService.setProvider('claude');

// Get current provider
const current = aiService.getCurrentProvider();
console.log(current); // 'claude'

// Generate content
const response = await aiService.generateContent(
  chatHistory,
  'Write a hello world function'
);
console.log(response);
// { text: "...", provider: "claude", modelUsed: "Claude 3.5 Sonnet" }
```

## Features

### Supported Operations

Both providers support:
- ✅ Text generation with streaming
- ✅ Code analysis
- ✅ Test case generation
- ✅ Conversation history
- ✅ Error handling with retries
- ✅ Timeout protection

### Auto-Detection

The system automatically:
1. Detects which providers are configured
2. Sets Claude as primary if available (better for code)
3. Falls back to Gemini if Claude is unavailable
4. Shows an error if no providers are configured

### Retry Logic

Both services include:
- Exponential backoff (1s → 10s)
- Up to 3 retries by default
- 30-second request timeout
- Detailed error messages

## Model Information

### Gemini 2.0 Flash
- **Model**: `gemini-2.0-flash`
- **Max tokens**: 2048
- **Speed**: Very fast
- **Cost**: Free tier available
- **Best for**: Quick responses, coding help

### Claude 3.5 Sonnet
- **Model**: `claude-3-5-sonnet-20241022`
- **Max tokens**: 2048
- **Speed**: Fast
- **Cost**: Paid API
- **Best for**: Complex analysis, detailed explanations, code quality

## Migration from Gemini-Only

If you were using just Gemini:

**Before:**
```typescript
const geminiService = new GeminiService({ apiKey });
await geminiService.generateContent(history, message);
```

**After:**
```typescript
const aiService = getUnifiedAIService();
await aiService.generateContent(
  history.map(msg => ({ role: msg.role, content: msg.content })),
  message
);
```

## Error Handling

All errors are captured and logged:

```typescript
try {
  await aiService.generateContent(history, message);
} catch (error) {
  // Automatically logged to ErrorService
  // User-friendly message displayed in UI
  console.error(error.message);
}
```

Check the **Error Notification** in the UI for real-time feedback.

## Troubleshooting

### "No AI providers configured"
- Add at least one API key to `.env.local`
- Restart the development server
- Check that keys are valid

### Provider keeps switching back
- The system auto-switches if current provider becomes unavailable
- Check that your API key is still valid
- Check your API quotas

### Slow responses
- Claude may be slower than Gemini depending on load
- Check your internet connection
- Try the other provider

### "Operation timeout"
- Request took longer than 30 seconds
- Try with shorter prompts
- Check your network connection

## Advanced Usage

### Checking Provider Availability

```typescript
if (aiService.isProviderAvailable('claude')) {
  aiService.setProvider('claude');
}
```

### Analyzing Code with Specific Provider

```typescript
aiService.setProvider('claude');
const analysis = await aiService.analyzeCode(code, 'typescript');
```

### Getting Response Metadata

```typescript
const response = await aiService.generateContent(history, message);
console.log(`Used ${response.provider} (${response.modelUsed})`);
```

## Rate Limiting

- **Gemini**: Check [pricing page](https://ai.google.dev/pricing) for limits
- **Claude**: Check [pricing page](https://www.anthropic.com/pricing) for limits

Consider implementing rate limiting in production:

```typescript
// Simple rate limit example
const rateLimiter = new Map();

function canMakeRequest(provider: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimiter.get(provider) || 0;
  const minGap = 1000; // 1 second between requests

  if (now - lastRequest >= minGap) {
    rateLimiter.set(provider, now);
    return true;
  }
  return false;
}
```

## Support

For issues:
- Gemini: [Google AI Studio Help](https://support.google.com/aistudio)
- Claude: [Anthropic Support](https://support.anthropic.com)
