# Deployment Guide: Backend on Render + Frontend on Vercel + Stripe Webhooks

**Complete step-by-step guide to deploy and switch from ngrok to production URLs**

---

## Overview

```
OLD SETUP (Development):
ngrok → localhost backend → Stripe test webhooks

NEW SETUP (Production/Staging):
Render backend → Stripe test webhooks
Vercel frontend → Render backend API
```

---

# PART 1: Deploy Backend to Render

## Step 1.1: Prepare Your Backend for Render

### Create Render-Compatible Files

**Create `render.yaml` in your project root:**

```yaml
services:
  - type: web
    name: spherekings-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm run start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
    healthCheckPath: /
```

**Ensure `package.json` has:**

```json
{
  "scripts": {
    "dev": "node src/server.js",
    "start": "node src/server.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

**Update `src/server.js` to use environment PORT:**

```javascript
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

### Check .gitignore

Make sure `.env` is ignored:

```
.env
.env.local
.env.*.local
node_modules/
dist/
build/
```

---

## Step 1.2: Push Code to GitHub

Render deploys directly from GitHub, so your code must be there.

```bash
# From your project root
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

---

## Step 1.3: Create Render Account & Deploy

1. Go to **https://render.com**
2. Click **Sign Up** (use GitHub account for easier connection)
3. Authorize Render to access your GitHub repos

### Deploy Backend

1. In Render Dashboard, click **New +** → **Web Service**
2. Select your GitHub repository
3. Fill in:
   - **Name**: `spherekings-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Choose **Plan**: Free or Paid (free is limited but works for testing)
5. Click **Create Web Service**

**⏳ Wait for deployment** (2-5 minutes)

✅ You'll get a URL like: `https://spherekings-backend.onrender.com`

---

## Step 1.4: Add Environment Variables to Render

1. In your Render service dashboard
2. Go to **Environment** (left sidebar)
3. Add these variables:

```
NODE_ENV=production
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx (you'll get this later)
STRIPE_WEBHOOK_SECRET_RAFFLE=whsec_test_xxxxx
STRIPE_SPONSORSHIP_WEBHOOK_SECRET=whsec_test_xxxxx
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
DATABASE_URL=your_database_url
```

**Don't use ngrok URL anymore** ❌

4. Click **Save**

✅ Service automatically redeploys with new environment variables

---

## Step 1.5: Test Your Backend

Open in browser:
```
https://spherekings-backend.onrender.com/
```

Should return your health check response. ✅

---

# PART 2: Deploy Frontend to Vercel

## Step 2.1: Prepare Frontend for Vercel

### Check Next.js Configuration

Your `next.config.js` should have:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
};

module.exports = nextConfig;
```

### Update API URLs in Code

Find all references to your backend and update:

**Before (ngrok/localhost):**
```javascript
const API_URL = 'http://localhost:5000';
// or
const API_URL = 'https://xyz.ngrok.io';
```

**After (Render):**
```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://spherekings-backend.onrender.com';
```

### Create `.env.example` (for reference):

```
NEXT_PUBLIC_API_URL=https://spherekings-backend.onrender.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

### Commit Changes

```bash
git add .
git commit -m "Update API URLs for Render backend"
git push origin main
```

---

## Step 2.2: Create Vercel Account & Deploy

1. Go to **https://vercel.com**
2. Click **Sign Up** (use GitHub for easier connection)
3. Authorize Vercel to access your GitHub repos

### Deploy Frontend

1. In Vercel Dashboard, click **New Project**
2. Select your frontend repository
3. Framework: **Next.js** (should be auto-detected)
4. Click **Deploy**

**⏳ Wait for deployment** (3-10 minutes)

✅ You'll get a URL like: `https://spherekings-frontend.vercel.app`

---

## Step 2.3: Add Environment Variables to Vercel

1. In your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Add:

```
NEXT_PUBLIC_API_URL=https://spherekings-backend.onrender.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

4. Click **Save**
5. Go back to **Deployments** and redeploy (click **Redeploy** on latest)

✅ Frontend now connects to Render backend

---

## Step 2.4: Test Frontend Connection

1. Open your Vercel URL: `https://spherekings-frontend.vercel.app`
2. Try logging in or accessing API endpoint
3. Should work! ✅

If API calls fail:
- Check Vercel environment variables
- Check Render backend logs
- Test API URL directly in browser

---

# PART 3: Setup Stripe Webhooks with Render URL

## Step 3.1: Get Your Render Backend URL

From Render dashboard:
```
Your backend URL: https://spherekings-backend.onrender.com
```

---

## Step 3.2: Create Stripe Webhook Endpoints (Test Mode)

### Important: Enable Test Mode First

1. Go to **Stripe Dashboard**: https://dashboard.stripe.com
2. Look for **Test mode** toggle (top left or right)
3. Turn it **ON** ✅

---

## Step 3.3: Create Webhook #1 - Product/Checkout

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter webhook URL:

```
https://spherekings-backend.onrender.com/api/checkout/webhook
```

4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `charge.refunded`

5. Click **Add endpoint**
6. Copy the **Signing Secret** (starts with `whsec_test_`)

**Save this as**: `STRIPE_WEBHOOK_SECRET`

---

## Step 3.4: Create Webhook #2 - Raffle

1. Click **Add endpoint** again
2. Enter URL:

```
https://spherekings-backend.onrender.com/api/raffle/webhook
```

3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`

4. Copy **Signing Secret** (whsec_test_)

**Save as**: `STRIPE_WEBHOOK_SECRET_RAFFLE`

---

## Step 3.5: Create Webhook #3 - Sponsorship

1. Click **Add endpoint** again
2. Enter URL:

```
https://spherekings-backend.onrender.com/api/sponsorship/webhook
```

3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `charge.refunded`

4. Copy **Signing Secret** (whsec_test_)

**Save as**: `STRIPE_SPONSORSHIP_WEBHOOK_SECRET`

---

## Step 3.6: Update Render Environment with Webhook Secrets

1. Go back to **Render Dashboard**
2. Select your backend service
3. Go to **Environment**
4. Update:

```
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx
STRIPE_WEBHOOK_SECRET_RAFFLE=whsec_test_xxxxx
STRIPE_SPONSORSHIP_WEBHOOK_SECRET=whsec_test_xxxxx
```

5. Click **Save**

✅ Service automatically redeploys

---

# PART 4: Update Environment Configuration

## Step 4.1: Local .env File (for testing locally)

Keep your local `.env` with ngrok or localhost for development:

```bash
# Local Development Only
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx
STRIPE_WEBHOOK_SECRET_RAFFLE=whsec_test_xxxxx
STRIPE_SPONSORSHIP_WEBHOOK_SECRET=whsec_test_xxxxx

# Use localhost for local development
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://localhost:27017/spherekings
JWT_SECRET=your-dev-secret
```

---

## Step 4.2: Render Configuration (Production/Staging)

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` (Render's default) |
| `STRIPE_SECRET_KEY` | `sk_test_xxxxx` |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_xxxxx` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_test_xxxxx` |
| `STRIPE_WEBHOOK_SECRET_RAFFLE` | `whsec_test_xxxxx` |
| `STRIPE_SPONSORSHIP_WEBHOOK_SECRET` | `whsec_test_xxxxx` |
| `MONGODB_URI` | Your production MongoDB URL |
| `JWT_SECRET` | Your production JWT secret |

---

## Step 4.3: Vercel Configuration (Frontend)

| Variable | Public? | Value |
|----------|---------|-------|
| `NEXT_PUBLIC_API_URL` | ✅ Yes | `https://spherekings-backend.onrender.com` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ Yes | `pk_test_xxxxx` |

✅ **Public** = Safe to expose in frontend code

---

# PART 5: Testing the Full Integration

## Step 5.1: Test Webhook Delivery

### From Stripe Dashboard:

1. Go to **Developers** → **Webhooks**
2. Click on your **Checkout webhook** endpoint
3. Scroll to **Events**
4. You should see:
   - Green checkmarks ✅ = Successfully delivered
   - Red X ❌ = Failed delivery

If failed:
- Check your Render logs
- Verify webhook URL is correct
- Make sure endpoint accepts POST requests

---

## Step 5.2: Make a Test Payment

1. Go to your Vercel frontend: `https://spherekings-frontend.vercel.app`
2. Add product to cart
3. Click **Checkout**
4. Use test card: **4242 4242 4242 4242**
5. Expiry: Any future date
6. CVC: Any 3 digits
7. Click **Pay**

**Expected results:**

✅ Payment succeeds  
✅ Redirect to success page  
✅ Order created in database  
✅ Webhook received in Stripe Dashboard  
✅ Webhook log shows in Render logs  

---

## Step 5.3: Check Render Logs

1. Go to **Render Dashboard** → Your Service
2. Click **Logs** tab
3. Should see:

```
[WEBHOOK] Received checkout.session.completed
[WEBHOOK] Processing payment for order XXX
[WEBHOOK] Order created successfully
```

---

## Step 5.4: Test Different Scenarios

| Scenario | Card Number | Expected Result |
|----------|-------------|-----------------|
| Success | 4242 4242 4242 4242 | ✅ Payment succeeds |
| Declined | 4000 0000 0000 0002 | ❌ Payment declined |
| Expired | 4000 0000 0000 0069 | ❌ Card expired error |
| Insufficient Funds | 4000 0000 0000 9995 | ❌ Insufficient funds |

---

# PART 6: Troubleshooting

## Issue: "Webhook not received" / "Invalid signature"

**Solution:**
1. Verify webhook secret in Render matches Stripe Dashboard
2. Check Render logs for errors
3. Verify webhook URL is exactly correct (no typos)
4. Make sure endpoint accepts raw JSON body

---

## Issue: "Cannot connect to backend"

**Solution:**
1. Verify Vercel `NEXT_PUBLIC_API_URL` is correct
2. Check Render service is active (green status)
3. Test API URL directly in browser
4. Check CORS headers in backend

---

## Issue: "Payment succeeds but webhook doesn't fire"

**Solution:**
1. Go to Stripe Webhooks page
2. Click the failing endpoint
3. Scroll to Events
4. Click the failed event to see error
5. Check Render logs for processing errors

---

## Issue: "Different data in test vs. production"

**Remember:**
```
Test mode:
- API keys: sk_test_, pk_test_
- Webhook secrets: whsec_test_
- No real money changes hands
- Test cards only (4242, 4000, etc.)

Live mode:
- API keys: sk_live_, pk_live_
- Webhook secrets: whsec_live_
- REAL money changes hands
- Real cards only
```

---

# PART 7: Switching to Live Mode (When Ready)

When you're ready to go live (later):

## Step 7.1: Get Live Keys from Client

From their Stripe account (Live Mode ON):
```
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
```

---

## Step 7.2: Create Live Webhooks

In Stripe Dashboard (Live Mode ON):

1. Go to **Developers** → **Webhooks**
2. Repeat webhook setup (same URLs)
3. Get live signing secrets: `whsec_live_xxxxx`

---

## Step 7.3: Update Render

1. Update all `sk_test_` → `sk_live_`
2. Update all `whsec_test_` → `whsec_live_`
3. Save - service redeploys
4. Update Vercel `pk_test_` → `pk_live_`

---

## Step 7.4: Test One Transaction

Make a test payment with real card to verify everything works

---

# PART 8: Quick Reference Checklist

## Before Deploying

- [ ] Code pushed to GitHub
- [ ] `.env` in `.gitignore`
- [ ] `package.json` has `start` script
- [ ] Backend listens on `process.env.PORT`
- [ ] Frontend uses `NEXT_PUBLIC_API_URL` env variable

## Backend on Render

- [ ] Service deployed successfully
- [ ] Health check endpoint responds
- [ ] Environment variables set
- [ ] Service shows "Active" status

## Frontend on Vercel

- [ ] Service deployed successfully
- [ ] Can open homepage
- [ ] Environment variables set
- [ ] API calls work (check network tab in DevTools)

## Stripe Webhooks (Test Mode)

- [ ] Stripe Test Mode ON
- [ ] 3 webhook endpoints created with Render URLs
- [ ] All signing secrets copied to Render
- [ ] Webhook URLs visible in Stripe Dashboard

## Testing

- [ ] Test payment with 4242 card succeeds
- [ ] Webhook logged in Stripe Dashboard
- [ ] Order created in database
- [ ] Render logs show webhook processing

---

# Summary

```
BEFORE (Development):
ngrok://xyz.ngrok.io → localhost → Test mode

AFTER (Production):
https://spherekings-backend.onrender.com → Render → Test mode

LATER (When Going Live):
https://spherekings-backend.onrender.com → Render → Live mode
(only api keys change, URL stays same!)
```

**That's it! Your entire stack is now deployed and connected.** 🎉

---

## Still Using ngrok?

If you want to keep ngrok for development:

```bash
# Terminal 1: Your backend
npm run dev

# Terminal 2: ngrok tunnel
ngrok http 5000

# You get: https://xyz.ngrok.io

# Update Render webhook to:
https://spherekings-backend.onrender.com/api/checkout/webhook
(NOT ngrok URL)

# Use ngrok URL ONLY for local testing with local backend
```

---

## Important Notes

⚠️ **Same URL for test and live** = Yes! Only keys change
⚠️ **Render free tier** = 15-minute downtime auto-sleep (upgrade for production)
⚠️ **Vercel free tier** = Fine for frontend
⚠️ **Make database free tier too** = Or it might timeout

Test everything before declaring done! ✅
