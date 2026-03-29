# 🎰 SphereKings Raffle Feature - Easy Explainer for James

## What Is This Feature?

A **bi-weekly raffle** where customers pay **$1** to enter a drawing to win a **FREE Sphere of Kings board game**. The $1 covers only shipping/handling - the winner gets the board completely FREE.

---

## Why This Is Genius For You

### Lead Generation Machine
Every customer who enters gives you:
- ✅ Their email address (marketing list)
- ✅ Their full name
- ✅ Their complete mailing address (fulfillment-ready)
- ✅ Optional phone number

### Self-Funding
The $1 entry fee = shipping cost to send the board. You don't lose money on the giveaway.

### Recurring Traffic
Every 14 days, users come back to see if they won. They tell friends. Network effect.

### Trust Builder
Public winners list shows transparency. People see others won before them. Builds confidence.

---

## How It Works (Step-by-Step for User)

### The Customer Journey

**User visits landing page**
↓
*Sees new "Win a FREE Board" section with eye-catching CTA*
↓
**Clicks "Enter Raffle"**
↓
*Modal pops up with entry form*
↓
**Fills in 4 things:**
- Full name
- Email
- Shipping address (street, city, state, zip, country)
- Phone (optional)
↓
**Sees clearly:** "Entry fee: $1.00 (shipping only. Product is FREE.)"
↓
**Clicks "Pay $1.00"**
↓
*Redirected to Stripe payment page (same as checkout)*
↓
**Pays $1 with credit card**
↓
*Redirected back to success page*
↓
**Success screen shows:**
- "Congratulations! You're entered!"
- Next winner announcement date
- Countdown timer
- Link to "Check My Entries"

---

## How It Works (Step-by-Step for James)

### Admin's Job (Every 14 Days)

1. **Wait 14 days** (first cycle: Mar 24 → Apr 7)
2. **Go to Admin Dashboard**
3. **Click "Manage Raffle"** (new menu option)
4. **See:**
   - Total entries this cycle (e.g., "247 entries")
   - Total revenue (e.g., "$247.00")
   - Current cycle dates
   - **Red Button: "🎲 Pick Winner Now"**
5. **Click the button**
6. **System randomly picks one entry**
7. **Winner info displayed:**
   - Name: John Smith
   - Email: john@example.com
   - Address: 123 Main St, Austin, TX 78701
8. **Email automatically sends to winner** (future version)
9. **Mark as "Shipped"** when you ship the board
10. **Repeat every 14 days**

---

## Behind-the-Scenes (Technical)

### Database Stores Three Things

**1. Raffle Entries**
```
User paid $1 → Entry created
Entry stored with:
- Their name, email, address
- Entry date
- Payment confirmation (Stripe ID)
- Current cycle they're in
- Status: "paid" or "pending"
```

**2. Raffle Cycles**
```
Each 14-day period is a cycle
Cycle tracks:
- Start date (Mar 24)
- End date (Apr 7)
- Total entries count
- Total revenue ($)
- Winner name
- Winner address
- Status: active → drawn → notified → shipped
```

**3. Past Winners**
```
History of all winners (forever)
Used for:
- Public "past winners" list on landing page
- Admin reference
```

### The Payment Flow

```
User pays $1 on Stripe
    ↓
Stripe confirms payment (webhook)
    ↓
Backend marks entry as "paid"
    ↓
Entry added to current cycle
    ↓
Cycle revenue counter increments ($1 added)
    ↓
User sees success confirmation
```

### The Winner Selection

```
Admin clicks "Pick Winner"
    ↓
Backend looks at all PAID entries for current cycle
    ↓
System picks ONE randomly (completely fair)
    ↓
Winner info stored
    ↓
Email sent to winner: "Congratulations!"
    ↓
Admin sees winner info and ships product
    ↓
New 14-day cycle starts automatically
```

---

## What Users See

### On Landing Page

**New "Win Board" Section** shows:
- 🎯 "Win a FREE Sphere of Kings Board!"
- 📌 "$1 entry fee covers shipping only"
- ⏰ "New winner every 14 days"
- 🏆 "Recent winners: John (Mar 8), Sarah (Mar 22), Mike (pending draw)"
- **Button: "Enter Raffle - Only $1"**
- ℹ️ Legal notice: "Entry fee is for shipping only. Not gambling."

### After Entering

**Success Page** shows:
- ✅ "You're in!"
- 📅 "Next draw: April 7, 2026 - 14 days to enter"
- 🔗 "View my entries"
- 📢 "Spread the word to friends"

### "My Entries" Page

Users can see:
- All entries they've paid for
- Which cycles they're in
- Countdown to next winner announcement
- IF they won (highlighted)

---

## What James Controls

### Admin Raffle Dashboard

**Page: /admin/raffle**

Shows:
```
┌─────────────────────────────────┐
│ RAFFLE MANAGEMENT               │
├─────────────────────────────────┤
│ CURRENT CYCLE INFO              │
│ ├─ Dates: Mar 24 - Apr 7        │
│ ├─ Entries: 247                 │
│ ├─ Revenue: $247.00             │
│ ├─ Status: Active (5 days left) │
│ └─ [🎲 PICK WINNER]  ← RED BTN  │
├─────────────────────────────────┤
│ CURRENT WINNER (if drawn)       │
│ ├─ Name: John Smith             │
│ ├─ Email: john@example.com      │
│ ├─ Address: 123 Main St, ATX... │
│ └─ [✅ MARK AS SHIPPED]         │
├─────────────────────────────────┤
│ ALL ENTRIES (247)               │
│ Name | Email | Entered | Status │
│ John | j@ex... | Mar 24 | Paid  │
│ Jane | j@ex... | Mar 25 | Paid  │
│ ... (searchable, sortable)      │
├─────────────────────────────────┤
│ PAST WINNERS                    │
│ ├─ Cycle 1: John (Apr 8)        │
│ ├─ Cycle 2: Sarah (Apr 22)      │
│ └─ Cycle 3: Mike (May 6)        │
└─────────────────────────────────┘
```

**Also on Main Dashboard:**
- New card showing: "🎰 Raffle: 247 entries, $247 revenue"
- Quick link to raffle management

---

## Data You Get

### immediately After Each Entry
- ✅ Customer name
- ✅ Email address
- ✅ Full shipping address
- ✅ Phone (if provided)
- ✅ Entry date/time
- ✅ Payment amount ($1)

### For Each Cycle (Every 14 days)
- ✅ Total entries
- ✅ Total revenue
- ✅ Winner name + address
- ✅ All entry details (exportable for fulfillment)

### Report You Can Export
```
Cycle | Start | End | Entries | Revenue | Winner | Status
1     | 3/24  | 4/7 | 247     | $247    | John   | Shipped
2     | 4/8   | 4/21| 289     | $289    | Sarah  | Shipped
3     | 4/22  | 5/5 | 256     | $256    | Mike   | Shipped
...
```

---

## Integration With Your Existing Site

✅ **Fits with existing design** - Uses your brand colors, fonts, styling
✅ **Fits with existing payment** - Uses Stripe (same as checkout)
✅ **Fits with existing auth** - Users must be logged in (optional-make it public if desired)
✅ **Fits with existing dashboard** - New section, no breaking changes
✅ **Fits with existing database** - MongoDB + models

**It's built INTO your app. Not a third-party plugin.**

---

## The Legal Side (Don't Worry)

### What We Say
✅ "Entry fee covers shipping and handling only"
✅ "Product is FREE to winner"
✅ "Winner selected randomly every 14 days"
✅ "18+ only"
✅ "Not gambling - this is a sweepstakes promotion"

### Why This is Protected
- Entry fee is reasonable ($1)
- Prize has clear value
- Random selection is documented and fair
- No misleading claims
- All disclosures are visible

**Bottom line:** If you stay away from words like "lottery" and "gambling," and you're clear about what the $1 covers, you're good.

---

## Revenue Potential

### Example First Month

```
Week 1 (Mar 24-30): 80 entries = $80
Week 2 (Mar 31-Apr 6): 120 entries = $120
Week 3 (Apr 7-13): 150 entries = $150  ← Winner picked Apr 7
Week 4 (Apr 14-20): 180 entries = $180 ← New winner, repeat
Week 5 (Apr 21-27): 200 entries = $200 ← Momentum builds

Total March-April: ~$730 revenue
Plus: 730 fresh email addresses on your list
```

### Lifetime Value

Each raffle entry is a lead capture.
- You can email them about new products
- You can offer them affiliate programs
- They get on your marketing list
- Some will buy products later (multiplier effect)

---

## Timeline to Launch

### Tasks (in order)

**Week 1 (Backend)**
1. Create database models (3 tables)
2. Build API endpoints (7 routes)
3. Connect to Stripe for payments
4. Test payment flow end-to-end

**Week 2 (Frontend)**
1. Add raffle section to landing page
2. Build entry form and popup
3. Success confirmation page
4. User's entries page (optional)

**Week 3 (Admin)**
1. Add raffle management page to admin dashboard
2. Build winner selection interface
3. Test manual winner picking

**Week 4 (Launch)**
1. Final testing on all devices
2. Legal review of disclaimers
3. **April 1st Launch! 🚀**

---

## After Launch (Phase 2 - Optional)

### Things We Can Add Later
1. **Automatic draws** - System automatically picks winner every bi-week (don't have to click button)
2. **Gift emails** - Auto-email winner immediately (instead of manual)
3. **Social sharing** - "Share and get extra entries" incentive
4. **Mobile app** - Raffle in your mobile app (if you build one)
5. **Analytics** - Track raffle performance, conversion rates
6. **Multi-product raffles** - Pick different products each cycle

---

## Why This Works

### For the Business
- 💰 Revenue from $1 entries (covers shipping)
- 📧 Email list (valuable asset)
- 📍 Address database (fulfillment-ready)
- 🔄 Recurring traffic (users return every 14 days)
- 🎯 Lead magnet (gets people interested)
- 📈 Scalable (each cycle independent)

### For the Customer
- 🆓 Chance to win FREE game board (value = $39+ retail)
- ✅ Small entry fee ($1) = accessible to everyone
- 🎲 Fair & transparent (random selection)
- 🏆 Social proof (see others won before)
- ⏰ Regular schedule (know when to check back)

### For You (James)
- 📱 Marketing channel you own (not reliant on ads)
- 🎯 Qualified leads (people interested enough to pay $1)
- 🚀 Scalable without breaking existing business
- 💎 Premium feel (a "special thing" on your site)
- 🔐 Data-rich (full contact info for each customer)

---

## Quick Reference

| What | Answer |
|------|--------|
| **Entry cost** | $1.00 (fixed) |
| **Draw frequency** | Every 14 days |
| **Draw method** | Random, manual (admin clicks button) |
| **Prize** | FREE Sphere of Kings board (no cost to you, covered by $1 shipping fee) |
| **Data captured** | Name, email, full address, phone |
| **Where on site** | Landing page (new section) + admin dashboard (new page) |
| **When launches** | April 1, 2026 |
| **Tech stack** | Uses existing (Stripe, MongoDB, React) |
| **Cost to implement** | Dev time only (no new tools/services needed) |
| **Legal hassles** | Minimal - sweepstakes are generally OK with proper disclaimers |

---

## Questions?

**Q: Can people enter multiple times?**
A: Yes! Each $1 entry is one entry. More entries = better odds. Encourages repeat visits.

**Q: What if nobody enters?**
A: You don't pick a winner that cycle. Next cycle starts fresh.

**Q: Can I give away a different product?**
A: Absolutely! Change the prize each cycle if you want.

**Q: What if someone loses interest?**
A: They get off your email list over time. No problem. You got the data.

**Q: Can I run this alongside affiliate program?**
A: Yes! Independent feature. No conflicts.

**Q: How do I pay for shipping to winner?**
A: Use the $1 entry fee they paid. You manually ship when you see winner info in dashboard. Or use it as marketing expense.

---

## Summary

You get:
✅ Lead magnet (email capture)
✅ Revenue stream ($1 per entry)
✅ Customer data (addresses, names)
✅ Recurring traffic (every 14 days)
✅ Social proof (past winners)
✅ Marketing asset (giveaway history)

Users get:
✅ Chance to win something valuable
✅ Clear, fair process
✅ No hidden costs
✅ Exciting reason to return

It launches April 1st as planned.

Let's build this! 🚀
