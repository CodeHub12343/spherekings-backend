# Shipping Checkout Debug Guide

## Issue
Backend returns: `"Shipping address must be provided"` (400 error)
Even though the user filled in all address fields.

## Root Cause Analysis
The shipping address is being lost somewhere between the form submission and the API request.

## Debug Instructions

### Step 1: Check Console Logs During Form Submission
1. Open browser DevTools (F12)
2. Go to Console tab
3. Clear console
4. Fill in the shipping form with all fields
5. Click "Continue to Payment" button
6. **Look for these logs in order:**

#### Expected Log Sequence:
```
📝 ShippingForm.handleFormSubmit called
📝 Form data: {firstName: "...", lastName: "...", ...}
🔄 useShipping.handleSubmit called
🔄 Current formData: {firstName: "...", ...}
🔄 Validating with Zod schema...
✅ Zod validation passed, validated data: {...}
🔄 Saving to Zustand store...
🔄 Calling onSuccess callback with: {...}
✅ Shipping form submitted successfully
✅ Form validation passed, calling onSubmit with: {...}
🚚 Shipping form submitted, creating checkout session...
📦 Validated address received: {...}
📦 Address type: object
📦 Address keys: ["firstName", "lastName", "email", "phone", "street", "city", "state", "postalCode", "country"]
🆔 Affiliate ID: null (or some ID)
🛒 Creating checkout session...
📦 Shipping address: {...}
📦 Shipping address type: object
📦 Shipping address is null: false
📦 Shipping address is undefined: false
📨 Request body: {shippingAddress: {...}}
📨 Body keys: ["shippingAddress"]
📨 Body has shippingAddress: true
```

### Step 2: Look for Errors
If you see any red errors during this sequence, note:
- **Where it stops** (which log appears last)
- **What error message** appears
- If Zod validation errors appear in the error details

### Step 3: Check Network Tab
1. Open DevTools Network tab
2. Fill form and submit
3. Look for the POST request to `/checkout/create-session` (or similar)
4. Click on the request
5. Go to "Request" or "Payload" tab
6. **Verify the request body contains:**
   ```json
   {
     "shippingAddress": {
       "firstName": "...",
       "lastName": "...",
       "email": "...",
       "phone": "...",
       "street": "...",
       "city": "...",
       "state": "...",
       "postalCode": "...",
       "country": "..."
     }
   }
   ```

### Step 4: Check Response
In the same Network request:
1. Go to "Response" tab
2. Should see error: `"Shipping address must be provided"`
3. If shipping address is in request but backend still says it's missing, the issue is backend-side

## Common Issues & Solutions

| Issue | Log Evidence | Solution |
|-------|--------------|----------|
| Form doesn't submit | Logs stop at `ShippingForm.handleFormSubmit` | Check browser console for JavaScript errors |
| Validation fails | See `❌ Shipping form validation failed` | Check Zod error in console, validate form data matches schema |
| Address is undefined at page | `📦 Validated address received: undefined` | Check form's onSubmit callback is properly called |
| Address is null | `📦 Shipping address is null: true` | Address wasn't properly passed from hook |
| Body doesn't include shippingAddress | `📨 Body has shippingAddress: false` | Check destructuring in checkoutService.js |
| Request body is undefined | Request has no body | Check if body is being set to undefined |

## Phone Validation Check
The user's phone: `+2347026125058`

Schema expects: `^\+?[1-9]\d{1,14}$`
- This means: optional `+`, then a digit 1-9, then 1-14 more digits
- User's phone: `+234 7026125058` = 1 (digit 2) + 3 (347) + 10 (7026125058)... 

Wait, let me re-count:
- After `+`: `2347026125058` = 13 digits
- First digit: `2` (matches [1-9]) ✓
- Remaining: `347026125058` = 12 digits (matches \d{1,14}) ✓
- **Total should be VALID**

If validation fails on phone, try formats:
- `+234702625058` (without the extra 6)
- `+2347026125058` (current - should work)
- Check if there are spaces or special characters in the actual input field

## Files Modified with Enhanced Logging
1. ✅ `FRONTEND_AUTH_IMPLEMENTATION/src/app/(app)/checkout/shipping/page.jsx` - Added comprehensive logging
2. ✅ `FRONTEND_AUTH_IMPLEMENTATION/src/components/checkout/ShippingForm.jsx` - Added form submission logging
3. ✅ `FRONTEND_AUTH_IMPLEMENTATION/src/hooks/useShipping.js` - Added hook validation logging
4. ✅ `FRONTEND_AUTH_IMPLEMENTATION/src/api/services/checkoutService.js` - Added API call logging

## Next Steps After Gathering Logs

1. **Share console logs** - Copy the entire sequence of logs from console
2. **Share network request/response** - Show the request body and response
3. **Share any error details** - If there are red error messages
4. Once we see the logs, we can pinpoint the exact issue and location

## Quick Checklist
- [ ] All form fields are filled in with valid data
- [ ] No validation errors appear in the logs
- [ ] Address object is created successfully
- [ ] Address is included in API request body
- [ ] Backend receives the address in req.body

If all checkboxes are true and you still get the error, the issue is in the backend validation.
