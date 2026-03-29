# Stripe Live Keys Checklist for SphereKings Marketplace

**Project Owner**: [Client Name]  
**Date Started**: [Date]  
**Status**: [ ] Setup Complete | [ ] In Progress

---

## Required Stripe Setup

### Account Creation
- [ ] Stripe account created (https://dashboard.stripe.com/register)
- [ ] Business information verified
- [ ] Bank account added for payouts
- [ ] Identity verification completed
- [ ] Stripe Connect enabled (for affiliate payouts)

---

## Webhook Endpoints Configuration

Configure these 3 webhook endpoints in Stripe Dashboard → Developers → Webhooks:

### Webhook #1: Product/Checkout Payments
- [ ] Endpoint created
- **URL**: `https://your-domain.com/api/checkout/webhook`
- **Events**: `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.completed`, `charge.refunded`
- **Signing Secret**: `whsec_...` 

**Copy this signing secret as: `STRIPE_WEBHOOK_SECRET`**

### Webhook #2: Raffle Payments
- [ ] Endpoint created
- **URL**: `https://your-domain.com/api/raffle/webhook`
- **Events**: `checkout.session.completed`, `payment_intent.succeeded`
- **Signing Secret**: `whsec_...`

**Copy this signing secret as: `STRIPE_WEBHOOK_SECRET_RAFFLE`**

### Webhook #3: Sponsorship Payments
- [ ] Endpoint created
- **URL**: `https://your-domain.com/api/sponsorship/webhook`
- **Events**: `checkout.session.completed`, `payment_intent.succeeded`, `charge.refunded`
- **Signing Secret**: `whsec_...`

**Copy this signing secret as: `STRIPE_SPONSORSHIP_WEBHOOK_SECRET`**

---

## API Keys to Collect

From Stripe Dashboard → Developers → API Keys (Make sure **LIVE MODE** is enabled):

### Key 1: Publishable Key
- **Label**: STRIPE_PUBLISHABLE_KEY
- **Format**: `pk_live_...` (starts with pk_live_)
- **Where**: Developers → API Keys → Publishable key
- [ ] Copied: ____________________________________

### Key 2: Secret Key
- **Label**: STRIPE_SECRET_KEY
- **Format**: `sk_live_...` (starts with sk_live_)
- **Where**: Developers → API Keys → Secret key
- **⚠️ KEEP SECURE - NEVER SHARE**
- [ ] Copied: ____________________________________

### Key 3: Webhook Secret (Checkout)
- **Label**: STRIPE_WEBHOOK_SECRET
- **Format**: `whsec_...`
- **Where**: Developers → Webhooks → Product/Checkout endpoint → Signing secret
- [ ] Copied: ____________________________________

### Key 4: Webhook Secret (Raffle)
- **Label**: STRIPE_WEBHOOK_SECRET_RAFFLE
- **Format**: `whsec_...`
- **Where**: Developers → Webhooks → Raffle endpoint → Signing secret
- [ ] Copied: ____________________________________

### Key 5: Webhook Secret (Sponsorship)
- **Label**: STRIPE_SPONSORSHIP_WEBHOOK_SECRET
- **Format**: `whsec_...`
- **Where**: Developers → Webhooks → Sponsorship endpoint → Signing secret
- [ ] Copied: ____________________________________

---

## Keys to Update in Application

### Backend Environment File (.env)
```
# PAYMENT PROCESSING (Stripe) - LIVE MODE
STRIPE_SECRET_KEY=sk_live_[KEY_2]
STRIPE_PUBLISHABLE_KEY=pk_live_[KEY_1]
STRIPE_WEBHOOK_SECRET=whsec_[KEY_3]
STRIPE_WEBHOOK_SECRET_RAFFLE=whsec_[KEY_4]
STRIPE_SPONSORSHIP_WEBHOOK_SECRET=whsec_[KEY_5]

STRIPE_API_VERSION=2025-05-28.basil
STRIPE_MAX_RETRY=3
```

- [ ] .env file updated with correct keys
- [ ] .env file is NOT committed to GitHub
- [ ] Backend server restarted

### Frontend Environment File (.env.local or .env.production)
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_[KEY_1]
```

- [ ] Frontend .env.local updated
- [ ] Frontend rebuilt
- [ ] Frontend redeployed

---

## Testing Checklist

Once keys are deployed:

### Test 1: Basic Payment Flow
- [ ] Add product to cart
- [ ] Complete checkout with card: **4242 4242 4242 4242**
- [ ] Order created successfully
- [ ] Payment appears in Stripe Dashboard

### Test 2: Webhook Delivery
- [ ] Go to Stripe Dashboard
- [ ] Developers → Webhooks → Check endpoints
- [ ] Verify `checkout.session.completed` events are received
- [ ] Check application logs for webhook processing

### Test 3: Affiliate Payouts (if enabled)
- [ ] Create test affiliate
- [ ] Generate test commission
- [ ] Process payout request
- [ ] Verify transfer appears in Stripe Dashboard

### Test 4: Error Handling
- [ ] Test with declined card: **4000 0000 0000 0002**
- [ ] Verify error message displays to user
- [ ] Check error logging in application

---

## Security Verification

- [ ] All test keys (sk_test_, pk_test_) have been replaced with live keys (sk_live_, pk_live_)
- [ ] Secret keys are in .env file only (not in code)
- [ ] .env file is in .gitignore (not in GitHub)
- [ ] HTTPS/SSL enabled on production domain
- [ ] Webhook URLs use HTTPS (not HTTP)
- [ ] Rate limiting configured appropriately
- [ ] Error logging implemented
- [ ] Sensitive data not exposed in logs

---

## Monitoring Setup

- [ ] Check Stripe Dashboard regularly for transaction volumes
- [ ] Set up email alerts in Stripe for failed payments
- [ ] Review webhook delivery logs weekly
- [ ] Monitor application error logs for payment issues
- [ ] Reconcile payments monthly against your records

---

## Troubleshooting Reference

### Common Issues:

**Payment not processing:**
- Verify webhook endpoints are receiving events
- Check application error logs
- Verify Stripe transaction status in Dashboard

**Webhook not firing:**
- Confirm webhook URL is correct and HTTPS
- Test webhook delivery from Stripe Dashboard
- Check network/firewall isn't blocking requests

**Wrong keys being used:**
- Verify .env has sk_live_ and pk_live_ (not sk_test_)
- Restart backend after changing .env
- Clear browser cache for frontend keys

---

## Final Sign-Off

- [ ] All 5 Stripe keys obtained from Stripe Dashboard
- [ ] All keys updated in application (.env and .env.local)
- [ ] Webhooks configured and tested
- [ ] Test transactions completed successfully
- [ ] Production deployment ready
- [ ] Monitoring and logging in place

**Ready for Live Payment Processing: YES ☑️**

---

## Support Contacts

- **Stripe Support**: https://support.stripe.com
- **Your Developer**: [Developer Email/Contact]
- **Internal Issue Tracking**: [Your System]

---

## Additional Documentation

- Full Setup Guide: `/STRIPE_LIVE_SETUP_GUIDE.md`
- Stripe API Docs: https://stripe.com/docs/api
- Webhook Documentation: https://stripe.com/docs/webhooks
