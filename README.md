<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# VibesAI - Gemini-Powered Code IDE

An intelligent code editor powered by Google Gemini AI with file management, live preview, and AI-assisted development capabilities.

## Features

- 🤖 **AI Agent** - Gemini-powered code assistant with function calling
- 📝 **Code Editor** - Monaco Editor with syntax highlighting
- 🎨 **Live Preview** - Real-time HTML/CSS/JS preview with console
- 📁 **File Explorer** - Tree-based file management
- 💾 **Project Management** - Create and switch between multiple projects
- 📊 **Project Insights** - Code statistics and metrics
- 🌙 **Dark Mode** - Full dark/light theme support
- 📱 **Responsive UI** - Mobile-friendly interface

## Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or pnpm

## Setup Instructions

### 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
GEMINI_API_KEY=your_api_key_here
APP_URL=http://localhost:3000
```

Or copy and edit the example:
```bash
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY
```

### 3. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 4. Run Development Server

```bash
npm run dev
# or
pnpm dev
```

The app will start at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run clean` - Remove build artifacts
- `npm run lint` - Run TypeScript linter

## Project Structure

```
├── src/
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── components/ui/       # UI component library (shadcn/ui)
├── .env.local          # Local environment variables (create this file)
├── .env.example        # Example environment variables
├── vite.config.ts      # Vite configuration
└── tsconfig.json       # TypeScript configuration
```

## Troubleshooting

### "API Key Not Configured"
- Make sure `.env.local` file exists in the project root
- Verify `GEMINI_API_KEY` is set and not empty
- Check that your API key is valid from Google AI Studio

### Build Errors
- Clear node_modules: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`
- Rebuild: `npm run build`

### Port Already in Use
- Change the port in vite.config.ts or use: `npm run dev -- --port 3001`

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Modern mobile browsers

## Tech Stack

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Editor**: Monaco Editor
- **UI Components**: shadcn/ui
- **AI**: Google Gemini API
- **Markdown**: react-markdown with remark-gfm
- **Storage**: localStorage + IndexedDB-like capabilities

## Performance Notes

- The app uses localStorage for persistence, so data is stored locally
- Large projects may impact performance - consider breaking into smaller projects
- Console output is limited to last 50 logs for performance

## License

MIT
