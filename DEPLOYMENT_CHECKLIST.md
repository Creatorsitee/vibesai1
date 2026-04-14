# Deployment Checklist: Claude + Gemini Integration

## Pre-Deployment Testing (Local)

### Configuration
- [ ] Added `VITE_GEMINI_API_KEY` to `.env.local`
- [ ] Added `VITE_CLAUDE_API_KEY` to `.env.local` (if using Claude)
- [ ] At least one API key is valid

### Build & Run
- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts without errors
- [ ] Dev server opens at `http://localhost:3000`
- [ ] App loads without console errors

### UI Testing
- [ ] App header displays correctly
- [ ] AI Provider Selector visible in header
- [ ] Provider selector shows available providers
- [ ] Can open provider dropdown
- [ ] Can select different providers
- [ ] Provider switches without errors

### Gemini Testing
- [ ] If Gemini API key is set:
  - [ ] Can send message in chat
  - [ ] Response streams in real-time
  - [ ] Message shows Gemini as provider
  - [ ] Code analysis works
  - [ ] No errors in console

### Claude Testing
- [ ] If Claude API key is set:
  - [ ] Can send message in chat
  - [ ] Response streams in real-time
  - [ ] Message shows Claude as provider
  - [ ] Code analysis works
  - [ ] No errors in console

### Multi-Provider Testing
- [ ] If both providers are set:
  - [ ] Can switch between providers
  - [ ] Both providers work correctly
  - [ ] Switching doesn't lose chat history
  - [ ] Auto-detection works
  - [ ] No race conditions

### Error Handling
- [ ] Invalid API key → shows clear error
- [ ] No API key → shows helpful error
- [ ] Network error → retries automatically
- [ ] Provider unavailable → switches to alternative
- [ ] Timeout error → shows timeout message
- [ ] Error notifications display correctly

### Features
- [ ] Streaming responses work
- [ ] Chat history persists across refresh
- [ ] File explorer works
- [ ] Code editor works
- [ ] Live preview works
- [ ] Character counter works
- [ ] Copy code button works
- [ ] Settings panel works

### Performance
- [ ] App doesn't lag when typing
- [ ] Responses stream smoothly
- [ ] No memory leaks (DevTools)
- [ ] Network requests are efficient
- [ ] UI updates are responsive

## Pre-Deployment Review

### Code Quality
- [ ] No console errors
- [ ] No TypeScript errors (`npm run lint`)
- [ ] All imports are valid
- [ ] No unused imports
- [ ] Code follows project style
- [ ] Comments are clear

### File Validation
- [ ] `src/services/claudeService.ts` exists
- [ ] `src/services/unifiedAIService.ts` exists
- [ ] `src/components/AIProviderSelector.tsx` exists
- [ ] All imports in AppRefactored are correct
- [ ] No circular dependencies

### Documentation
- [ ] `CLAUDE_INTEGRATION.md` reviewed
- [ ] `QUICK_START_CLAUDE.md` reviewed
- [ ] `CLAUDE_SUMMARY.md` reviewed
- [ ] `ARCHITECTURE.txt` reviewed
- [ ] `INTEGRATION_COMPLETE.md` reviewed

## Production Deployment

### Environment Setup
- [ ] Add `VITE_GEMINI_API_KEY` to production env vars
- [ ] Add `VITE_CLAUDE_API_KEY` to production env vars (if using)
- [ ] Verify env vars are set in your hosting:
  - [ ] Vercel: Settings → Environment Variables
  - [ ] Railway: Variables
  - [ ] Heroku: Config Vars
  - [ ] Other: Your platform's env vars section
- [ ] Env vars are NOT committed to git
- [ ] `.env.local` is in `.gitignore`

### Build for Production
- [ ] Run `npm run build` locally
- [ ] Check for build errors
- [ ] Check bundle size is acceptable
- [ ] Verify dist/ folder is created

### Deployment Platform
- [ ] Deploy to production (Vercel, Railway, etc.)
- [ ] Wait for deployment to complete
- [ ] Check deployment logs for errors

### Post-Deployment Testing
- [ ] Visit production URL
- [ ] App loads without errors
- [ ] AI Provider selector is visible
- [ ] Can send message with Gemini
- [ ] Can send message with Claude (if enabled)
- [ ] Can switch between providers
- [ ] Error handling works
- [ ] Check browser console for errors
- [ ] Check Network tab for failed requests

### Monitoring
- [ ] Set up error tracking (if available)
- [ ] Set up performance monitoring
- [ ] Monitor API usage:
  - [ ] Google Cloud Console for Gemini
  - [ ] Anthropic Console for Claude
- [ ] Set up alerts for errors

## Rollback Plan

If something goes wrong:

### Quick Fix (5-10 minutes)
1. [ ] Check env vars are set correctly
2. [ ] Restart the application
3. [ ] Clear browser cache
4. [ ] Test again

### Medium Fix (30 minutes)
1. [ ] Check API key quotas
2. [ ] Verify network connectivity
3. [ ] Check error logs
4. [ ] Try disabling one provider
5. [ ] Restart deployment

### Emergency Rollback
1. [ ] Revert to previous deployment
2. [ ] Or redeploy without Claude integration
3. [ ] Keep Gemini working as fallback
4. [ ] Notify users of issue

```bash
# Rollback command (example for Vercel)
vercel rollback
```

## Monitoring Checklist

After deployment, monitor for:

- [ ] API error rates < 1%
- [ ] Response times < 5 seconds average
- [ ] No error spikes in logs
- [ ] API quota usage within limits
- [ ] User reports of issues

## Post-Deployment Maintenance

### Daily
- [ ] Check error logs
- [ ] Verify both APIs working
- [ ] Monitor response times

### Weekly
- [ ] Review API usage
- [ ] Check cost/quota status
- [ ] Review user feedback

### Monthly
- [ ] Update documentation if needed
- [ ] Review performance metrics
- [ ] Check for API updates
- [ ] Plan for scaling if needed

## Success Criteria

Deployment is successful when:

✅ App loads without errors  
✅ Both AI providers work (if configured)  
✅ Provider switching works smoothly  
✅ Error handling is robust  
✅ Response times are acceptable  
✅ No production errors in logs  
✅ Users can chat successfully  
✅ System is stable for 24+ hours  

## Troubleshooting Commands

### Check Logs
```bash
# Vercel
vercel logs

# Local
npm run dev  # watch console
```

### Debug Environment
```bash
# Show env vars (don't log secrets!)
console.log(import.meta.env.VITE_GEMINI_API_KEY ? 'set' : 'not set')
console.log(import.meta.env.VITE_CLAUDE_API_KEY ? 'set' : 'not set')
```

### Rebuild
```bash
# Clean rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Test API Keys
```bash
# Gemini key test
curl https://api.ai.google/v1/models:list?key=YOUR_KEY

# Claude key test
curl -H "x-api-key: YOUR_KEY" https://api.anthropic.com/v1/messages
```

## Support Resources

### For Issues
- **Gemini**: https://support.google.com/aistudio
- **Claude**: https://support.anthropic.com
- **Vercel**: https://vercel.com/support

### Documentation Links
- Gemini API: https://ai.google.dev/
- Claude API: https://docs.anthropic.com/
- VibesAI Docs: See `CLAUDE_INTEGRATION.md`

## Sign-Off

- [ ] All checks completed
- [ ] Code reviewed by team
- [ ] Deployment approved
- [ ] Ready for production

**Deployed by**: ________________  
**Deployment date**: ________________  
**Notes**: ________________________________________________  

---

**If all checks pass → You're ready to deploy! 🚀**
