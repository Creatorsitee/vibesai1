# VibesAI - Troubleshooting Guide

## Common Issues & Solutions

### 🔴 Critical Issues

#### 1. "API Key Not Configured" Message

**Symptoms:** 
- Chat view shows red error box with "API Key Not Configured"
- AI assistant is disabled
- Cannot create projects with AI

**Solution:**
1. Create a `.env.local` file in the project root:
   ```bash
   touch .env.local
   ```

2. Add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   APP_URL=http://localhost:3000
   ```

3. Get API key from: https://aistudio.google.com
   - Sign in with Google
   - Click "Create API Key"
   - Copy the key (keep it secret!)

4. Restart dev server:
   ```bash
   npm run dev
   ```

5. Refresh browser (Ctrl+R or Cmd+R)

---

#### 2. "Cannot read property of undefined" Errors

**Symptoms:**
- Browser console shows TypeError
- Some features not working
- App crashes on certain actions

**Solution:**
```bash
# Clear browser cache and localStorage
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Clear site data"
4. Clear both "Cookies" and "Local Storage"
5. Refresh page (Ctrl+R)

# Or use console:
localStorage.clear();
location.reload();
```

---

#### 3. White Blank Screen

**Symptoms:**
- App shows completely blank page
- No error in console (sometimes)
- Doesn't respond to clicks

**Solution:**
```bash
# Step 1: Check browser console
1. Press F12 to open DevTools
2. Click "Console" tab
3. Look for red error messages
4. Note the error and search for it below

# Step 2: Hard refresh
Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

# Step 3: Clear and restart
1. Delete node_modules: rm -rf node_modules
2. Reinstall: npm install
3. Restart: npm run dev
```

---

### 🟡 Common Issues

#### 4. Port 3000 Already in Use

**Symptoms:**
- Error: "Port 3000 already in use"
- Dev server won't start

**Solution:**

Option A - Use different port:
```bash
npm run dev -- --port 3001
# App will run on http://localhost:3001
```

Option B - Kill process on port 3000:
```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process (get PID from above)
kill -9 <PID>

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

#### 5. API Quota Exceeded

**Symptoms:**
- Error: "⚠️ API Quota Exceeded"
- Message: "You have reached the rate limit"
- AI stops responding

**Solution:**
1. **Check your quota:**
   - Go to https://aistudio.google.com
   - Check "Quota" in your account settings
   - Free tier has limited requests

2. **Wait for reset:**
   - Quotas reset daily or monthly
   - Check the specific reset time

3. **Upgrade plan (if needed):**
   - Free tier: ~60 requests/minute
   - Paid tier: Higher limits
   - See pricing at https://ai.google.dev

4. **Workaround:**
   - Use lighter models (Gemini Flash Lite)
   - Reduce request size
   - Wait 24 hours for quota reset

---

#### 6. Files Not Saving

**Symptoms:**
- Make edits to file
- Changes disappear on refresh
- localStorage errors in console

**Solution:**
```bash
# Check browser storage limits
1. Open DevTools (F12)
2. Application → Local Storage
3. Check available space

# Clear old data
1. Click Settings (gear icon)
2. Click "Reset All Data"
3. Confirm deletion
4. App will reload fresh

# Or manually:
localStorage.clear();
location.reload();
```

---

#### 7. Live Preview Not Working

**Symptoms:**
- Preview shows "Empty Workspace"
- HTML doesn't render
- Styles not applied

**Solution:**
1. **Check if you have index.html:**
   - Click "Preview" in sidebar
   - File explorer should show `/index.html`
   - If not, ask AI: "Create a basic HTML page"

2. **Click Refresh:**
   - Top-right corner of preview
   - Button with icon: ⟲

3. **Check console for errors:**
   - Preview has a "Console" button
   - Click it to see JavaScript errors

4. **Verify CSS imports:**
   - HTML should link CSS: `<link rel="stylesheet" href="/styles.css">`
   - JavaScript should import: `<script src="/main.js"></script>`
   - Paths must start with `/`

---

#### 8. AI Not Responding

**Symptoms:**
- Chat input doesn't work
- "Sedang berpikir..." spins forever
- No response from AI

**Solution:**

Check 1 - API Key:
```
Make sure .env.local has GEMINI_API_KEY set
```

Check 2 - Network:
```
1. Open DevTools → Network tab
2. Type message in chat
3. Look for requests to Google API
4. Check if requests complete
```

Check 3 - Quota:
```
Check API quota in Google AI Studio
May have hit daily/monthly limit
```

Check 4 - Browser:
```
Try a different browser or incognito mode
Some extensions might block requests
```

Check 5 - Clear cache:
```bash
# Full reset
rm -rf node_modules
npm install
npm run dev
```

---

#### 9. Monaco Editor Not Loading

**Symptoms:**
- Code editor is blank
- Can't see code
- No line numbers

**Solution:**
```bash
# Restart dev server
1. Stop server (Ctrl+C)
2. npm install
3. npm run dev

# If still broken:
1. Clear node_modules
2. npm install
3. Check for @monaco-editor/react errors in console
```

---

#### 10. Dark Mode Not Toggling

**Symptoms:**
- Button doesn't switch theme
- Dark mode settings not saving
- Theme always shows same color

**Solution:**
```javascript
// Check in browser console
localStorage.getItem('ide_theme')
// Should return 'dark' or 'light'

// Reset theme:
localStorage.setItem('ide_theme', 'light');
location.reload();
```

---

### 🟢 Build & Deployment Issues

#### 11. Build Fails

**Symptoms:**
- `npm run build` shows errors
- TypeScript errors
- Vite bundling failures

**Solution:**
```bash
# Check TypeScript errors
npm run lint

# Fix common issues
1. Clear cache: npm run clean
2. Reinstall: npm install
3. Rebuild: npm run build

# Debug build
npm run build -- --debug
```

---

#### 12. Production Deployment Issues

**Symptoms:**
- App works locally but not on deployed server
- 404 errors
- API key not working on production

**Solution:**

1. **Set environment variables on Vercel:**
   - Go to Project Settings
   - Environment Variables
   - Add: `GEMINI_API_KEY=your_key`
   - Add: `APP_URL=your_production_url`

2. **Check base URL:**
   - Make sure vite.config.ts has correct base URL
   - Test with: `npm run build && npm run preview`

3. **CORS issues:**
   - Gemini API should work from any domain
   - Check browser console for CORS errors
   - May need to allow your domain in Google Cloud

---

## Debug Checklist

Use this when you're stuck:

- [ ] Checked browser console for errors (F12)
- [ ] Verified `.env.local` exists with GEMINI_API_KEY
- [ ] Refreshed page (Ctrl+R or Cmd+R)
- [ ] Hard refresh cleared cache (Ctrl+Shift+R)
- [ ] Restarted dev server (`npm run dev`)
- [ ] Checked API key is valid (test at https://aistudio.google.com)
- [ ] Verified API quota not exceeded
- [ ] Cleared localStorage (see issue #6)
- [ ] Tried in different browser or incognito
- [ ] Updated all dependencies (`npm install`)

---

## Still Stuck?

### Where to Get Help

1. **Check the logs:**
   ```bash
   # Browser console
   F12 → Console tab
   
   # Dev server logs
   Terminal running npm run dev
   ```

2. **Read the docs:**
   - `SETUP_GUIDE.md` - Complete setup instructions
   - `README.md` - Features and overview
   - `BUG_FIXES.md` - Recent fixes made

3. **Try these commands:**
   ```bash
   # See what's in localStorage
   npm run dev
   # Then in browser console:
   console.log(JSON.parse(localStorage.getItem('ide_projects')))
   
   # Check environment variables loaded
   console.log(process.env.GEMINI_API_KEY)
   ```

4. **Reset everything:**
   ```bash
   # Warning: This deletes all local projects!
   rm -rf node_modules package-lock.json
   npm install
   npm run dev
   
   # Clear all browser data
   # DevTools → Application → Clear site data
   ```

---

## Performance Issues

### App is Slow

**Solution:**
1. Check number of files:
   - Lots of files slow down file explorer
   - Delete unused projects
   - Split large project into smaller ones

2. Clear console logs:
   - Console stores last 50 logs
   - Click trash icon in console to clear

3. Optimize settings:
   - Settings → Font Size (don't go too large)
   - Close unused tabs in editor
   - Minimize file explorer when not needed

---

## Browser Compatibility

### Works Best On:
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ⚠️ Mobile browsers (limited features)

### Known Issues:
- Mobile: Limited preview width
- Safari: Some CSS edge cases
- Internet Explorer: Not supported

---

## Still Need Help?

### Useful Information to Have:
- Browser name and version
- Operating system (Windows/Mac/Linux)
- Error message (exact text)
- Steps to reproduce
- Console errors (screenshot or copy-paste)

### Resources:
- Google AI Studio: https://aistudio.google.com
- Gemini API Docs: https://ai.google.dev
- Vite Docs: https://vitejs.dev
- React Docs: https://react.dev

---

**Last Updated:** 2026-04-14
**Version:** 1.0.0
