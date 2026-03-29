# Raffle Feature - Builder's Quick-Start Checklist

## 🎯 Sprint Overview
**Goal**: Implement bi-weekly $1 raffle for game board
**Target Launch**: April 1st, 2026
**MVP Scope**: Manual winner selection (auto-draw in Phase 2)
**Estimated Effort**: 3-4 days for experienced dev, 5-7 days for learning

---

## Phase 1: Backend Setup (Day 1)

### Database Models
- [ ] Create `src/models/RaffleEntry.js`
  - [ ] userId (ref User)
  - [ ] email, fullName
  - [ ] shippingAddress (street, city, state, zip, country)
  - [ ] phone (optional)
  - [ ] stripeSessionId, paymentIntentId, transactionId
  - [ ] cyclePeriod, entryFee (100 cents)
  - [ ] status (pending → completed)
  - [ ] timestamps

- [ ] Create `src/models/RaffleCycle.js`
  - [ ] startDate, endDate
  - [ ] totalEntries, totalRevenue
  - [ ] winnerId, winnerEmail, winnerShippingAddress
  - [ ] status (active → drawn → notified → shipped)
  - [ ] selectedAt, notifiedAt, shippedAt
  - [ ] timestamps

- [ ] Create `src/models/RaffleWinner.js`
  - [ ] cycleId (ref RaffleCycle)
  - [ ] userId, email, fullName, shippingAddress
  - [ ] announcedAt, shippedAt
  - [ ] timestamps

### Validation
- [ ] Create `src/validators/raffleValidator.js`
  - [ ] validateRaffleEntry (fullName, email, address, phone)
  - [ ] validateShippingAddress (street, city, state, zip, country)
  - [ ] Use Joi (consistent with codebase)

---

## Phase 2: Backend Service & Routes (Day 1-2)

### Service Layer
- [ ] Create `src/services/raffleService.js`
  - [ ] submitEntry(userId, entryData) - Create entry + return Stripe session
  - [ ] handlePaymentSuccess(sessionId) - Update entry status + cycle revenue
  - [ ] selectWinner(cycleId) - Random selection logic
  - [ ] getCurrentCycle() - Get or create active cycle
  - [ ] getPastWinners(limit) - For social proof
  - [ ] getAdminStats() - For admin dashboard
  - [ ] getEntriesByUser(userId) - User's entries
  - [ ] notifyWinner(cycle) - Stub for emailing (Phase 2)

### Controller & Routes
- [ ] Create `src/controllers/raffleController.js`
  - [ ] submitRaffleEntry - POST /api/raffle/entry
  - [ ] getRaffleCurrentCycle - GET /api/raffle/current-cycle
  - [ ] getUserRaffleEntries - GET /api/raffle/my-entries (protected)
  - [ ] getRafflePastWinners - GET /api/raffle/winners
  - [ ] selectWinner - POST /admin/raffle/select-winner (admin)
  - [ ] getRaffleStats - GET /admin/raffle/stats (admin)
  - [ ] getRaffleEntries - GET /admin/raffle/entries (admin)

- [ ] Create `src/routes/raffleRoutes.js`
  - [ ] Public routes (no auth)
    - GET /current-cycle
    - GET /winners
  - [ ] User routes (auth required)
    - POST /entry
    - GET /my-entries
  - [ ] Admin routes (admin role required)
    - POST /admin/select-winner
    - GET /admin/stats
    - GET /admin/entries

- [ ] Register routes in main Express app
  ```javascript
  // src/index.js or wherever routes are imported
  const raffleRoutes = require('./routes/raffleRoutes');
  app.use('/api/raffle', raffleRoutes);
  ```

### Payment Webhook Integration
- [ ] Extend `src/controllers/checkoutController.js`
  - [ ] In webhook handler, detect if payment is for raffle
  - [ ] Call raffleService.handlePaymentSuccess(sessionId)
  - [ ] Verify RaffleEntry gets marked as "completed"

---

## Phase 3: Frontend Components (Day 2)

### Landing Page Integration
- [ ] Add import in `src/app/page.jsx`:
  ```javascript
  import RaffleSection from '../sections/RaffleSection';
  ```

- [ ] Add RaffleSection to component render (after SponsorshipShowcase):
  ```jsx
  <RaffleSection />
  ```

- [ ] Create `src/sections/RaffleSection.jsx`
  - [ ] Hero text: "Win a FREE Sphere of Kings Board!"
  - [ ] Eye-catching CTA button: "Enter Raffle - Only $1"
  - [ ] Display current cycle info (dates, entries)
  - [ ] Show past winners (social proof)
  - [ ] Clear disclaimer about fee
  - [ ] Responsive design (mobile first)
  - [ ] Opens RaffleEntryForm modal on CTA click

### Entry Form Component
- [ ] Create `src/components/raffle/RaffleEntryForm.jsx`
  - [ ] Use react-hook-form + Zod validation
  - [ ] Fields:
    - [ ] Full Name (required, 2+ chars)
    - [ ] Email (required, valid format)
    - [ ] Street Address (required)
    - [ ] City (required)
    - [ ] State (required)
    - [ ] ZIP Code (required)
    - [ ] Country (required)
    - [ ] Phone (optional)
  - [ ] Show entry fee clearly: "$1.00"
  - [ ] Loading state during payment
  - [ ] Error handling (validation + payment)
  - [ ] Integrates with Stripe checkout session
  - [ ] Mobile responsive form

### Success/Confirmation Page
- [ ] Create `src/components/raffle/RaffleSuccessConfirm.jsx`
  - [ ] Show confirmation message
  - [ ] Display entry details
  - [ ] Show countdown to next draw
  - [ ] Link to "Check My Entries" page
  - [ ] Optional: Referral incentive text

### User's Entries Page
- [ ] Create `src/app/raffle/my-entries/page.jsx`
  - [ ] List all user's raffle entries
  - [ ] Show which cycles they're in
  - [ ] Highlight if they won
  - [ ] Show payment status
  - [ ] Countdown to next draw

### API Hooks (React Query)
- [ ] Create `src/api/hooks/useRaffle.js`
  - [ ] useSubmitRaffleEntry() - Handle entry + payment
  - [ ] useRaffleCurrentCycle() - Fetch current cycle
  - [ ] useRafflePastWinners() - Fetch winners
  - [ ] useUserRaffleEntries() - User's entries
  - [ ] useRaffleStats() - Admin stats

### API Service
- [ ] Create or extend `src/api/services/raffleService.js`
  - [ ] submitEntry(formData) - POST /api/raffle/entry
  - [ ] getCurrentCycle() - GET /api/raffle/current-cycle
  - [ ] getPastWinners() - GET /api/raffle/winners
  - [ ] getUserEntries() - GET /api/raffle/my-entries
  - [ ] selectWinner(cycleId) - POST /admin/raffle/select-winner
  - [ ] getAdminStats() - GET /admin/raffle/stats
  - [ ] getAdminEntries(filters) - GET /admin/raffle/entries

---

## Phase 4: Admin Dashboard (Day 3)

### Admin Stats Card Integration
- [ ] Modify `src/app/(admin)/admin/dashboard/page.jsx`
  - [ ] Import useRaffleStats hook
  - [ ] Add raffle stat card to StatsGrid
  - [ ] Show current entries count
  - [ ] Show total revenue
  - [ ] Link to admin raffle page

### New Admin Raffle Page
- [ ] Create `src/app/(admin)/admin/raffle/page.jsx`
  - [ ] Header: "Raffle Management"
  - [ ] Current Cycle Info Card
    - [ ] Start/end dates
    - [ ] Total entries
    - [ ] Total revenue
    - [ ] Days remaining
  - [ ] **Winner Selection Button** (red, prominent)
    - [ ] Only shows when cycle is done (14+ days past)
    - [ ] Confirmation before action
    - [ ] Shows result after selection
  - [ ] Current Winner Card (if drawn)
    - [ ] Winner name (with initials anonymizing option)
    - [ ] Email (obfuscated for privacy)
    - [ ] Full shipping address
    - [ ] Status (notified/shipped)
    - [ ] "Mark as Shipped" button
  - [ ] Entries Table
    - [ ] Columns: Name, Email, Status, Entered Date, City/State
    - [ ] Search/filter by name or email
    - [ ] Pagination
  - [ ] Past Winners Section
    - [ ] List of all previous winners
    - [ ] Dates they won
  - [ ] Mobile responsive (table → card layout)

---

## Phase 5: Testing & Polish (Day 3-4)

### Backend Testing
- [ ] Create test data:
  - [ ] `npm run seed:raffle` script (optional)
  - [ ] Or manually create RaffleCycle in MongoDB
  
- [ ] Test API endpoints:
  - [ ] POST /api/raffle/entry (create entry)
  - [ ] GET /api/raffle/current-cycle (get cycle info)
  - [ ] GET /api/raffle/winners (get past winners)
  - [ ] POST /admin/raffle/select-winner (pick winner)
  - [ ] GET /admin/raffle/stats (admin stats)

- [ ] Test payment flow:
  - [ ] Use Stripe test card: 4242 4242 4242 4242
  - [ ] Verify entry created with pending status
  - [ ] Verify webhook fires and updates to completed
  - [ ] Verify cycle revenue increments

### Frontend Testing
- [ ] Test on different screen sizes
  - [ ] Desktop (1920px)
  - [ ] Tablet (768px)
  - [ ] Mobile (375px)
  
- [ ] Test form validation
  - [ ] All required fields show errors if empty
  - [ ] Email validation works
  - [ ] Address fields validated
  
- [ ] Test payment flow
  - [ ] Form submits correctly
  - [ ] Redirects to Stripe checkout
  - [ ] Success page shows after payment
  - [ ] Entry appears in user's entries page

### Admin Testing
- [ ] Test winner selection
  - [ ] Button disabled before cycle ends
  - [ ] Button enabled when cycle done
  - [ ] Winner randomly selected
  - [ ] Winner info displays correctly
  - [ ] Past winners list updates

### Edge Cases
- [ ] What if user enters twice in same cycle?
  - [ ] Allow it (more entries = more chances)
  - [ ] Or prevent it (one per user per cycle)
  - [ ] Decide and implement accordingly

- [ ] What if no entries when draw time?
  - [ ] Handle gracefully in code
  - [ ] Show message to admin

- [ ] Payment declined scenario
  - [ ] Entry created as "pending"
  - [ ] User sees error
  - [ ] Can retry

---

## Phase 6: Compliance & Deployment (Day 4)

### Legal/Compliance
- [ ] Add disclaimers to landing page section
  - [ ] "Entry fee covers shipping only"
  - [ ] "Product is FREE to winner"
  - [ ] "Random selection every 14 days"
  - [ ] "18+ only"
  - [ ] Link to full terms & conditions

- [ ] Create Terms & Conditions page (if not exists)
  - [ ] Eligibility rules
  - [ ] How winner selected
  - [ ] Prize rules
  - [ ] Privacy policy link

### Security Checklist
- [ ] User authentication required for entry submission
- [ ] Admin-only endpoints protected with role check
- [ ] User can only see their own entries
- [ ] All inputs validated & sanitized
- [ ] Stripe keys only in environment variables
- [ ] No sensitive data logged
- [ ] Rate limiting on entry submissions

### Environment Variables
- [ ] Verify STRIPE_SECRET_KEY set
- [ ] Verify STRIPE_PUBLISHABLE_KEY set
- [ ] Verify DATABASE_URL pointing to correct DB
- [ ] Verify JWT_SECRET set

### Deployment
- [ ] Create/verify staging environment
- [ ] Deploy backend to staging
- [ ] Deploy frontend to staging
- [ ] Full end-to-end test on staging
- [ ] Deploy to production
- [ ] Monitor logs for errors
- [ ] Test as customer: enter raffle, verify in DB

---

## Phase 7: Post-Launch (Optional - Phase 2)

### Email Service Integration
- [ ] Change from stub to real service
  - [ ] Use Nodemailer or SendGrid
  - [ ] Send confirmation email after entry
  - [ ] Send winner notification email

### Automatic Winner Selection (Cron Job)
- [ ] Install node-cron: `npm install node-cron`
- [ ] Create scheduled job runner
- [ ] Setup job to run bi-weekly (e.g., Fridays 5 PM)
- [ ] Auto-select and notify winner
- [ ] Log execution results

### Social Features (Optional)
- [ ] Add "Share to get extra entry" (if desired)
- [ ] Social media share buttons
- [ ] Leaderboard of top entries

---

## 🚨 Critical Success Factors

### Must-Have for April 1st
✅ Backend models, services, controllers working
✅ Stripe payment flow working (test end-to-end)
✅ Frontend form responsive and functional
✅ Admin dashboard admin can select winner
✅ All inputs validated
✅ Legal disclaimers displayed

### Nice-to-Have (Phase 2)
- Auto-draw with cron job
- Email notifications
- Social sharing incentives
- Analytics/tracking

---

## 🔗 File Structure Summary

```
Backend:
└─ src/
   ├─ models/
   │  ├─ RaffleEntry.js
   │  ├─ RaffleCycle.js
   │  └─ RaffleWinner.js
   ├─ validators/
   │  └─ raffleValidator.js
   ├─ services/
   │  └─ raffleService.js
   ├─ controllers/
   │  └─ raffleController.js
   └─ routes/
      └─ raffleRoutes.js

Frontend:
└─ FRONTEND_AUTH_IMPLEMENTATION/src/
   ├─ app/
   │  ├─ page.jsx (add RaffleSection)
   │  ├─ (admin)/admin/
   │  │  └─ raffle/
   │  │     └─ page.jsx
   │  └─ raffle/
   │     └─ my-entries/
   │        └─ page.jsx
   ├─ sections/
   │  └─ RaffleSection.jsx
   ├─ components/
   │  └─ raffle/
   │     ├─ RaffleEntryForm.jsx
   │     └─ RaffleSuccessConfirm.jsx
   ├─ api/
   │  ├─ services/
   │  │  └─ raffleService.js
   │  └─ hooks/
   │     └─ useRaffle.js
```

---

## 💡 Implementation Tips

### For Development Speed
1. **Copy existing patterns** - Use sponsorshipController.js as template
2. **Reuse validators** - Joi patterns already in codebase
3. **Use Zustand** - Existing state management pattern
4. **Component library** - Styled components, buttons, cards already styled
5. **Test with real Stripe** - Much faster than mocking

### Common Pitfalls to Avoid
❌ Don't forget to sanitize address inputs
❌ Don't expose payment IDs in frontend logs
❌ Don't allow duplicate entries without thinking through it
❌ Don't forget to create first RaffleCycle record
❌ Don't skip mobile testing

### Debugging Tips
- Check browser console for errors
- Check Network tab for API calls (verify responses)
- Check MongoDB for entries (use MongoDB Compass)
- Check Stripe Dashboard: Webhooks → Events for failures
- Check server logs for backend errors
- Use Postman/Insomnia to test API endpoints directly

---

## ⏱️ Time Estimates

| Task | Time | Notes |
|------|------|-------|
| Database models | 1-2 hrs | Straightforward |
| Validators | 30 mins | Copy Joi pattern |
| raffleService.js | 2-3 hrs | Core logic |
| Controller + routes | 1-2 hrs | Template based |
| Webhook integration | 1 hr | Extend existing |
| Landing page section | 1-2 hrs | Styled components |
| Entry form | 2-3 hrs | React hook form |
| Success page | 1 hr | Simple UI |
| Admin page | 2-3 hrs | Table, cards, buttons |
| Testing | 2-3 hrs | Full flow testing |
| **Total** | **14-20 hrs** | **~2-3 days** |

---

## 📞 When You Get Stuck

### Issue: Payment not going through
→ Check Stripe test keys are correct
→ Verify webhook endpoint is registered in Stripe
→ Check server logs for errors

### Issue: Entry not creating
→ Verify user is authenticated
→ Check MongoDB connection
→ Verify RaffleCycle exists

### Issue: Winner not selecting
→ Check random selection logic
→ Verify entries exist with status='completed'
→ Check admin has role='admin'

### Issue: Form not submitting
→ Check browser console for JS errors
→ Verify API endpoint URL is correct
→ Check CORS if frontend and backend differ

Good luck! 🚀
