# VibesAI Development Documentation

Welcome to the VibesAI Development Hub! This guide will help you navigate the project, understand its architecture, and contribute to its development.

## Quick Navigation

### For New Users
1. **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Get started quickly
2. **[FEATURES_OVERVIEW.md](./FEATURES_OVERVIEW.md)** - Explore what you can do
3. **README.md** - Project basics

### For Developers
1. **[DEVELOPMENT_PROGRESS.md](./DEVELOPMENT_PROGRESS.md)** - Technical architecture & progress
2. **[IMPLEMENTATION_REPORT.md](./IMPLEMENTATION_REPORT.md)** - Detailed implementation metrics
3. **[DEVELOPMENT_SUMMARY.md](./DEVELOPMENT_SUMMARY.md)** - Feature summary and highlights

### For Maintenance
1. **[BUG_FIXES.md](./BUG_FIXES.md)** - Known issues and solutions
2. **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common problems and fixes
3. **[IMPROVEMENTS_SUMMARY.md](./IMPROVEMENTS_SUMMARY.md)** - Improvement details

## Project Overview

**VibesAI** is a professional AI-powered code IDE built with React, TypeScript, and Google Gemini API.

### Key Stats
- **Total Code**: 2,324 lines
- **Components**: 8 files
- **Services**: 3 files
- **Hooks**: 3 files
- **Documentation**: 1,200+ lines
- **Languages Supported**: 16+

### Tech Stack
- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Monaco Editor
- Google Gemini API

## Architecture Overview

### Layered Architecture
```
┌─────────────────────────────────┐
│   User Interface (Components)   │
│   - EnhancedCodeEditor          │
│   - FileManager                 │
│   - ChatPanel                   │
│   - LivePreview                 │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│  State Management (Custom Hooks)│
│  - useEditorState               │
│  - useProjectState              │
│  - useChatState                 │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│  Business Logic (Services)      │
│  - geminiService                │
│  - fileService                  │
│  - formattingService            │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│  External APIs & Storage        │
│  - Google Gemini API            │
│  - localStorage                 │
└─────────────────────────────────┘
```

## Getting Started

### 1. Installation
```bash
npm install
```

### 2. Setup API Key
```bash
# Create .env.local
GEMINI_API_KEY=your_key_here
```

### 3. Start Development
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm run preview
```

## Project Structure

```
vibesai/
├── src/
│   ├── hooks/
│   │   ├── useEditorState.ts        # Editor UI state
│   │   ├── useProjectState.ts       # Project management
│   │   └── useChatState.ts          # Chat state
│   │
│   ├── services/
│   │   ├── geminiService.ts         # AI integration
│   │   ├── fileService.ts           # File operations
│   │   └── formattingService.ts     # Code formatting
│   │
│   ├── components/
│   │   ├── EnhancedCodeEditor.tsx   # Code editor
│   │   ├── EditorSettingsPanel.tsx  # Settings
│   │   ├── FileExplorer.tsx         # Basic file tree
│   │   ├── AdvancedFileManager.tsx  # Advanced files
│   │   ├── LivePreview.tsx          # Preview
│   │   ├── ChatPanel.tsx            # Chat UI
│   │   ├── ProjectSwitcher.tsx      # Project switcher
│   │   └── CommandPalette.tsx       # Commands
│   │
│   ├── AppRefactored.tsx            # Main app (new)
│   ├── App.tsx                      # Legacy app
│   ├── main.tsx                     # Entry
│   └── index.css                    # Styles
│
├── Documentation/
│   ├── README.md                    # User guide
│   ├── SETUP_GUIDE.md              # Setup instructions
│   ├── FEATURES_OVERVIEW.md        # Feature guide
│   ├── DEVELOPMENT_PROGRESS.md     # Technical details
│   ├── IMPLEMENTATION_REPORT.md    # Metrics
│   ├── DEVELOPMENT_SUMMARY.md      # Summary
│   ├── BUG_FIXES.md                # Bug info
│   ├── TROUBLESHOOTING.md          # Common issues
│   └── README_DEVELOPMENT.md       # This file
│
└── Config/
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    └── .env.example
```

## Key Concepts

### State Management
Uses **custom React hooks** instead of Redux/Zustand for simplicity:
- `useEditorState` - Manages editor settings
- `useProjectState` - Manages projects (CRUD)
- `useChatState` - Manages chat messages

### Service Layer
Business logic separated into services:
- **geminiService** - AI API calls with streaming
- **fileService** - File tree building, import/export
- **formattingService** - Code formatting without dependencies

### Component Pattern
Functional components with hooks:
- Receive props from parent
- Use hooks for internal state
- Render UI
- Emit callbacks to parent

## Development Workflow

### Adding a New Feature

1. **Design the Component**
   ```typescript
   // src/components/MyNewComponent.tsx
   interface MyComponentProps {
     // Props definition
   }
   
   export const MyComponent: React.FC<MyComponentProps> = (props) => {
     // Component logic
     return <div>{/* JSX */}</div>;
   };
   ```

2. **Add State if Needed**
   ```typescript
   // src/hooks/useMyFeatureState.ts
   export const useMyFeatureState = () => {
     const [state, setState] = useState(...);
     // Hook logic
     return { state, setState };
   };
   ```

3. **Add Service Logic if Needed**
   ```typescript
   // src/services/myFeatureService.ts
   export class MyFeatureService {
     static myMethod() {
       // Service logic
     }
   }
   ```

4. **Integrate into App**
   - Import component
   - Add to AppRefactored
   - Test

### Best Practices

✓ **Do**
- Use TypeScript for type safety
- Keep components under 300 lines
- Separate concerns (UI/Logic/State)
- Use custom hooks for reusable logic
- Add JSDoc comments
- Test in multiple browsers
- Update documentation

✗ **Don't**
- Mix logic with UI in components
- Create components larger than 300 lines
- Use prop drilling excessively
- Hardcode values
- Skip TypeScript
- Forget to document
- Make breaking changes without migration

## Common Tasks

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Format Code
```bash
# Using editor settings
Format button in editor
```

### Export Project
```bash
Click Download button in header
```

### Create New Project
```bash
Click project name → New Project
```

## Testing

### Manual Testing Checklist
- [ ] Editor works
- [ ] Files can be created/deleted/renamed
- [ ] Preview updates
- [ ] Chat responds
- [ ] Settings save
- [ ] Dark mode works
- [ ] Export works
- [ ] Import works (future)
- [ ] All links work
- [ ] No console errors

### Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile responsive

## Performance Optimization

### Current
- ✓ Lazy loaded components
- ✓ Memoized callbacks
- ✓ Efficient re-renders
- ✓ No unnecessary state updates

### Next Steps
- Code splitting
- Virtual lists for large files
- Web Workers for formatting
- Service Workers for offline

## Debugging

### Console Logs
Use prefix for debugging:
```typescript
console.log("[v0] Debug message:", value);
```

### DevTools
- React DevTools extension
- Redux DevTools (future)
- Chrome DevTools

### Common Issues
- Check `BUG_FIXES.md`
- Check `TROUBLESHOOTING.md`
- Check browser console
- Check `.env.local` setup

## Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Docker
Create `Dockerfile`:
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Environment Variables
```env
GEMINI_API_KEY=your_key_here
APP_URL=https://your-domain.com
```

## Contributing

### Steps
1. Fork or clone
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Update documentation
6. Submit for review

### Code Review
- TypeScript types correct
- No console errors
- Tests pass
- Documentation updated
- Performance acceptable

## Documentation

### When to Update
- New features added
- API changes
- Bug fixes
- Architecture changes
- User workflows change

### Format
- Use Markdown
- Add examples
- Include links
- Keep concise
- Use headings

## Support

### Getting Help
1. Check documentation
2. Search existing issues
3. Check TROUBLESHOOTING.md
4. Ask in discussion forum

### Reporting Bugs
Include:
- Description
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/OS
- Console errors

## Roadmap

| Phase | Status | ETA |
|-------|--------|-----|
| 1: Architecture | ✓ | Done |
| 2: Editor | ✓ | Done |
| 3: Files | ✓ | Done |
| 4: AI | 🔄 | In Progress |
| 5: Preview | ⏳ | Next |
| 6: UI/UX | ⏳ | Future |
| 7: Performance | ⏳ | Future |

## FAQ

**Q: How do I add a new language to the editor?**
A: Update `FileService.getLanguageFromExtension()` in `fileService.ts`

**Q: Can I use this offline?**
A: Yes, except AI features (needs API key)

**Q: How much data can I store?**
A: ~5-10MB per project in browser localStorage

**Q: Can I export projects?**
A: Yes, as ZIP files via Download button

**Q: Is there collaboration support?**
A: Not yet, planned for Phase 8

**Q: Can I deploy this myself?**
A: Yes, follow deployment guide

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)

## License

MIT License - See LICENSE file

## Version History

### v2.0 (Current)
- ✓ Refactored to modular architecture
- ✓ Added enhanced editor features
- ✓ Added advanced file management
- ✓ Added project switcher
- ✓ Comprehensive documentation

### v1.0 (Legacy)
- Original monolithic application
- Basic features
- All in single App.tsx file

## Contact

- 📧 Email: [support email]
- 💬 Discord: [community link]
- 🐛 Issues: [GitHub issues]
- 📚 Wiki: [project wiki]

---

**Last Updated**: 2026
**Version**: 2.0
**Status**: Active Development
**Maintainers**: VibesAI Team
