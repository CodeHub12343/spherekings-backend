# Quick Start: Render + Vercel + Stripe Webhooks Setup

**TL;DR version - Just the essentials**

---

## The Key Insight 🧠

```
❌ WRONG: "Where is the Stripe test webhook URL?"
✅ RIGHT: "I use MY OWN webhook URL in both test and live modes"

Webhook URL = https://spherekings-backend.onrender.com/api/checkout/webhook
Stripe Mode = Controlled by API keys (sk_test_ vs sk_live_)
Result = Both test and live use the SAME URL, different keys!
```

---

## 5-Minute Setup

### 1. Deploy Backend to Render (5 min)

```bash
# Push code to GitHub
git push origin main

# Go to Render.com
# Click "New" → "Web Service"
# Select your GitHub repo
# Name: spherekings-backend
# Click Deploy
# Wait... done!
```

**Get your URL**: `https://spherekings-backend.onrender.com`

---

### 2. Add Environment Variables to Render (2 min)

In Render Dashboard → Environment:

```
STRIPE_SECRET_KEY=sk_test_xxxxx (from Stripe)
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx (create below)
STRIPE_WEBHOOK_SECRET_RAFFLE=whsec_test_xxxxx (create below)
STRIPE_SPONSORSHIP_WEBHOOK_SECRET=whsec_test_xxxxx (create below)
```

---

### 3. Create Stripe Webhooks (5 min)

Go to **Stripe Dashboard** → **Developers** → **Webhooks**

Create 3 endpoints:

| # | URL | Events |
|---|-----|--------|
| 1 | `https://spherekings-backend.onrender.com/api/checkout/webhook` | `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded` |
| 2 | `https://spherekings-backend.onrender.com/api/raffle/webhook` | `checkout.session.completed`, `payment_intent.succeeded` |
| 3 | `https://spherekings-backend.onrender.com/api/sponsorship/webhook` | `checkout.session.completed`, `payment_intent.succeeded`, `charge.refunded` |

For each endpoint:
1. Copy the **Signing Secret** (`whsec_test_xxxxx`)
2. Paste into Render environment variables
3. Render automatically redeploys

---

### 4. Deploy Frontend to Vercel (5 min)

```bash
# Push code to GitHub
git push origin main

# Go to Vercel.com
# Click "New Project"
# Select your frontend repo
# Click Deploy
# Wait... done!
```

**Get your URL**: `https://spherekings-frontend.vercel.app`

---

### 5. Add Vercel Environment Variables (1 min)

In Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://spherekings-backend.onrender.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

Redeploy frontend.

---

### 6. Test It! (5 min)

1. Open `https://spherekings-frontend.vercel.app`
2. Add product → Checkout
3. Use card: `4242 4242 4242 4242`
4. Click Pay
5. ✅ Should work!

Check Stripe Dashboard → Webhooks → See events 

---

## Environment Variables Summary

| Service | Variable | Value |
|---------|----------|-------|
| **Render Backend** | `STRIPE_SECRET_KEY` | `sk_test_xxxxx` |
| **Render Backend** | `STRIPE_WEBHOOK_SECRET` | `whsec_test_xxxxx` |
| **Render Backend** | `STRIPE_WEBHOOK_SECRET_RAFFLE` | `whsec_test_xxxxx` |
| **Render Backend** | `STRIPE_SPONSORSHIP_WEBHOOK_SECRET` | `whsec_test_xxxxx` |
| **Vercel Frontend** | `NEXT_PUBLIC_API_URL` | `https://spherekings-backend.onrender.com` |
| **Vercel Frontend** | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_xxxxx` |

---

## URL Cheat Sheet

```
Frontend: https://spherekings-frontend.vercel.app
Backend: https://spherekings-backend.onrender.com

Webhook URLs (all 3):
- https://spherekings-backend.onrender.com/api/checkout/webhook
- https://spherekings-backend.onrender.com/api/raffle/webhook
- https://spherekings-backend.onrender.com/api/sponsorship/webhook
```

---

## Test Cards

```
✅ SUCCESS: 4242 4242 4242 4242
❌ DECLINED: 4000 0000 0000 0002
❌ EXPIRED: 4000 0000 0000 0069
❌ NO FUNDS: 4000 0000 0000 9995
```

---

## Troubleshooting (30 seconds each)

| Problem | Solution |
|---------|----------|
| "Cannot reach backend" | Check Render service is Active (green status) |
| "API calls fail" | Verify `NEXT_PUBLIC_API_URL` in Vercel is correct |
| "Webhook not received" | Check Stripe webhook URL is exact match to Render URL |
| "Payment succeeds but no webhook" | Check Render logs for errors |
| "Invalid webhook signature" | Verify webhook secret in Render matches Stripe |
| "CORS error" | Check backend CORS headers include Vercel domain |

---

## When You're Done ✅

```
✓ Backend deployed on Render
✓ Frontend deployed on Vercel  
✓ Stripe webhooks pointing to Render
✓ Test payment works
✓ Webhook logs appear in Stripe
✓ No more ngrok! 🎉
```

Exactly same URLs work for live mode later - just swap API keys and webhook secrets from test to live.

---

## File to Update Before Deploying

Make sure `src/server.js` has:

```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
```

And `next.config.js` has CORS pointing to Render:

```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'https://spherekings-frontend.vercel.app' },
      ],
    },
  ];
}
```

---

## Done! Demo It Now 🚀
