# Influencer Application & Approval Flow - Quick Reference

## 📍 All Routes & Pages

### Influencer Routes

| Route | Purpose | Status |
|-------|---------|--------|
| `/influencer/apply` | Landing page to apply | ✅ Exists |
| `/influencer/apply/form` | Application form submission | ✅ Exists |
| `/influencer/dashboard` | View application status & product | ✅ **CREATED** |

### Admin Routes

| Route | Purpose | Status |
|-------|---------|--------|
| `/admin/influencer/applications` | Manage applications (approve/reject) | ✅ Exists |

### API Endpoints (Backend)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/v1/influencer/apply` | Submit application | Public |
| GET | `/api/v1/influencer/my-application` | Get own application | Required |
| GET | `/api/v1/influencer/applications` | List all (admin) | Admin |
| PUT | `/api/v1/influencer/applications/:id/approve` | Approve application | Admin |
| PUT | `/api/v1/influencer/applications/:id/reject` | Reject application | Admin |
| PUT | `/api/v1/influencer/applications/:id/assign-product` | Assign product | Admin |
| PUT | `/api/v1/influencer/applications/:id/fulfillment` | Update fulfillment | Admin |

---

## 🔄 Complete User Flow

### Step 1: Influencer Applies
```
Influencer visits /influencer/apply
                    ↓
                Clicks "Apply Now"
                    ↓
          Redirects to /influencer/apply/form
                    ↓
            Fills out application form
                    ↓
            POST to /api/v1/influencer/apply
                    ↓
         Application saved to database
                    ↓
        Email confirmation sent (optional)
```

### Step 2: Admin Reviews & Approves
```
Admin visits /admin/influencer/applications
                    ↓
         Sees list of pending applications
                    ↓
          Clicks "Approve" on application
                    ↓
        Enters optional approval notes
                    ↓
   PUT to /api/v1/influencer/applications/:id/approve
                    ↓
    Application status changed to "approved"
                    ↓
      Influencer notified (optional email)
```

### Step 3: Influencer Checks Status
```
Influencer logs in
        ↓
   Visits /influencer/dashboard
        ↓
GET requests /api/v1/influencer/my-application
        ↓
    Dashboard displays:
    - Green "APPROVED" badge
    - Personal information
    - Admin approval notes
    - Status message
```

### Step 4: Admin Assigns Product
```
Admin returns to /admin/influencer/applications
                    ↓
            Clicks on approved application
                    ↓
        (NEW FEATURE: Product Assignment Page - TODO)
                    ↓
   Selects product and optional tracking number
                    ↓
PUT to /api/v1/influencer/applications/:id/assign-product
                    ↓
    fulfillmentStatus set to "assigned" or "shipped"
                    ↓
   Assigned influencer is notified (optional)
```

### Step 5: Influencer Receives Product
```
Influencer visits /influencer/dashboard
                    ↓
         Sees assigned product card with:
         - Product image & details
         - Fulfillment status
         - Tracking number (if shipped)
                    ↓
         Receives product, records content
                    ↓
        Fulfillment status: "delivered"
```

---

## 📊 Status Workflow Diagram

```
┌─────────────────────────────────────┐
│   Application Created (pending)     │
└────────────┬────────────────────────┘
             │
      ┌──────┴───────┐
      │              │
   APPROVE       REJECT
      │              │
      ↓              ↓
  APPROVED       REJECTED
      │              │
      │         (End, can reapply)
      │
   ASSIGN PRODUCT
      │
  ┌───┴──────────────┐
  │                  │
WITHOUT TRACKING  WITH TRACKING
  │                  │
  ↓                  ↓
ASSIGNED         SHIPPED
  │                  │
  └────────┬─────────┘
           │
        DELIVERED
           │
           ↓
        (End, partnership complete)
```

---

## 🎯 Key Status States

### Application Status
- **pending**: Awaiting admin review (default)
- **approved**: Admin approved, ready for product assignment
- **rejected**: Admin rejected, influencer can reapply

### Fulfillment Status (after approval)
- **pending**: Approved but no product assigned
- **assigned**: Product selected, preparing shipment
- **shipped**: Product in transit (has tracking)
- **delivered**: Product received

---

## 🔐 Authentication Requirements

| Page/API | Required? | Role |
|----------|-----------|------|
| `/influencer/apply` | No (public) | Any |
| `/influencer/apply/form` | Yes | Any authenticated user |
| `/influencer/dashboard` | Yes | Any authenticated user |
| `/admin/influencer/applications` | Yes | Admin |
| GET `/influencer/my-application` | Yes | Any authenticated user |
| GET `/influencer/applications` | Yes | Admin |
| PUT `/approve`, `/reject`, `/assign-product` | Yes | Admin |

---

## 📝 Data Fields Reference

### Application Fields Stored
```javascript
{
  _id: String,
  userId: String,           // Link to user
  email: String,
  name: String,
  phoneNumber: String,
  platforms: [String],      // ['Instagram', 'TikTok', etc.]
  followerCount: Number,
  contentCommitment: String, // 'total_videos', 'videos_per_month', 'content_links'
  totalVideos: Number,      // If content_commitment === 'total_videos'
  videosPerMonth: Number,   // If content_commitment === 'videos_per_month'
  
  // Status fields
  status: String,           // 'pending', 'approved', 'rejected'
  createdAt: Date,
  approvedAt: Date,         // Set when approved
  approveBy: String,        // Admin user ID
  approvalNotes: String,    // Optional notes from admin
  rejectedAt: Date,         // Set when rejected
  rejectionReason: String,  // Required reason for rejection
  
  // Product assignment
  productAssigned: ObjectId, // References Product
  fulfillmentStatus: String, // 'pending', 'assigned', 'shipped', 'delivered'
  trackingNumber: String,   // Shipping tracking
}
```

---

## 🧪 Quick Test Scenarios

### Scenario 1: Happy Path (Approve & Ship)
1. ✅ Influencer applies at `/influencer/apply/form`
2. ✅ Admin approves at `/admin/influencer/applications`
3. ✅ Influencer sees status at `/influencer/dashboard` (showing "APPROVED")
4. ✅ Admin assigns product (new feature needed)
5. ✅ Influencer sees product details at `/influencer/dashboard`

### Scenario 2: Rejection Flow
1. ✅ Influencer applies
2. ✅ Admin rejects with reason at `/admin/influencer/applications`
3. ✅ Influencer sees rejection reason at `/influencer/dashboard`
4. ✅ Influencer can reapply

### Scenario 3: Product Assignment
1. ✅ Application approved
2. ✅ Admin assigns product + tracking number
3. ✅ Influencer sees:
   - Fulfillment status = "shipped"
   - Tracking number displayed
4. ✅ Admin can update to "delivered"

---

## ⚠️ Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| 400 on approve | Wrong field name (notes vs approvalNotes) | ✅ FIXED |
| 400 on reject | Reason < 10 chars or wrong field | ✅ FIXED |
| Dashboard shows "No Application" | Influencer not logged in | Check auth token |
| No product shown after assign | Product not populated in query | Check admin assigned it |
| Tracking number not visible | fulfillmentStatus not "shipped" | Ensure tracking & status updated |

---

## 📦 Implementation Status

| Feature | Status | File |
|---------|--------|------|
| Application form | ✅ Done | `/influencer/apply/form` |
| Admin applications list | ✅ Done | `/admin/influencer/applications` |
| Influencer dashboard | ✅ **NEW** | `/influencer/dashboard` |
| Product assignment UI | ⏳ TODO | Needs new admin page |
| Fulfillment tracking | ⏳ TODO | Needs enhancement |
| Email notifications | ⏳ TODO | Backend setup needed |

---

## 🚀 Next Steps

1. **Test the complete flow:**
   - Apply as influencer → Approve as admin → View dashboard
   
2. **Create Product Assignment Admin Page:**
   - Select product from dropdown
   - Add tracking number (optional)
   - Submit to assign product

3. **Add Email Notifications:**
   - Send approval emails
   - Send rejection emails with reason
   - Send product assignment emails with tracking

4. **Enhance Fulfillment Tracking:**
   - Allow admins to update status
   - Show delivery confirmation

---

## 💡 Pro Tips

- **For Testing:** Use the same browser with two tabs (one logged as admin, one as influencer)
- **Quick Reload:** Use the "Refresh Status" button on dashboard to update without page reload
- **Debug Mode:** Check browser console for detailed logs of API calls
- **Database Check:** Query applications collection to verify status changes

