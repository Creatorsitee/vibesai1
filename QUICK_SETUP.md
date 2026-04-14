# Quick Setup Guide - VibesAI Studio

## 30-Second Setup

### Step 1: Get API Key
1. Go to https://makersuite.google.com/app/apikeys
2. Create new API key for Google Gemini
3. Copy the key

### Step 2: Configure Environment
```bash
echo "VITE_GEMINI_API_KEY=your_key_here" > .env.local
```

### Step 3: Run Application
```bash
npm run dev
```

### Step 4: Open Browser
```
http://localhost:3000
```

---

## What You Get

### Professional AI Studio
- **Code Editor**: Full-featured Monaco editor
- **Live Preview**: Real-time HTML/CSS/JS rendering
- **AI Assistant**: Gemini-powered code helper
- **File Manager**: Create, edit, organize files
- **Dark Mode**: Eye-friendly dark theme
- **Error Handling**: Automatic error recovery

### Key Features
✅ Real-time code editing
✅ Live preview rendering
✅ AI-powered chat assistant
✅ Project management
✅ File operations
✅ Export to ZIP
✅ Light/dark themes
✅ Error recovery

---

## Troubleshooting

### "API Key not configured" Error
→ Check `.env.local` file has correct `VITE_GEMINI_API_KEY`
→ Restart dev server after adding key

### App won't load
→ Run `npm install` to ensure all dependencies
→ Check console for specific errors
→ Clear browser cache (Ctrl+Shift+Delete)

### Preview not rendering
→ Check HTML syntax
→ Verify file is named `index.html`
→ Check browser console for JS errors

---

## File Structure
- `/src` - Source code
- `/components` - React components
- `/services` - Business logic
- `/hooks` - Custom hooks
- `/styles` - CSS files
- `AppRefactored.tsx` - Main app
- `.env.local` - Configuration

---

## Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for errors
npm run lint
```

---

## Documentation
- See `FINAL_STATUS.md` for complete feature list
- See `DEVELOPMENT_GUIDE.md` for architecture
- See `ERRORS_FIXED.md` for what was fixed

---

## Success!
Your AI Studio is now ready. Start building amazing projects! 🚀
