# Spherekings Frontend Auth - Quick Start Commands

**Status:** ✅ Ready to Use  
**Date:** March 14, 2026

---

## ⚡ Quick Setup (Copy & Paste)

### 1. Install Dependencies
```bash
npm install
```

**What it does:** Installs all required packages from package.json

**Expected output:**
```
added XXXX packages
audited XXXX packages
found 0 vulnerabilities
```

---

### 2. Verify Environment Setup
```bash
# Check Node version
node --version
# Should show: v16.8.0 or higher

# Check npm version
npm --version
# Should show: v8.0.0 or higher

# List environment files
ls -la | grep .env
# Should show: .env.local
```

---

### 3. Start Development Server
```bash
npm run dev
```

**What it does:** Starts Next.js development server on port 3000

**Expected output:**
```
> next dev
  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 1234ms
```

**Keep this terminal open!** Server runs until you press Ctrl+C

---

### 4. Verify Backend is Running

**In a NEW terminal:**
```bash
# Test backend connection
curl http://localhost:5000/api/v1/health
# If backend running, you'll get a response
# If not, start backend first
```

---

### 5. Open Browser & Test

**URL:** http://localhost:3000

### Test each page:

#### A. **Registration Page**
```
http://localhost:3000/register
```

Test data:
```
Email: test@example.com
First Name: John
Last Name: Doe
Phone: +1234567890
Password: MyPassword123!
Confirm: MyPassword123!
```

Click "Create Account" → Should redirect to /dashboard

#### B. **Login Page**
```
http://localhost:3000/login
```

Test data:
```
Email: test@example.com
Password: MyPassword123!
```

Click "Sign In" → Should redirect to /dashboard

#### C. **Dashboard Page**
```
http://localhost:3000/dashboard
```

If not logged in → Redirects to /login  
If logged in → Shows user information

#### D. **Forgot Password**
```
http://localhost:3000/forgot-password
```

Enter email → Get success message

#### E. **Reset Password**
```
http://localhost:3000/reset-password/{token}
```

(Only works with valid token from backend)

---

## 🔍 Debugging Commands

### Check File Structure
```bash
# List all source files
find src -type f -name "*.jsx" -o -name "*.js"

# Check if env file exists
cat .env.local

# Count total files
find src -type f | wc -l
```

### Clear Cache & Restart
```bash
# Stop server: Press Ctrl+C
# Then:

# Clear Next.js cache
rm -rf .next

# Clear node_modules (if issues persist)
rm -rf node_modules
npm install

# Restart server
npm run dev
```

### Check Port Usage
```bash
# MacOS/Linux - See what's using port 3000
lsof -i :3000

# Windows - See what's using port 3000
netstat -ano | findstr :3000

# Kill process (get PID from above, change 1234)
kill -9 1234  # MacOS/Linux
taskkill /PID 1234 /F  # Windows
```

---

## 🧪 Testing Workflows

### Workflow 1: Complete Registration & Login Cycle

```bash
# Terminal 1: Start frontend
npm run dev

# Terminal 2: Watch backend logs (if applicable)
tail -f backend-logs.txt  # or your backend log location

# Browser actions:
# 1. Go to http://localhost:3000/register
# 2. Fill form with test data
# 3. Click "Create Account"
# 4. Check:
#    - Browser console (F12) for errors
#    - Network tab (F12 → Network) for POST request
#    - Backend logs for incoming request
#    - Toast notification appears
#    - Redirects to /dashboard
# 5. Check localStorage:
#    - F12 → Application → localStorage
#    - Look for spherekings_access_token
```

### Workflow 2: Token Persistence Test

```bash
# 1. Login successfully
# 2. Refresh page (Ctrl+R or Cmd+R)
# 3. Should still be logged in (no redirect to login)
# 4. Open DevTools → Application → localStorage
# 5. Verify tokens still there
# 6. Close browser
# 7. Reopen browser, go to http://localhost:3000
# 8. May redirect to login (depends on token expiry)
```

### Workflow 3: Protected Route Test

```bash
# 1. Clear localStorage
#    - DevTools → Application → localStorage → click each entry → Delete
# 2. Try accessing http://localhost:3000/dashboard
# 3. Should redirect to http://localhost:3000/login
# 4. This confirms protection is working
```

### Workflow 4: Error Handling Test

```bash
# 1. Go to http://localhost:3000/login
# 2. Try invalid combinations:
#    - Wrong email format: enter "notanemail"
#    - Password too short: enter "123"
#    - Both fields empty: click submit
# 3. Should show error for each field
# 4. Try valid email but wrong password
# 5. Should show "Invalid credentials" or similar
```

---

## 📊 Monitoring Commands

### View Real-Time Logs

```bash
# Terminal - Your Next.js server logs
# (Already visible in npm run dev terminal)

# Browser - Console logs
# Open DevTools: F12 → Click Console tab

# Browser - Network requests
# Open DevTools: F12 → Click Network tab
# Then perform action (login, register, etc)
```

### Check Performance

```bash
# Browser - Lighthouse audit
# Open DevTools: F12 → Click Lighthouse tab
# Select "Desktop" or "Mobile"
# Click "Analyze page load"
# Get performance scores
```

### Memory Usage

```bash
# MacOS/Linux
top -p $(pgrep -f "node.*next")

# Windows
# Open Task Manager (Ctrl+Shift+Esc)
# Find "node.exe" process
# Check memory usage
```

---

## 🚀 Build & Deploy

### Build for Production

```bash
# Create optimized build
npm run build

# Output should show:
# ✓ Compiled successfully
# ✓ Exported to .next
# ✓ File sizes with optimizations
```

### Test Production Build Locally

```bash
# Build
npm run build

# Start production server
npm run start

# Open http://localhost:3000
# Test all features
# Press Ctrl+C to stop
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Answer prompts:
# ✓ Which scope? (your account)
# ✓ Link to existing project? (no, for first time)
# ✓ Project name? (spherekings-frontend)
# ✓ Confirm settings? (yes)

# Result: Your app is live at https://spherekings-frontend-xxx.vercel.app
```

---

## 📝 Useful Git Commands

### Track Changes

```bash
# Check status
git status

# See what changed
git diff

# See which files changed
git diff --name-only
```

### Make Commits

```bash
# Stage all changes
git add .

# Create commit
git commit -m "Add authentication system"

# Push to GitHub
git push origin main
```

### View History

```bash
# See recent commits
git log --oneline -10

# See commits by date
git log --since="2 weeks ago"

# Who changed what
git blame src/app/layout.jsx
```

---

## 🔧 Configuration Adjustments

### Change API URL

```bash
# Edit .env.local
# Find: NEXT_PUBLIC_API_URL=
# Change to your API URL (without /api/v1)

# Example for production:
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

### Change Port (if 3000 in use)

```bash
# MacOS/Linux
PORT=3001 npm run dev

# Windows (PowerShell)
$env:PORT=3001; npm run dev

# Then open: http://localhost:3001
```

### Enable Verbose Logging

```bash
# Add to next.config.js
module.exports = {
  experimental: {
    logging: 'verbose'
  }
}

# Restart: npm run dev
# More detailed logs in terminal
```

---

## 🆘 Emergency Commands

### When Everything Breaks

```bash
# Step 1: Stop server
# Ctrl+C in terminal

# Step 2: Clear everything
rm -rf .next node_modules

# Step 3: Reinstall
npm install

# Step 4: Restart
npm run dev

# Step 5: If still broken, check .env.local
cat .env.local
# Should have NEXT_PUBLIC_API_URL set
```

### Reset Database Tokens (from browser)

```javascript
// Paste into browser console (F12 → Console)
localStorage.removeItem('spherekings_access_token');
localStorage.removeItem('spherekings_refresh_token');
localStorage.removeItem('spherekings_token_expiry');
console.log('Tokens cleared. Refresh page.');
location.reload();
```

### Check All Environment Variables

```bash
# Show all variables
env | grep NEXT_PUBLIC

# Should show:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
# NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📈 Performance Optimization Commands

```bash
# Analyze bundle size
npm run build
npm run analyze  # If analyzer installed

# Check for unused imports
npm run lint  # If ESLint configured

# Format code
npm run format  # If Prettier configured
```

---

## 🔐 Security Checks

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Check outdated packages
npm outdated

# Update packages (careful!)
npm update
```

---

## 📞 Support Contacts

| Issue Type | Solution |
|-----------|----------|
| Port 3000 in use | Kill process using `lsof -i :3000` |
| Module not found | Check import path, verify file exists |
| Authentication fails | Check backend running & .env.local correct |
| Build errors | Run `rm -rf .next` then `npm run build` |
| Token issues | Clear localStorage, login again |
| Layout issues | Check responsive breakpoints in DevTools |
| API timeout | Check backend connection & network tab |

---

## ✅ Success Checklist

After running all commands, verify:

- [ ] `npm install` completed without errors
- [ ] `npm run dev` started server on port 3000
- [ ] Browser opened to http://localhost:3000
- [ ] Registration page loaded
- [ ] Login page loaded
- [ ] Could register new user successfully
- [ ] Could login with credentials
- [ ] Dashboard displayed user info
- [ ] Tokens visible in localStorage
- [ ] Protected routes working
- [ ] No console errors (F12 → Console)
- [ ] Network requests succeeding (F12 → Network)

---

**Status:** ✅ Ready to Go!  
**Time to complete:** ~5-10 minutes  
**Next step:** Run `npm run dev` and start testing!
