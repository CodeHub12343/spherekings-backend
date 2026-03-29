# Stripe Live Keys Quick Reference Card

## Your 5 Required Stripe Live Keys

This is what you need to collect from your Stripe account to go live.

---

### 1️⃣ Stripe Publishable Key
```
STRIPE_PUBLISHABLE_KEY = pk_live_...
```
**Where to find**: Stripe Dashboard → Developers → API Keys → Publishable Key  
**Safe to use in**: Frontend code, client-side  
**Format**: Starts with `pk_live_`

---

### 2️⃣ Stripe Secret Key
```
STRIPE_SECRET_KEY = sk_live_...
```
**Where to find**: Stripe Dashboard → Developers → API Keys → Secret Key  
**⚠️ KEEP PRIVATE**: Backend only, never commit to GitHub  
**Format**: Starts with `sk_live_`

---

### 3️⃣ Checkout Webhook Secret
```
STRIPE_WEBHOOK_SECRET = whsec_...
```
**Where to find**: Stripe Dashboard → Developers → Webhooks → [Checkout Endpoint] → Signing Secret  
**Used for**: Product checkout, payment processing  
**Webhook URL**: `https://your-domain.com/api/checkout/webhook`

---

### 4️⃣ Raffle Webhook Secret
```
STRIPE_WEBHOOK_SECRET_RAFFLE = whsec_...
```
**Where to find**: Stripe Dashboard → Developers → Webhooks → [Raffle Endpoint] → Signing Secret  
**Used for**: Raffle entry payments  
**Webhook URL**: `https://your-domain.com/api/raffle/webhook`

---

### 5️⃣ Sponsorship Webhook Secret
```
STRIPE_SPONSORSHIP_WEBHOOK_SECRET = whsec_...
```
**Where to find**: Stripe Dashboard → Developers → Webhooks → [Sponsorship Endpoint] → Signing Secret  
**Used for**: Influencer sponsorship payments  
**Webhook URL**: `https://your-domain.com/api/sponsorship/webhook`

---

## .env File Template

Copy and paste these 5 keys into your `.env` file:

```bash
# PAYMENT PROCESSING (Stripe) - LIVE MODE
STRIPE_SECRET_KEY=sk_live_YOUR_VALUE_HERE
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_VALUE_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_VALUE_HERE
STRIPE_WEBHOOK_SECRET_RAFFLE=whsec_YOUR_VALUE_HERE
STRIPE_SPONSORSHIP_WEBHOOK_SECRET=whsec_YOUR_VALUE_HERE

# Stripe configuration
STRIPE_API_VERSION=2025-05-28.basil
STRIPE_MAX_RETRY=3
```

---

## Step-by-Step Stripe Setup

1. ✅ Create Stripe account: https://dashboard.stripe.com/register
2. ✅ Go to **Developers** → **API Keys**
3. ✅ Make sure **Live Mode** is toggled ON
4. ✅ Copy your **Publishable Key** (pk_live_)
5. ✅ Copy your **Secret Key** (sk_live_)
6. ✅ Go to **Developers** → **Webhooks**
7. ✅ Create 3 webhooks for your domain:
   - Checkout: `https://your-domain.com/api/checkout/webhook`
   - Raffle: `https://your-domain.com/api/raffle/webhook`
   - Sponsorship: `https://your-domain.com/api/sponsorship/webhook`
8. ✅ Copy the signing secrets from each webhook
9. ✅ Update your `.env` file
10. ✅ Restart your application
11. ✅ Test a live transaction

---

## Example Values (PLACEHOLDER FORMAT)

```
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx

STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx

STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

STRIPE_WEBHOOK_SECRET_RAFFLE=whsec_xxxxxxxxxxxxxxxxxxxxx

STRIPE_SPONSORSHIP_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

⚠️ These are placeholder values. Replace with your actual keys from Stripe Dashboard.

---

## Quick Validation Checklist

- [ ] All keys start with `pk_live_`, `sk_live_`, or `whsec_` (NOT `pk_test_`, `sk_test_`)
- [ ] Secret key is in `.env` (not in code)
- [ ] Publishable key can be in frontend `.env.local`
- [ ] All 3 webhooks have their signing secrets captured
- [ ] Webhook URLs match your production domain
- [ ] `.env` file is in `.gitignore`
- [ ] Backend restarted after updating `.env`

---

## Need Help?

- **Stripe Support**: https://support.stripe.com
- **Full Setup Guide**: See `STRIPE_LIVE_SETUP_GUIDE.md`
- **Detailed Checklist**: See `STRIPE_LIVE_KEYS_CHECKLIST.md`
