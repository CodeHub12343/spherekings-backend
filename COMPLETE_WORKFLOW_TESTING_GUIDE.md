# Complete Influencer Partnership Workflow - Testing Guide

## 📋 Overview

This guide walks through the **complete fulfillment workflow** from application approval through commission payment:

```
1. Admin Approves Application → 2. Admin Assigns Product → 3. Admin Adds Tracking
         ↓                                ↓                          ↓
   🟢 APPROVED              🟢 PRODUCT ASSIGNED         🟢 IN TRANSIT
                                                               ↓
4. Influencer Receives → 5. Creates Content → 6. Submits Links → 7. Commissions Paid
                                                         ↓
                                            🟢 FULFILLMENT COMPLETE
```

---

## 🧪 Test Scenario (10 minutes total)

### Prerequisites
- Backend running: `npm start`
- Frontend running: `npm run dev`
- Admin account logged in
- Influencer account with APPROVED application
- At least 1 active product in database
- (Yours: eadepoju16@gmail.com - already approved!)

---

## **STEP 1: Admin Approve Application** ✅ (Already Done)

Your application is already approved as of March 25, 2026, 11:47:58 AM.

**Verify:**
- Go to Admin Dashboard → Influencer Applications
- Filter: "Approved"
- Your application shows status: **APPROVED**

---

## **STEP 2: Admin Assign Product** (Test This)

### In Admin Dashboard:
1. Click your application name
2. See green button: **"Assign Product"**
3. Click it → Modal opens

### In Assign Product Modal:
1. **Select Product**: Choose any product from dropdown
   - Shows: Name - Price (stock available)
2. **Tracking Number** (optional): Enter fake tracking: `TEST123456789`
3. Click **"Assign Product"** button

### Expected Results:
```
✅ Success message: "Product assigned successfully!"
✅ Button changes from "Assign Product" to "Add Tracking"
✅ Application status updates to "processing"
```

### Verify in Database:
```
Collection: influencer_applications
Field: productAssigned = ObjectId (product's _id)
Field: fulfillmentStatus = "processing"
```

---

## **STEP 3: Admin Add Tracking Number** (Simulates Shipping)

### In Admin Dashboard:
1. Your application now shows **"Add Tracking"** button (blue)
2. Click it → Modal opens

### In Tracking Modal:
1. Enter Tracking Number: `1Z999AA10123456789`
2. Status: Keep as **"Shipped (In Transit)"** (default)
3. Click **"Update Tracking"**

### Expected Results:
```
✅ Success message: "Tracking number added!"
✅ Database fulfillmentStatus = "shipped"
✅ Database trackingNumber = "1Z999AA10123456789"
✅ Database shippedAt = Current timestamp
```

---

## **STEP 4: Influencer Checks Dashboard** (See Product + Tracking)

### Login as Influencer:
1. Open incognito/different browser
2. Login: `eadepoju16@gmail.com` (or your influencer email)
3. Go to `/influencer/dashboard`

### Expected to See:
1. **Application Status**: Shows "APPROVED" badge ✅
2. **Assigned Product Section**:
   - Product image
   - Product name & description
   - Price (formatted correctly)
   - Status: **"📦 Shipment Tracking"** card
   - Tracking Number: `1Z999AA10123456789`
   - Message: "Your product is on its way!"

3. **Content Submission Section** (NEW - Part of this workflow):
   - Content Required: Shows number of videos required
   - "Submit Content Link" button (appears once product is shipped)

---

## **STEP 5: Influencer Creates Content** (Simulated - Out of System)

Influencer would:
- Film/create content featuring the product
- Post on Instagram/TikTok/YouTube with product tag
- Copy video link

For testing: Use any real video link:
- Instagram: `https://www.instagram.com/p/ABC123DEF456/`
- TikTok: `https://www.tiktok.com/@username/video/123456789`
- YouTube: `https://www.youtube.com/watch?v=ABC123`

---

## **STEP 6: Influencer Submit Content Link** (Test This Now)

### On Influencer Dashboard:
1. Scroll to **"Content Submission"** section
2. See: "Content Required: 1 videos" (from your application)
3. See: "Content Submitted: 0 / 1"
4. Click **"Submit Content Link"** button

### In Content Submission Modal:
1. **Platform**: Select "Instagram" (or your choice)
2. **Content Link**: Paste a real or fake video URL:
   - `https://www.instagram.com/p/CoKY8_6rLrY/`
3. **Title** (optional): "Check out this amazing product!"
4. Click **"Submit Content"**

### Expected Results:
```
✅ Success message: "Content link submitted successfully!"
✅ Modal closes
✅ Dashboard refreshes
✅ Modal disappears on dashboard shows:
   - "Content Submitted: 1 / 1" ✅
   - "✅ Submitted Links (1)" section appears
   - Your submitted link displays with:
     * Platform badge: "Instagram"
     * Clickable URL link
     * Submission date
```

### Verify in Database:
```
Collection: influencer_applications
Field: contentLinks = [{
  url: "https://www.instagram.com/p/...",
  platform: "Instagram",
  title: "Check out this amazing product!",
  addedAt: Current timestamp,
  views: 0
}]
Field: videosDelivered = 1 (auto-calculated)
Field: videosRemaining = 0 (virtual field: totalVideos - videosDelivered)
```

---

## **STEP 7: Fulfillment Complete - Commission Activated**

### On Dashboard After Content Submitted:
1. **Content Submission section** shows:
   - Status: **"✅ Content Fulfillment Complete!"**
   - Message: "You have submitted all required content..."

2. **New Commission Card** appears:
   - Commission Rate: **10%**
   - Status: **"Pending Activation"**
   - Message confirming partnership completion

### Backend Auto-Calculation:
```
When any order comes in through this product's affiliate link:
Commission Amount = Order Total × 10% (commission rate)

Example: Customer buys $100 of products
Commission = $100 × 0.10 = $10.00 → Added to influencer's pending earnings
```

---

## 📊 **Full Workflow State Transitions**

| Phase | Status | Field: fulfillmentStatus | Field: contentLinks | Commission |
|-------|--------|--------------------------|---------------------|------------|
| 1. Application Approved | approved | pending | [] | Not yet |
| 2. Product Assigned | approved | processing | [] | Not yet |
| 3. Tracking Added | approved | shipped | [] | Not yet |
| 4. Content Submitted | approved | shipped | [{ url, platform, ... }] | Not yet |
| 5. Fulfillment Complete | approved | shipped | [{ url, platform, ... }] | **ACTIVATED** ✅ |

---

## 🎯 **Key Features Tested**

✅ **Content Submission Modal**
- Platform selection (6 options)
- URL validation (must be http/https)
- Optional title field
- Real-time form validation

✅ **Content Display**
- Submitted links show with platform badge
- Clickable URL (opens in new tab)
- Submission timestamp
- Can submit multiple links until all requirements met

✅ **Fulfillment Tracking**
- videosDelivered counter (auto-calculated)
- videosRemaining virtual field
- Progress indicator (X / Y videos)
- Completion status message

✅ **Commission Activation**
- Shows when fulfillment complete
- Displays commission rate (10%)
- Status indicator: "Pending Activation"
- Clear explanation of how commission works

---

## 🐛 **Troubleshooting**

### Content Modal doesn't appear
- ✅ Check: Is fulfillmentStatus "shipping" or beyond? (not "pending")
- ✅ Check: Is product assigned? (productAssigned must exist)
- ✅ Refresh page (Ctrl+Shift+R)

### URL validation error
- ✅ Must start with `http://` or `https://`
- ✅ Copy full URL from browser address bar
- ✅ No special characters at end

### Content doesn't submit
- ✅ Check browser console for error
- ✅ Check Network tab → PUT `/api/v1/influencer/applications/.../add-content`
- ✅ Verify token is still valid (login again if needed)

### Commission card doesn't appear
- ✅ Must have submitted ALL required videos
- ✅ Check videosDelivered >= totalVideos in database
- ✅ Refresh page after submission

---

## 📋 **API Endpoints Used**

**Influencer Can Call:**
- `PUT /api/v1/influencer/applications/:id/add-content` (Submit content link)
- `GET /api/v1/influencer/my-application` (Fetch own application)

**Admin Can Call:**
- `PUT /api/v1/influencer/applications/:id/assign-product` (Assign product)
- `PUT /api/v1/influencer/applications/:id/fulfillment` (Update tracking)

**Payment System (Automatic):**
- When order placed → Stripe Webhook triggered
- Commission calculated → Stored in commissions collection
- Status: "pending" → "approved" (after fraud check) → "paid"

---

## ✅ **Success Criteria**

**Test is successful when:**
1. ✅ Admin can assign product to approved application
2. ✅ Admin can add tracking number
3. ✅ Influencer sees product on dashboard with tracking
4. ✅ Influencer can submit content link via modal
5. ✅ Content appears on dashboard with platform badge
6. ✅ videosDelivered counter increments
7. ✅ Commission card shows when fulfillment complete
8. ✅ All data persists in database

---

## 🚀 **Next Steps After Testing**

1. **Email Notifications**
   - Send email when product assigned
   - Send email when tracking added
   - Send email when content submitted

2. **Analytics Dashboard**
   - Track content engagement (views, likes, comments)
   - Show influencer performance metrics
   - Display ROI for sponsorship

3. **Payout Processing**
   - Integrate Stripe for commission payments
   - Send payments to influencer bank account
   - Track payment history

---

## 📝 **Testing Checklist**

- [ ] Admin assigns product successfully
- [ ] Admin adds tracking number
- [ ] Influencer sees product with tracking on dashboard
- [ ] Influencer can open content submission modal
- [ ] Can select platform from dropdown
- [ ] Can enter and validate URL
- [ ] Can add optional title
- [ ] Content submits successfully
- [ ] Dashboard shows submitted content
- [ ] Platform badge displays correctly
- [ ] Submission date shows correctly
- [ ] videosDelivered counter updates
- [ ] Commission card appears
- [ ] All data saved to database
- [ ] Refresh page - data persists
- [ ] Multiple content links can be submitted
- [ ] URL validation works (rejects invalid URLs)
- [ ] Modal closes after successful submission
- [ ] Error messages display for validation failures

**Total Features: 18** ✨
