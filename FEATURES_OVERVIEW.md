# VibesAI Features Overview

## Quick Start

### 1. Getting Started
```bash
# Install dependencies
npm install

# Set your API key
# Edit .env.local and add: GEMINI_API_KEY=your_key_here

# Start development server
npm run dev
```

### 2. Creating Your First Project
1. Open the app
2. Click "Create Project"
3. Choose a template (Blank, HTML, React, Vue)
4. Start coding!

## Main Features

### 1. Code Editor

**Location**: Center panel (or full-screen in Code mode)

**Features**:
- Advanced Monaco Editor with syntax highlighting
- 16+ programming languages supported
- Real-time code formatting
- Code minification
- Line and character statistics
- Customizable font size (10-24px)
- Display options toggle:
  - Line numbers
  - Word wrap
  - Minimap
- Dark/Light theme

**How to Use**:
- Click any file to edit
- Use Format button to auto-format code
- Use Minify option to compress code
- Check stats in toolbar
- Customize via Settings

**Toolbar Buttons**:
- 📐 Format - Auto-format code
- 📋 Copy - Copy all code
- ⋮ More - Additional options

### 2. File Management

**Location**: Left sidebar

**Two Options**:
1. **Basic File Explorer** - Simple tree view
2. **Advanced File Manager** - Enhanced with search

**Features**:
- Hierarchical file tree with folders
- Expand/collapse folders
- Create new files
- Delete files
- File search with preview
- Rename files
- Right-click context menu
- Active file highlighting

**Context Menu** (Right-click on file):
- Open
- Rename
- Copy Path
- Delete

**Search**:
- Type to filter files
- Results show file path
- Click to open file

**How to Use**:
- Click file to open
- Hover to see delete button
- Right-click for more options
- Use search to find files quickly
- Organize with folders

### 3. Project Management

**Location**: Header (project name)

**Features**:
- Multiple projects support
- Project templates
- Project creation with metadata
- Project deletion
- Auto-save to browser storage
- Project stats (file count, last updated)

**Templates Available**:
- **Blank** - Empty project
- **HTML** - Basic HTML structure
- **React** - React component template
- **Vue** - Vue.js template

**How to Use**:
1. Click project name to open switcher
2. Select existing project to switch
3. Click "New Project" to create
4. Enter name and choose template
5. Click Create
6. Delete unwanted projects

**Project Info**:
- Name and description
- File count
- Last modified date
- Delete button

### 4. Live Preview

**Location**: Right panel (or full-screen in Preview mode)

**Features**:
- Real-time HTML preview
- Console output capture
- Auto-refresh on file change
- Error display
- Sandbox environment
- Refresh button

**Console Features**:
- Capture console.log()
- Capture console.error()
- Capture console.warn()
- Color-coded output
- Last 20 messages shown

**How to Use**:
- Write HTML code
- See preview instantly
- Check console for errors
- Use refresh button if needed
- Check for JavaScript errors

### 5. AI Chat Assistant

**Location**: Bottom-right panel (Split view)

**Features**:
- Chat with Gemini AI
- Markdown rendering
- Code syntax highlighting
- Copy code snippets
- Streaming responses
- Chat history

**How to Use**:
1. Type your question/request
2. Press Enter or click Send
3. AI generates response
4. Hover over code blocks to copy
5. Ask follow-up questions

**Example Prompts**:
- "Generate a responsive navbar"
- "Fix the bug in my code"
- "Explain this JavaScript function"
- "Create a login form"
- "Optimize this CSS"

**Tips**:
- Use Shift+Enter for new lines
- Code blocks are auto-detected
- Click copy button for quick copying
- Clear chat history in app

### 6. Editor Settings

**Location**: Settings button (top-right)

**Customization Options**:

**Display**:
- Font Size: 10-24px
- Line Numbers: Toggle
- Word Wrap: Toggle
- Minimap: Toggle

**Theme**:
- Light mode
- Dark mode

**Actions**:
- Reset to Defaults
- Close settings

**How to Access**:
1. Click Settings ⚙️ icon
2. Adjust preferences
3. Changes apply immediately
4. Close with X button

**Default Settings**:
- Font Size: 14px
- Line Numbers: On
- Word Wrap: On
- Minimap: On
- Theme: Dark

### 7. View Modes

**Location**: Header mode selector

**Available Modes**:

**Code Only** (Left + Center)
- File explorer + Code editor
- Full width for coding

**Preview Only** (Right)
- Full screen preview
- See changes in real-time

**Split** (Left + Center + Bottom + Right)
- Files + Editor + Chat + Preview
- Everything at once
- Resizable panels

**How to Use**:
1. Select mode from dropdown
2. Switch between modes anytime
3. Drag panel dividers to resize
4. Organize your workspace

### 8. Project Export

**Location**: Download button (top-right)

**Features**:
- Export project as ZIP file
- Includes all files
- Preserves structure

**How to Use**:
1. Click Download button
2. Choose save location
3. ZIP file downloads
4. Extract to use elsewhere

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+K / Cmd+K | Open command palette (future) |
| Shift+Enter | New line in chat |
| Enter | Send chat message |
| Escape | Close modals/dialogs |
| Ctrl+S | Save (auto-saved) |

## Tips & Tricks

### Code Formatting
- Auto-format on paste
- Auto-format on type
- Manual format with button
- Minify to compress code

### File Organization
- Create folders for structure
- Use search to find files
- Rename files as needed
- Delete unused files

### Efficient Workflow
1. Open advanced file manager
2. Search for files
3. Edit in code editor
4. Preview changes in real-time
5. Chat with AI for help
6. Export when done

### Using Templates
- Start with template
- Modify for your needs
- Use AI to enhance
- Export final project

### Performance Tips
- Close unused projects
- Delete unnecessary files
- Use minification for production
- Keep file names short

## Troubleshooting

### API Key Issues
- Ensure GEMINI_API_KEY is set in .env.local
- Key must be valid from Google AI Studio
- Refresh page after adding key

### Preview Not Working
- Check HTML syntax
- Ensure main file is named index.html
- Check browser console for errors
- Click refresh button

### Files Not Saving
- Check browser localStorage quota
- Files auto-save automatically
- Use export to backup

### Chat Not Responding
- Check API key is set
- Check internet connection
- Wait for previous response
- Refresh page if stuck

## Advanced Features

### Search & Replace
- Use advanced file manager search
- Find files by name
- Preview file content

### Code Analysis
- Ask AI to review code
- Get debugging help
- Request optimization suggestions

### Template Exploration
- Try different templates
- Learn from examples
- Customize templates

### Multi-File Projects
- Organize with folders
- Link files together
- Use AI to refactor

## File Size Limits

- **Browser Storage**: ~5-10MB per project
- **Code Editor**: Can handle large files
- **Preview**: Depends on browser
- **Export**: Unlimited (ZIP format)

## Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (responsive)

## Privacy & Security

- Files stored locally in browser
- No data sent to servers (except Gemini API)
- API requests to Google Gemini
- localStorage persists data

## Getting Help

1. Check TROUBLESHOOTING.md
2. Review SETUP_GUIDE.md
3. Check DEVELOPMENT_PROGRESS.md
4. Ask AI assistant in chat

## Next Features Coming

- Collaborative editing
- GitHub integration
- Cloud sync
- Deployment preview
- More templates
- Code snippets library
- Version control

## Feedback

Help improve VibesAI:
- Report bugs
- Suggest features
- Share workflows
- Star the project

---

**Last Updated**: 2026
**Version**: 2.0 (Refactored)
