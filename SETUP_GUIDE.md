# VibesAI Setup Guide

## Overview

VibesAI is a web-based IDE powered by Google Gemini AI. It lets you build web applications interactively with AI assistance.

## Quick Start (5 minutes)

### Step 1: Get Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com)
2. Click "Create API Key" in the left sidebar
3. Copy the generated API key (keep it secret!)

### Step 2: Configure the App

1. In the project root, create a file named `.env.local`:
   ```
   GEMINI_API_KEY=paste_your_api_key_here
   APP_URL=http://localhost:3000
   ```

2. Make sure the key is **not empty** and **not wrapped in quotes**

### Step 3: Start the Dev Server

```bash
npm install  # Install dependencies (first time only)
npm run dev  # Start the server
```

The app will open at `http://localhost:3000`

## What's Fixed

### ✅ Bugs and Issues Resolved:

1. **Missing GEMINI_API_KEY** 
   - Created `.env.local` template file
   - Added validation to show helpful error messages if key is missing
   - App gracefully handles missing API key instead of crashing

2. **Import Duplicates**
   - Removed duplicate `react-markdown` imports
   - Fixed `Markdown` vs `ReactMarkdown` naming conflict
   - Properly imported `remark-gfm` plugin

3. **DialogClose Component Issues**
   - Fixed deprecated `DialogClose` component usage
   - Replaced with proper `Button` with click handlers
   - Updated both modal dialogs for consistency

4. **Type Safety**
   - Added null checks for AI client
   - Improved error handling in agent turn processing
   - Better error messages for API failures

5. **Environment Variable Loading**
   - Fixed vite config to properly load env vars
   - Added fallback values for missing configs
   - Support for both process.env and import.meta.env patterns

6. **API Error Handling**
   - Enhanced 429 (quota exceeded) error detection
   - Added user-friendly error messages
   - Graceful degradation when API is unavailable

## Project Structure

```
vibesai/
├── src/
│   ├── App.tsx          # Main IDE application
│   ├── main.tsx         # React entry point
│   └── index.css        # Global styles
├── components/ui/       # shadcn UI components
├── .env.local          # ← Create this with your API key
├── .env.example        # Template for .env.local
├── vite.config.ts      # Build configuration
├── tsconfig.json       # TypeScript config
└── README.md           # Full documentation
```

## Usage Guide

### Create a New Project

1. Click the **"+"** button in the sidebar
2. Enter project name and description
3. Click **"Inisialisasi Proyek"** (Initialize Project)
4. AI will set up the initial file structure

### Chat with AI

1. Type your request in the chat box at the bottom
2. Example: "Create an HTML landing page with a contact form"
3. Wait for the AI to generate and save files
4. Files appear in the explorer on the left

### View Live Preview

1. Click the **Preview** icon (play button) in the sidebar
2. See your HTML/CSS/JS rendered live
3. Use the **Console** tab to debug issues
4. Click **Refresh** to reload the preview

### Edit Files

1. Click any file in the explorer to open it
2. Edit the code in the Monaco editor
3. Changes are auto-saved
4. For markdown files, toggle between Edit and Preview modes

### Export Project

1. Click the project name at the top
2. Select the project from the list
3. Click the menu button (•••)
4. Choose "Download" to export as ZIP

## Tips & Tricks

### Use AI Effectively

- Be specific: "Create a React component that..." works better than "Make something cool"
- Request incrementally: First create the HTML, then add styling, then add features
- Ask for explanations: "Explain the code in index.html" gets AI analysis

### Save Bandwidth

- Use `ls` command in console to list files
- Use `clear` command to clear console output
- Close unused projects to reduce localStorage usage

### Performance

- Keep projects under 50 files for best performance
- Clear old projects you don't need
- Use Preview instead of external browser for better debugging

## Troubleshooting

### Problem: "API Key Not Configured"

**Solution:** 
- Create `.env.local` file in project root
- Add: `GEMINI_API_KEY=your_actual_key_here`
- Refresh the browser

### Problem: Blank Screen or Preview Error

**Solution:**
- Check browser console for errors (F12)
- Make sure `.env.local` is properly configured
- Try refreshing the page (Ctrl+R or Cmd+R)

### Problem: "Failed to read file" errors

**Solution:**
- This is normal during AI operations
- It means the AI is trying to read files being created
- Wait for the operation to complete

### Problem: Port 3000 is already in use

**Solution:**
```bash
# Use a different port
npm run dev -- --port 3001
```

### Problem: Dependencies not installed

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## Advanced Configuration

### Change Editor Font Size

In the app, go to **Settings** (gear icon) and adjust "Font Size"

### Toggle Dark Mode

Click the **Sun/Moon** icon in the sidebar

### Adjust AI Model

In chat header, select from available Gemini models:
- **Gemini Flash** (fast & stable) - Recommended
- **Gemini 3 Flash** (latest speed)
- **Gemini 3.1 Pro** (most capable)
- **Gemini Flash Lite** (lightest)

## Common Tasks

### Create an HTML/CSS/JS Project

1. Click "+" to create new project
2. Name it "My Website"
3. In chat: "Create an HTML landing page with a navbar and hero section using TailwindCSS"
4. Ask to add features: "Add a contact form"
5. View in Preview tab

### Debug JavaScript Errors

1. Open the file in the editor
2. Click "Analyze & Fix" button at bottom-right
3. AI will review and suggest fixes
4. View console output in Preview's Console tab

### Convert HTML to React

1. Say: "Convert this HTML to a React component"
2. Create a new `.jsx` file
3. AI will help restructure for React

## Next Steps

- Read the full [README.md](README.md) for more features
- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more help
- Experiment with different AI prompts to learn what works best

## Need Help?

- Review error messages carefully - they often show the solution
- Check the console tab (right panel) for JavaScript errors
- Try asking the AI: "Why is this error happening?"
- Clear browser cache if settings seem wrong: Dev Tools → Application → Clear Storage

---

**Happy coding with AI! 🚀**
