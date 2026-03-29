# Registration Field Name Mismatch - Fixed ✅

## Problem Identified
Frontend was sending different field names than what the backend expected, causing 400 Bad Request with error: "Name must be at least 2 characters"

## Root Cause
- **Backend Schema** (authValidator.js registerSchema):
  - Expects: `name` (single field, 2-50 chars)
  - Expects: `email`, `password`, `confirmPassword`
  - Expects: `role` (optional, defaults to 'customer')

- **Frontend Was Sending**:
  - Sent: `first_name`, `last_name` (wrong field names)
  - Included: `phone` (not in backend schema)

## Solution Implemented

### 1. Updated `src/api/services/authService.js`
- Modified `registerUser()` function to:
  - Combine `firstName` and `lastName` into single `name` field
  - Include `confirmPassword` in request
  - Remove `phone` field
  - Include `role: 'customer'` default
  - Updated logging to show correct data format

**Data Transformation**:
```javascript
// OLD (WRONG):
{ first_name: "adepoju", last_name: "emmanuel", email: "...", password: "..." }

// NEW (CORRECT):
{ name: "adepoju emmanuel", email: "...", password: "...", confirmPassword: "...", role: "customer" }
```

### 2. Updated `src/utils/validation.js`
- Modified `validateRegisterForm()` to:
  - Validate combined `name` field (firstName + lastName combined)
  - Keep individual firstName/lastName inputs for UI
  - Validate that combined name is 2-50 characters
  - Include `confirmPassword` validation
  - Removed `phone` field validation

### 3. Updated `src/app/(auth)/register/page.jsx`
- Removed `phone` field from:
  - Form state initialization
  - Form submission data
  - Form inputs (JSX)
- Kept `firstName` and `lastName` separate in UI for better UX
- Added `confirmPassword` to submission (was already in form)

## Backend Field Requirements
```javascript
name:              string(2-50, required) - MUST be combined firstName + lastName
email:             string(email format, required)
password:          string(min 6 chars, required)
confirmPassword:   string(must match password, required)
role:              string('customer'|'affiliate'|'admin', optional - defaults to 'customer')
```

## Testing the Fix

### Step 1: Fill Registration Form
```
Email: test@example.com
First Name: John
Last Name: Doe
Password: Test@12345
Confirm Password: Test@12345
```

### Step 2: What Gets Sent to Backend
```json
{
  "name": "John Doe",
  "email": "test@example.com",
  "password": "Test@12345",
  "confirmPassword": "Test@12345",
  "role": "customer"
}
```

### Step 3: Expected Result
✅ 200 OK response with:
```json
{
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "test@example.com",
    "role": "customer",
    ...
  },
  "accessToken": "...",
  "refreshToken": "..."
}
```

## Files Changed
1. ✅ `src/api/services/authService.js` - Data transformation
2. ✅ `src/utils/validation.js` - Combined name validation
3. ✅ `src/app/(auth)/register/page.jsx` - Removed phone field

## Status
🟢 **READY FOR TESTING** - All changes implemented and verified

## Common Issues & Solutions

### Issue: Still Getting "Name must be at least 2 characters"
- ✅ Check browser DevTools Console to see what data is being sent
- ✅ Verify both firstName and lastName are filled
- ✅ The authService logs show exactly what's being sent

### Issue: "Password does not meet requirements"
- ✅ Password must contain: uppercase, lowercase, number, special char (@, #, $, etc)
- ✅ Example: `Test@12345` ✓ or `MyPass123!` ✓

### Issue: "Email already in use"
- ✅ Try a different email address
- ✅ Check if you already registered with this email

## Next Steps
1. Test registration with the corrected field format
2. Verify redirect to dashboard
3. Test login functionality
4. Test protected routes
5. Test token refresh
