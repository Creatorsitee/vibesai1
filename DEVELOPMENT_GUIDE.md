# VibesAI Development Guide

Complete guide to the VibesAI platform with all implemented features, improvements, and best practices.

## Architecture Overview

VibesAI is a modern React-based AI IDE with the following core systems:

- **Services Layer**: Error handling, logging, performance optimization, storage, search/replace
- **Hooks Layer**: Custom React hooks for state management, persistence, undo/redo
- **Components Layer**: UI components with error boundaries, loading states, notifications
- **Integration**: Google Gemini API with retry logic and streaming support

## Phase 1: Core Bug Fixes & Error Handling

### ErrorService
Centralized error logging with user-friendly messages and error tracking.

```typescript
import { getErrorService } from './services/errorService';

const errorService = getErrorService();

// Log errors
errorService.logError(
  new Error('Something went wrong'),
  { context: 'user_action' },
  'User-friendly message'
);

// Register error handlers
errorService.onError((errorLog) => {
  console.log(errorLog);
});
```

### LoggingService
Structured logging with categories and export capabilities.

```typescript
import { getLoggingService } from './services/loggingService';

const logger = getLoggingService();

logger.info('CategoryName', 'Info message', { data: 'value' });
logger.warn('CategoryName', 'Warning message');
logger.error('CategoryName', 'Error message');
logger.debug('CategoryName', 'Debug message'); // Development only
```

### ErrorBoundary
React error boundary component that catches errors and provides recovery options.

```typescript
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### GeminiService Improvements
- Automatic retry with exponential backoff
- Request timeout handling (30 seconds)
- User-friendly error messages
- Comprehensive logging

## Phase 2: Performance Optimization

### OptimizationUtils
Utility functions for performance optimization.

```typescript
import { OptimizationUtils } from './services/performanceService';

// Debounce function
const debouncedFn = OptimizationUtils.debounce(fn, 300);

// Throttle function
const throttledFn = OptimizationUtils.throttle(fn, 1000);

// Idle callback
OptimizationUtils.requestIdleCallback(() => {
  // Low priority work
});
```

### useDebouncedState Hook
Debounced state for input changes.

```typescript
const { value, debouncedValue, setValue, isDirty } = useDebouncedState(
  initialValue,
  500 // delay in ms
);
```

### usePaginatedChat Hook
Pagination for large chat histories.

```typescript
const {
  messages,
  paginatedMessages,
  addMessage,
  goToLastPage,
  getStats,
} = usePaginatedChat(50); // 50 messages per page
```

### LivePreview Optimization
- Memoized component to prevent unnecessary re-renders
- Hash-based change detection
- Debounced refresh (300ms)
- Throttled console log updates (1000ms)
- Limited console logs to 100 entries

## Phase 3: UI/UX Improvements

### LoadingSpinner & Skeleton
Visual loading feedback components.

```typescript
<LoadingSpinner size="md" message="Loading..." />
<Skeleton count={3} height={20} width="100%" />
<ProgressBar progress={65} showLabel={true} />
```

### TypingIndicator
Animated typing feedback for AI responses.

```typescript
<TypingIndicator text="AI is thinking..." variant="dots" />
```

### ErrorNotification
Beautiful error notifications with auto-dismiss.

```typescript
<ErrorNotificationContainer maxNotifications={3} />
```

### Toast System
Lightweight notifications for user feedback.

```typescript
const { toasts, success, error, warning } = useToast();

success('Operation completed!', 3000);
error('Something went wrong', 5000);
warning('Please be careful', 4000);
```

### Enhanced ChatPanel
- Character counter (2000 char limit)
- Message count display
- Improved typing indicators
- Better code copy functionality
- Auto-scroll to new messages

## Phase 4: State Management & Persistence

### StorageService
Type-safe localStorage wrapper with expiration and size tracking.

```typescript
import { getStorageService } from './services/storageService';

const storage = getStorageService();

// Set with expiration (24 hours)
storage.set('myKey', { data: 'value' }, { expires: 86400000 });

// Get with default
const value = storage.get('myKey', defaultValue);

// Check existence
if (storage.has('myKey')) {
  // Key exists
}

// Export/Import
const backup = storage.export();
storage.import(backup);

// Cleanup expired items
const cleaned = storage.cleanExpired();
```

### usePersistentState Hook
State that syncs with localStorage automatically.

```typescript
const [value, setValue, isPersisted] = usePersistentState(
  'myKey',
  initialValue,
  { expires: 86400000 } // 24 hours
);

// Object variant
const [state, updateState, isPersisted] = usePersistentObject(
  'myKey',
  { name: '', age: 0 }
);
updateState({ name: 'John' }); // Merges with existing state

// Array variant
const [items, arrayOps, isPersisted] = usePersistentArray('myKey', []);
arrayOps.push(newItem);
arrayOps.remove(index);
arrayOps.update(index, updatedItem);
```

### useUndoRedo Hook
Complete undo/redo functionality for editors.

```typescript
const {
  value,
  set,
  undo,
  redo,
  canUndo,
  canRedo,
  reset,
  getStats,
} = useUndoRedo(initialValue, 50); // 50 max history items
```

## Phase 5: Advanced Features

### SearchReplaceService
Advanced search and replace with regex support.

```typescript
import { SearchReplaceService } from './services/searchReplaceService';

// Find all matches
const matches = SearchReplaceService.findAll(
  text,
  'searchTerm',
  {
    caseSensitive: false,
    wholeWord: true,
    useRegex: false,
  }
);

// Replace all
const result = SearchReplaceService.replaceAll(
  text,
  'old',
  'new',
  { caseSensitive: false }
);

console.log(result.count); // Number of replacements
console.log(result.replacedText); // New text

// Get suggestions for typos
const suggestions = SearchReplaceService.suggestCorrections(text, 'misspelled');
```

### MarkdownPreview Component
Professional markdown preview with syntax highlighting.

```typescript
<MarkdownPreview
  content={markdownText}
  theme="dark"
/>
```

## Best Practices

### Error Handling
Always use ErrorService for errors that affect user experience:
```typescript
try {
  // operation
} catch (error) {
  const err = error instanceof Error ? error : new Error(String(error));
  errorService.logError(
    err,
    { context: 'operation_name' },
    'User-friendly error message'
  );
}
```

### Logging
Use LoggingService for debugging and monitoring:
```typescript
loggingService.info('FeatureName', 'What happened', { relevantData: 'value' });
```

### Performance
- Use debounce for input changes
- Use throttle for scroll/resize events
- Memoize expensive computations
- Use pagination for large lists
- Lazy load components when possible

### State Persistence
Use persistent state for user preferences and important data:
```typescript
// User settings
const [settings, updateSettings] = usePersistentObject('userSettings', {
  theme: 'dark',
  fontSize: 14,
});
```

### Accessibility
All components include:
- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly markup
- Semantic HTML

## Development Environment

### Environment Variables
```env
VITE_GEMINI_API_KEY=your_api_key_here
```

### Running the Development Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

## Testing

Key areas to test:
1. **Error Handling**: Verify error boundaries catch errors
2. **Performance**: Check render counts and debounce behavior
3. **State Persistence**: Verify data survives page reload
4. **Undo/Redo**: Test history limits and navigation
5. **Search/Replace**: Test regex and special characters
6. **API Integration**: Test retry logic and timeouts

## Contributing

When adding new features:
1. Add proper error handling with ErrorService
2. Add logging with LoggingService
3. Consider performance implications
4. Add accessibility features
5. Test with different themes
6. Document new components/hooks

## Troubleshooting

### Memory Leaks
- Check useEffect cleanup functions
- Ensure event listeners are removed
- Verify timers are cleared

### Performance Issues
- Use React DevTools Profiler
- Check console for unnecessary re-renders
- Review PerformanceService logs
- Consider memoization

### Storage Issues
- Check browser storage quota
- Use cleanExpired() periodically
- Verify JSON serialization

## Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Google Gemini API](https://ai.google.dev)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)

## License

MIT
