# Deployment Command Reference & Checklist

**Copy-paste commands and quick checklist for deployment**

---

## Pre-Deployment Checklist

### Backend (`src/server.js`)
- [ ] Uses `process.env.PORT || 5000`
- [ ] Has `/` health check endpoint
- [ ] CORS enabled for frontend domain
- [ ] All routes working locally

### Frontend (Next.js)
- [ ] Uses `process.env.NEXT_PUBLIC_API_URL`
- [ ] All API calls use env var (not hardcoded)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` env var
- [ ] Builds without errors: `npm run build`

### Git
- [ ] Code committed: `git add . && git commit -m "Deploy to Render/Vercel"`
- [ ] Pushed to main: `git push origin main`
- [ ] `.env` is in `.gitignore`
- [ ] `node_modules/` is in `.gitignore`

---

## Step-by-Step Deployment

### 1. Deploy Backend to Render

```bash
# Terminal 1: Push code
cd backend/  # or your backend directory
git push origin main

# Browser: Go to https://render.com
# - Click New → Web Service
# - Select your backend repo
# - Name: spherekings-backend
# - Environment: Node
# - Build: npm install
# - Start: npm start
# - Click Deploy

# Wait for "Active" status (2-5 min)
# Get URL: https://spherekings-backend.onrender.com
```

### 2. Add Render Environment Variables

```bash
# In Render Dashboard → spherekings-backend → Environment
# Add these:

NODE_ENV=production
PORT=10000

# Stripe (test keys)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx (create below)
STRIPE_WEBHOOK_SECRET_RAFFLE=whsec_test_xxxxx (create below)
STRIPE_SPONSORSHIP_WEBHOOK_SECRET=whsec_test_xxxxx (create below)

# Database
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
DATABASE_URL=your_database_url

# Then: Click Save
```

### 3. Deploy Frontend to Vercel

```bash
# Terminal: Push code
cd frontend/  # or your frontend directory
git push origin main

# Browser: Go to https://vercel.com
# - Click New Project
# - Select frontend repo
# - Framework: Next.js (auto-detected)
# - Click Deploy

# Wait for deployment (3-10 min)
# Get URL: https://spherekings-frontend.vercel.app
```

### 4. Add Vercel Environment Variables

```bash
# In Vercel Dashboard → Settings → Environment Variables
# Add these:

NEXT_PUBLIC_API_URL=https://spherekings-backend.onrender.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Then: Deployments → Redeploy latest
# Wait for redeploy (1-3 min)
```

### 5. Create Stripe Test Webhooks

```bash
# Browser: https://dashboard.stripe.com
# - Click Test mode toggle (ON)
# - Click Developers → Webhooks

# WEBHOOK 1: Checkout
# - Add endpoint
# - URL: https://spherekings-backend.onrender.com/api/checkout/webhook
# - Events: 
#   - payment_intent.succeeded
#   - payment_intent.payment_failed
#   - checkout.session.completed
#   - charge.refunded
# - Copy Signing Secret: whsec_test_xxxxx

# WEBHOOK 2: Raffle
# - Add endpoint
# - URL: https://spherekings-backend.onrender.com/api/raffle/webhook
# - Events: checkout.session.completed, payment_intent.succeeded
# - Copy Signing Secret: whsec_test_xxxxx

# WEBHOOK 3: Sponsorship
# - Add endpoint
# - URL: https://spherekings-backend.onrender.com/api/sponsorship/webhook
# - Events: checkout.session.completed, payment_intent.succeeded, charge.refunded
# - Copy Signing Secret: whsec_test_xxxxx
```

### 6. Update Render with Webhook Secrets

```bash
# In Render Dashboard → spherekings-backend → Environment
# Update:
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx (from webhook 1)
STRIPE_WEBHOOK_SECRET_RAFFLE=whsec_test_xxxxx (from webhook 2)
STRIPE_SPONSORSHIP_WEBHOOK_SECRET=whsec_test_xxxxx (from webhook 3)

# Click Save
# Service auto-redeploys
```

---

## Testing

### Test Backend Connectivity

```bash
# Terminal or Browser
curl https://spherekings-backend.onrender.com/

# Should return 200 OK (not error)
```

### Test Frontend Deployment

```bash
# Browser: Open
https://spherekings-frontend.vercel.app

# Page should load without errors
# Check Console for API connection
```

### Test API Connection

```bash
# In browser Developer Tools → Network tab
# Make any API call (login, fetch products, etc.)
# Should show 200 OK responses (not 404 or 503)
```

### Test Stripe Payment (the big one!)

```bash
# Browser: https://spherekings-frontend.vercel.app
# 1. Add product to cart
# 2. Click Checkout
# 3. Card number: 4242 4242 4242 4242
# 4. Expiry: Any future date (12/25)
# 5. CVC: Any 3 digits (123)
# 6. Click Pay
# 7. Should see success page ✅
# 8. Check Stripe Dashboard → should see transaction
# 9. Check Render logs → should see webhook received
# 10. Check database → order should exist
```

---

## Verification Commands

```bash
# After deployment, run these to verify everything works

# 1. Backend is accessible
echo "Testing backend..."
curl https://spherekings-backend.onrender.com/ -v

# 2. Frontend is accessible
echo "Testing frontend..."
curl https://spherekings-frontend.vercel.app/ -I

# 3. Stripe test mode is ON
echo "Go to Stripe Dashboard and verify Test mode toggle is ON"

# 4. Webhooks registered
echo "Go to Stripe → Developers → Webhooks"
echo "Should see 3 endpoints with Render URL"

# 5. Environment variables set
echo "Render → Environment should have all Stripe keys"
echo "Vercel → Environment should have API_URL and publishable key"
```

---

## Troubleshooting Quick Commands

```bash
# If backend shows error
Render Dashboard → spherekings-backend → Logs
# Look for error messages - fix and redeploy

# If frontend not connecting to backend
Vercel Dashboard → Deployments → Build Logs
# Check NEXT_PUBLIC_API_URL is set correctly

# If webhooks not received
Stripe Dashboard → Developers → Webhooks → [endpoint] → Events
# Check if red X (failed) or green ✓ (success)

# If payment fails
Stripe Dashboard → Payments → [transaction]
# Check decline reason and error
```

---

## Emergency Redeploy

If something breaks:

```bash
# Backend: Force redeploy from Render
Render Dashboard → spherekings-backend → Manual Deploy

# Frontend: Force redeploy from Vercel
Vercel Dashboard → Deployments → [latest] → Redeploy

# Or from git:
git push origin main
# (Both services auto-rebuild)
```

---

## URLs Reference

```
Frontend:  https://spherekings-frontend.vercel.app
Backend:   https://spherekings-backend.onrender.com

Webhooks:
- Checkout: https://spherekings-backend.onrender.com/api/checkout/webhook
- Raffle:   https://spherekings-backend.onrender.com/api/raffle/webhook
- Sponsorship: https://spherekings-backend.onrender.com/api/sponsorship/webhook

Dashboards:
- Render:   https://render.com/dashboard
- Vercel:   https://vercel.com/dashboard
- Stripe:   https://dashboard.stripe.com
```

---

## Environment Variables Checklist

### Render Backend

```
✅ NODE_ENV=production
✅ PORT=10000
✅ STRIPE_SECRET_KEY=sk_test_xxxxx
✅ STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
✅ STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx
✅ STRIPE_WEBHOOK_SECRET_RAFFLE=whsec_test_xxxxx
✅ STRIPE_SPONSORSHIP_WEBHOOK_SECRET=whsec_test_xxxxx
✅ MONGODB_URI=[connection string]
✅ JWT_SECRET=[secret]
✅ All other required vars...
```

### Vercel Frontend

```
✅ NEXT_PUBLIC_API_URL=https://spherekings-backend.onrender.com
✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

---

## Git Commands (if using Git flow)

```bash
# Standard deployment flow
git checkout main
git pull origin main
git add .
git commit -m "Deploy: Configure Render/Vercel webhooks"
git push origin main

# Both services auto-redeploy

# Check git status
git status

# See recent commits
git log --oneline -5
```

---

## Timeline Expectation

| Step | Time |
|------|------|
| 1. Deploy backend to Render | 2-5 min |
| 2. Add Render env vars | 1 min |
| 3. Deploy frontend to Vercel | 3-10 min |
| 4. Add Vercel env vars | 1 min |
| 5. Create Stripe webhooks | 5 min |
| 6. Update Render webhooks | 1 min |
| 7. Test everything | 10-15 min |
| **TOTAL** | **~30-40 min** |

---

## Success Indicators ✅

All of these should be true:

- ✅ Render service shows "Active" (green)
- ✅ Vercel deployment shows "Ready" (green)
- ✅ Frontend page loads at vercel.app URL
- ✅ Frontend console shows no errors
- ✅ API calls return 200 (not 404/503)
- ✅ Stripe Test mode toggle is ON
- ✅ Stripe shows 3 webhooks with Render URLs
- ✅ Test payment with 4242 card succeeds
- ✅ Order appears in database after payment
- ✅ Stripe webhook shows success in Events
- ✅ Render logs show webhook processing

**If all ✅ → You're deployed!** 🎉

---

## Next Steps After Deployment

1. **Perform UAT Testing**
   - Test all critical flows (login, checkout, raffle entry, etc.)
   - Test on different browsers/devices
   - Test on mobile

2. **Monitor**
   - Watch Render logs for errors
   - Monitor Stripe Dashboard for failed payments
   - Check database for data integrity

3. **Backup Plans**
   - Save all URLs (backend, frontend)
   - Save all API keys/secrets safely
   - Document any custom configurations

4. **When Going Live**
   - Get live keys from client
   - Create live webhooks in Stripe (same URLs!)
   - Update Render & Vercel env vars
   - Test one real transaction
   - Deploy

---

## File Locations Quick Ref

```
Backend config:
- Entry: src/server.js
- Env: .env (not committed)
- Package: package.json (has "start" script)

Frontend config:
- Next config: next.config.js
- Env: .env.local (not committed)
- Package: package.json
- API base: process.env.NEXT_PUBLIC_API_URL

Stripe config:
- Backend routes: src/routes/webhookRoutes.js
- Services: src/services/checkoutService.js, raffleService.js
- Middleware: src/server.js (webhook handling)
```

---

**You got this! Deploy and celebrate! 🚀**
