# Stripe Live Setup Guide for Project Owner

> **This guide is for the project owner/client to set up their own Stripe account with live keys**

---

## Quick Overview

Your SphereKings marketplace application uses Stripe for:
- ✅ Product checkout and payments
- ✅ Raffle entry payments
- ✅ Influencer sponsorship payments
- ✅ Affiliate payouts (transferring commission payments)

To go live, you'll need **5 live API keys** from your Stripe account.

---

## Step 1: Create Your Stripe Account

### Option A: New Stripe Account
1. Go to **https://dashboard.stripe.com/register**
2. Enter your email address
3. Choose **Business Account** or **Individual Account** based on your needs
4. Fill in your business details:
   - Business name
   - Business type
   - Business location/country
   - Website URL (your SphereKings marketplace domain)
5. Provide your bank account information for payouts
6. Complete identity verification if required
7. Accept Stripe's terms and conditions

### Option B: Existing Stripe Account
- If you already have a Stripe account, just sign in at **https://dashboard.stripe.com**

✅ **Your Stripe account is now ready!**

---

## Step 2: Locate Your API Keys

### Access Your Keys:
1. Log in to **Stripe Dashboard** (https://dashboard.stripe.com)
2. Navigate to **Developers** menu (bottom left sidebar)
3. Click **API Keys**
4. Make sure **Live Mode** is toggled ON (top right - switch from Test to Live)
5. You should see:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`)

### Important: Keep Keys Secure
- ⚠️ **Never share your Secret Key** with anyone
- ⚠️ **Never commit keys to GitHub** (use .env file only)
- ✅ Publishable key is safe to expose in frontend code
- ✅ Secret key must stay on backend only

---

## Step 3: Create Webhook Endpoints

Your application needs **3 webhook endpoints** to receive payment confirmations from Stripe.

### Create Webhook #1: Product/Checkout Webhook

1. Go to **Developers** → **Webhooks** (in Stripe Dashboard)
2. Click **Add Endpoint**
3. Enter your webhook URL:
   ```
   https://your-domain.com/api/checkout/webhook
   ```
4. Select these events to listen for:
   - **payment_intent.succeeded**
   - **payment_intent.payment_failed**
   - **checkout.session.completed**
   - **charge.refunded**
5. Click **Add Endpoint**
6. Click the newly created endpoint
7. Copy the **Signing Secret** (starts with `whsec_`)
8. Keep this for later ✅

### Create Webhook #2: Raffle Webhook

1. Click **Add Endpoint** again
2. Enter your webhook URL:
   ```
   https://your-domain.com/api/raffle/webhook
   ```
3. Select these events:
   - **checkout.session.completed**
   - **payment_intent.succeeded**
4. Click **Add Endpoint**
5. Copy the **Signing Secret** (starts with `whsec_`)
6. Keep this for later ✅

### Create Webhook #3: Sponsorship Webhook

1. Click **Add Endpoint** again
2. Enter your webhook URL:
   ```
   https://your-domain.com/api/sponsorship/webhook
   ```
3. Select these events:
   - **checkout.session.completed**
   - **payment_intent.succeeded**
   - **charge.refunded**
4. Click **Add Endpoint**
5. Copy the **Signing Secret** (starts with `whsec_`)
6. Keep this for later ✅

---

## Step 4: Enable Required Features

### Enable Stripe Connect (for Affiliate Payouts)

If you plan to use affiliate payouts, enable Stripe Connect:

1. Go to **Settings** → **Connect settings** (in Stripe Dashboard)
2. Click **Get started with Connect**
3. Enable "Create accounts for your customers" (Standard accounts)
4. Configure your platform's branding and support information
5. Accept the platform agreement

This allows your application to:
- Create connected accounts for affiliates
- Transfer commission payments to their bank accounts
- Track affiliate payouts

---

## Step 5: Collect Your Live Keys

Once you have everything set up, gather these **5 Stripe Live Keys**:

| # | Key Name | Format | Where to Find |
|---|----------|--------|---------------|
| 1 | **STRIPE_PUBLISHABLE_KEY** | `pk_live_xxxxx...` | Developers → API Keys (Publishable key) |
| 2 | **STRIPE_SECRET_KEY** | `sk_live_xxxxx...` | Developers → API Keys (Secret key) |
| 3 | **STRIPE_WEBHOOK_SECRET** | `whsec_xxxxx...` | Developers → Webhooks (Product Checkout) |
| 4 | **STRIPE_WEBHOOK_SECRET_RAFFLE** | `whsec_xxxxx...` | Developers → Webhooks (Raffle) |
| 5 | **STRIPE_SPONSORSHIP_WEBHOOK_SECRET** | `whsec_xxxxx...` | Developers → Webhooks (Sponsorship) |

### Example Format:
```
STRIPE_PUBLISHABLE_KEY=pk_live_51RfIHLC2OPD6EQms...
STRIPE_SECRET_KEY=sk_live_51RfIHLC2OPD6EQms...
STRIPE_WEBHOOK_SECRET=whsec_jXudmFtEDvWTSX7dN4016Epy...
STRIPE_WEBHOOK_SECRET_RAFFLE=whsec_1RAS54nDIuktIKL1C64sh...
STRIPE_SPONSORSHIP_WEBHOOK_SECRET=whsec_zKJaD1jvmA6QodQxTX...
```

---

## Step 6: Update Your Environment Configuration

Once you have all 5 keys, provide them to your development team with the following instructions:

### Update .env File (Backend Server)

Replace the test keys with your live keys in the `.env` file:

```bash
# ============================================================================
# PAYMENT PROCESSING (Stripe) - LIVE KEYS
# ============================================================================
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_CHECKOUT_WEBHOOK_SECRET_HERE
STRIPE_SPONSORSHIP_WEBHOOK_SECRET=whsec_YOUR_SPONSORSHIP_WEBHOOK_SECRET_HERE
STRIPE_WEBHOOK_SECRET_RAFFLE=whsec_YOUR_RAFFLE_WEBHOOK_SECRET_HERE

# Stripe configuration
STRIPE_API_VERSION=2025-05-28.basil
STRIPE_MAX_RETRY=3
```

### Update Next.js Environment (Frontend)

If using Next.js, also add to your frontend `.env.local`:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY_HERE
```

⚠️ **Important**: The `pk_` (Publishable) key is safe to expose in frontend code. The `sk_` (Secret) key must NEVER be exposed in frontend code.

---

## Step 7: Test Transactions with Live Keys

Once keys are deployed, test the following:

### Test 1: Check Payment Processing
1. Go to your marketplace
2. Add a product to cart
3. Click Checkout
4. Fill in a valid payment card: **4242 4242 4242 4242**
5. Expiry: Any future date
6. CVC: Any 3 digits
7. Complete the purchase
8. ✅ Order should be created and webhook should fire

### Test 2: Verify Webhook Received
1. Go to Stripe Dashboard
2. **Developers** → **Webhooks**
3. Click on your Product Checkout webhook endpoint
4. Scroll to **Events** section
5. ✅ Should see `checkout.session.completed` event from your test

### Test 3: Check Affiliate Payout (if enabled)
1. Go to your admin dashboard
2. Navigate to Affiliate Management
3. Create a test payout request
4. Approve it
5. ✅ Check Stripe Dashboard for payout transfer

---

## Step 8: Security Checklist

Before going live, ensure:

- ✅ All 5 Stripe keys are replaced with LIVE keys (not test keys)
- ✅ Secret keys are stored in `.env` file (not committed to GitHub)
- ✅ Frontend environment variables only contain PUBLISHABLE key
- ✅ Webhooks are configured for your production domain
- ✅ SSL/HTTPS is enabled on your production server
- ✅ Rate limiting is appropriate (not blocking legitimate requests)
- ✅ Error logging is configured to track payment issues
- ✅ You have a process to handle failed webhooks/payments

---

## Step 9: Monitor & Maintain

### Regular Monitoring:
- **Stripe Dashboard**: Monitor transaction volume and success rates
- **Payment Logs**: Check application logs for payment errors
- **Webhook Health**: Verify all webhooks are receiving events

### Common Issues & Solutions:

| Issue | Solution |
|-------|----------|
| Webhook not receiving events | Verify webhook URL is correct and HTTPS |
| Payment intent fails | Check Stripe Dashboard for decline reasons |
| Affiliate payouts fail | Verify affiliate bank accounts are verified in Stripe Connect |
| Reconciliation issues | Compare your DB order totals with Stripe Dashboard transactions |

---

## Step 10: Contact Support

If you need help:

- **Stripe Support**: https://support.stripe.com
- **Your Developer**: Provide them with the 5 keys from Step 5
- **Documentation**: https://stripe.com/docs

---

## Troubleshooting Reference

### What if webhook URL changes?
- Update the endpoint in Stripe Dashboard
- Update WEBHOOK_URL in your .env
- Restart your backend server

### What if you forget a signing secret?
- Go to Webhooks in Stripe Dashboard
- Click the endpoint
- Copy the Signing Secret again
- Update your .env

### What if you suspect a key is compromised?
- Go to **Developers** → **API Keys**
- Scroll down to find your compromised key
- Click the key's row
- Click **Revoke Key** - this creates a new one automatically
- Update your .env with the new key
- Restart your backend

---

## Summary: Your 5 Required Keys

```
1. STRIPE_PUBLISHABLE_KEY     → pk_live_...
2. STRIPE_SECRET_KEY          → sk_live_...
3. STRIPE_WEBHOOK_SECRET      → whsec_... (checkout webhook)
4. STRIPE_WEBHOOK_SECRET_RAFFLE → whsec_... (raffle webhook)
5. STRIPE_SPONSORSHIP_WEBHOOK_SECRET → whsec_... (sponsorship webhook)
```

Once you have these, your marketplace will be fully ready to accept live payments! 🎉

---

## Additional Resources

- **Stripe API Docs**: https://stripe.com/docs/api
- **Stripe Webhooks**: https://stripe.com/docs/webhooks
- **Stripe Connect**: https://stripe.com/docs/connect
- **PCI Compliance**: https://stripe.com/docs/security
