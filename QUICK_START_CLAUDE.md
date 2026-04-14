# Quick Start: Adding Claude to VibesAI

## 30-Second Setup

### Step 1: Get Claude API Key
Go to https://console.anthropic.com/ → Create API key → Copy it

### Step 2: Add to Environment
Edit `.env.local` (create if doesn't exist):
```env
VITE_CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
```

### Step 3: Restart Development Server
```bash
npm run dev
```

### Step 4: Select Claude
Click the AI provider selector in the top header and choose **Claude 3.5 Sonnet**

## Done! 🎉

You can now switch between Gemini and Claude in the chat.

## Keeping Gemini

Your Gemini setup remains unchanged. You can use both:

```env
VITE_GEMINI_API_KEY=your_gemini_key
VITE_CLAUDE_API_KEY=your_claude_key
```

Then switch between them in the UI.

## Features

Both providers support:
- 💬 Real-time chat with streaming
- 🔍 Code analysis
- ✅ Test generation
- ⚡ Fast responses with retries
- 🛡️ Automatic error handling

## Files Changed

- `src/services/claudeService.ts` - Claude API integration
- `src/services/unifiedAIService.ts` - Provider switching
- `src/components/AIProviderSelector.tsx` - UI selector
- `src/AppRefactored.tsx` - Integrated new services

## Next Steps

1. Test with a simple message in chat
2. Try switching providers with the selector
3. Check the [full integration guide](./CLAUDE_INTEGRATION.md) for advanced usage

## Having Issues?

1. Make sure your API key is valid
2. Check that `.env.local` is in the project root
3. Restart the development server
4. Check the Error Notification in the UI for details

Enjoy using Claude! 🚀
