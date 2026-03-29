# Information Needed From Client for Stripe Setup

**As the developer**, you need to collect this information from your client before setting up the Stripe account.

---

## Personal/Business Information

- [ ] **Full Legal Name** (if individual/sole proprietor)
- [ ] **Business Name** (legal business name)
- [ ] **Business Type** (choose one):
  - Sole Proprietor
  - Partnership
  - LLC (Limited Liability Company)
  - Corporation
  - Non-profit
  - Other: ________________

---

## Business Location & Contact

- [ ] **Primary Business Address** (street, city, state, ZIP)
- [ ] **Country of Operation**
- [ ] **Phone Number** (business contact)
- [ ] **Email Address** (for Stripe account - they'll use this to log in)

---

## Tax Information

- [ ] **Tax ID / EIN** (Employer Identification Number)
  - US: 9-digit EIN (XX-XXXXXXX format)
  - Non-US: Equivalent tax identification number
- [ ] **SSN / Personal ID Number** (for individual verification, required by Stripe)

---

## Banking Information (For Payouts)

- [ ] **Bank Account Type** (Checking or Savings)
- [ ] **Bank Name**
- [ ] **Account Holder Name** (exact name on bank account)
- [ ] **Routing Number** (9-digit US number)
- [ ] **Account Number** (check account length, typically 10-12 digits)
- [ ] **Account Currency** (USD, EUR, GBP, etc.)

**Note**: This should be the main business bank account where they want to receive payments.

---

## Business Details

- [ ] **Website URL** (their SphereKings marketplace domain)
- [ ] **Business Description** (1-2 sentences describing what they do)
- [ ] **Expected Monthly Revenue** (rough estimate in dollars)
- [ ] **Industry** (e.g., Apparel, Entertainment, Digital Products, etc.)

---

## Verification Documents

Stripe may ask for:
- [ ] **Photo ID** (government-issued ID - passport or driver's license)
- [ ] **Proof of Address** (utility bill, bank statement - must be recent)
- [ ] **Business License** (if applicable in their jurisdiction)

---

## Summary

**Minimum Required:**
1. Full legal name
2. Business name
3. Business address
4. Phone & email
5. Tax ID/EIN
6. Bank account details
7. Website URL

**Optional but helpful:**
- SSN (may be required by Stripe later)
- Proof of identity documents
- Business license

---

## Next Steps

1. ✅ Collect information from client
2. ✅ Client creates Stripe account at https://dashboard.stripe.com/register
3. ✅ Client provides you with the 5 API keys
4. ✅ You update the `.env` file with those keys
5. ✅ Application goes live!

---

## Important Notes

- The client will create the Stripe account themselves (as the account owner)
- They will be the one logging into Stripe Dashboard
- They need to provide a VALID email address (they'll use it to sign in to Stripe)
- Bank account must be in their name or business name
- Identity verification is required by Stripe (for legal/compliance reasons)
