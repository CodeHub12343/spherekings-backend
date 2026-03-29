# Simple Stripe Account Setup Guide for Business Owner

**This is a simplified guide for non-technical business owners to create a Stripe account.**

---

## Before You Start

Have these ready:
- ✅ Email address (you'll use this to log in)
- ✅ Your business information
- ✅ Your bank account details
- ✅ Photo ID (passport or driver's license)
- ✅ Recent bill showing your address

---

## Step 1: Go to Stripe

1. Open your web browser
2. Go to: **https://dashboard.stripe.com/register**
3. You'll see a sign-up form

---

## Step 2: Enter Your Email

1. Type in your email address (this is how you'll log in)
2. Click **"Next"**
3. Check your email for a verification link
4. Click the link to verify your email

---

## Step 3: Choose Account Type

1. Select **"Business Account"** (not "Personal")
2. Click **"Next"**

---

## Step 4: Enter Your Name

1. Enter your full legal name
2. Click **"Next"**

---

## Step 5: Enter Business Information

Fill in these fields:

- **Business Name** (official name of your business)
- **Business Type** (choose from dropdown):
  - If you own it = **Sole Proprietor**
  - If it's an LLC = **Limited Liability Company (LLC)**
  - If it's a Corporation = **Corporation**
  - Unsure? Ask your accountant or choose **Sole Proprietor**
- **Business Address** (street address, city, state, ZIP)
- **Phone Number** (business phone)
- **Country** (where you operate)
- **Website** (your marketplace domain)

Click **"Next"**

---

## Step 6: Tax Information

Fill in:
- **Tax ID** (your EIN - Employer Identification Number)
  - Format: XX-XXXXXXX (example: 12-3456789)
  - Don't have one? You can use your Social Security Number

Click **"Next"**

---

## Step 7: Describe Your Business

1. **Industry** (choose from dropdown) - pick the closest match:
   - Apparel
   - Entertainment
   - Digital Products
   - Services
   - Other

2. **Business Description** (1-2 sentences about what you do)
   - Example: "We sell trendy apparel and merchandise online"

3. **Expected Monthly Volume** (rough guess in dollars)
   - Don't worry if it's not exact

Click **"Next"**

---

## Step 8: Add Your Bank Account

This is where payments will go. Fill in:

1. **Account Holder Name** (the name on your bank account)
2. **Bank Routing Number** (9-digit number from your check)
3. **Account Number** (from your check or bank statement)
4. **Account Type**: Choose **"Checking"** or **"Savings"**

Where to find these:
- Look at the bottom left of your checks
- Or log into your bank's website
- Or call your bank

Make sure this account is in **your name or your business name**

Click **"Next"**

---

## Step 9: Verify Your Identity

Stripe will ask you to upload:
1. **Photo ID** (passport or driver's license)
2. **Proof of Address** (utility bill, bank statement, or lease from last 3 months)

Steps:
1. Take a clear photo or scan of each document
2. Upload the files
3. Stripe will review (usually 1-2 minutes)

---

## Step 10: You're Done!

Once verified, you'll see your **Stripe Dashboard**.

Now you need to:
1. Navigate to **"Developers"** (bottom left of sidebar)
2. Click **"API Keys"**
3. Make sure you're in **"Live Mode"** (toggle at top right)
4. You'll see two keys:
   - **Publishable Key** (starts with `pk_live_`)
   - **Secret Key** (starts with `sk_live_`)

**Copy these and send them to your developer**

---

## Step 11: Create Webhooks (Developer Will Do This)

**Skip this section** - Your developer will set up webhooks. You don't need to do anything here.

---

## What Your Developer Needs

Once you're done, give your developer:
1. ✅ Your Publishable Key (pk_live_...)
2. ✅ Your Secret Key (sk_live_...)
3. ✅ Your email/password to Stripe (if they need to verify anything)

---

## After That...

Your developer will:
1. Take those keys
2. Update the application settings
3. Connect the marketplace to Stripe
4. Test some payments
5. **Your marketplace starts accepting real payments!**

---

## Troubleshooting

### "My identity verification failed"
- Make sure your photo ID is clear (not blurry)
- Make sure your proof of address shows your full name and current address
- Try again - Stripe usually approves on second try

### "I forgot my email"
- Don't worry! Go to **https://dashboard.stripe.com/forgot** and reset it

### "My bank account was rejected"
- Check the routing and account numbers are correct (compare to your checks)
- Make sure the account holder name matches exactly
- Stripe may call you to verify

### "Where are my API keys?"
- Log in to Stripe
- Click **"Developers"** at the bottom left
- Click **"API Keys"**
- Make sure **"Live Mode"** is ON (toggle top right)

---

## Security Reminder

⚠️ **IMPORTANT:**
- ✅ Your Publishable Key (pk_) is OK to share
- ❌ Your Secret Key (sk_) is SUPER PRIVATE - only give to your developer
- ❌ Never post your keys on the internet or social media
- ❌ Never tell anyone your Stripe password

---

## Questions?

If you get stuck:
1. **Stripe Help**: https://support.stripe.com
2. **Your Developer**: Contact them for help
3. **Stripe Chat**: Live chat available in Stripe Dashboard

---

## Timeline

- ⏱️ Account creation: 5-10 minutes
- ⏱️ Identity verification: 1-2 minutes
- ⏱️ Total time: ~15 minutes

You've got this! 🎉
