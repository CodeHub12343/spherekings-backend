# Spherekings Postman Collection & Environments

Complete API testing setup for the Spherekings Marketplace & Affiliate System backend.

## 📦 Files Included

### Collections
- **Spherekings-API-Collection.postman_collection.json** - Complete API collection with 40+ endpoints organized by module

### Environments
- **Spherekings-Dev-Environment.postman_environment.json** - Development environment (localhost:5000)
- **Spherekings-Staging-Environment.postman_environment.json** - Staging environment (staging-api.spherekings.com)
- **Spherekings-Production-Environment.postman_environment.json** - Production environment (api.spherekings.com)

## 🚀 Quick Start

### 1. Import Collection into Postman

**Method 1: Direct Import**
1. Open **Postman**
2. Click **Import** (top left menu)
3. Select **Upload File**
4. Choose **Spherekings-API-Collection.postman_collection.json**
5. Click **Import**

**Method 2: Link Import**
1. Click **Import** in Postman
2. Paste the file path or URL
3. Click **Import**

### 2. Import Environment

1. Click the **gear icon** (Environment) in top right
2. Click **Import**
3. Select one of the environment files:
   - For local testing: **Spherekings-Dev-Environment.postman_environment.json**
   - For staging: **Spherekings-Staging-Environment.postman_environment.json**
   - For production: **Spherekings-Production-Environment.postman_environment.json**
4. Click **Import**

### 3. Select Environment

1. Click environment dropdown (top right, next to settings)
2. Select **Spherekings - Development** (or your chosen environment)

## 📋 Collection Structure

### Modules

**Auth** - User authentication
- Register User
- Login User
- Get Current User
- Update User Profile
- Refresh Token

**Products** - Product management
- Get All Products
- Get Product by ID
- Create Product (Admin)
- Update Product (Admin)
- Delete Product (Admin)

**Cart** - Shopping cart
- Get Cart
- Add to Cart
- Update Cart Item
- Remove from Cart
- Clear Cart

**Checkout** - Payment processing
- Create Checkout Session
- Validate Coupon
- Calculate Shipping

**Orders** - Order management
- Get All Orders
- Get Order by ID
- Create Order
- Update Order Status (Admin)
- Cancel Order

**Affiliate** - Affiliate management
- Register as Affiliate
- Get Affiliate Dashboard
- Get Affiliate Stats
- Update Affiliate Profile
- Get Affiliate Leaderboard

**Referral Tracking** - Referral analytics
- Track Referral Click
- Get Referral Clicks
- Get Referral Conversions

**Commissions** - Commission management
- Get Affiliate Commissions
- Get Commission by ID
- Get Commission Summary

**Payouts** - Payout management
- Get Payout History
- Request Payout
- Get Payout by ID

**Admin** - Admin dashboard
- Get Dashboard Stats
- Get All Users
- Approve Payout
- Reject Payout
- Get All Payouts
- Get All Orders

**File Upload** - Cloudinary uploads
- Upload Product Image
- Upload Multiple Product Images
- Upload Avatar
- Delete File

## 🔑 Environment Variables

All environments include these variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `base_url` | API base URL | http://localhost:5000 |
| `token` | JWT authentication token | (auto-populated after login) |
| `user_id` | Current user ID | (auto-populated after register) |
| `product_id` | Selected product ID | (auto-populated after create) |
| `order_id` | Selected order ID | (auto-populated after order) |
| `affiliate_id` | Affiliate account ID | (auto-populated after signup) |
| `affiliate_code` | Affiliate referral code | (auto-populated) |
| `commission_id` | Commission record ID | (auto-populated) |
| `payout_id` | Payout request ID | (auto-populated) |
| `api_version` | API version | v1 |
| `test_email` | Test user email | testuser@example.com |
| `test_password` | Test user password | TestPassword123! |
| `timeout` | Request timeout (ms) | 5000 |

## 🔐 Authentication Flow

1. **First Request**: Login user
   - Endpoint: `POST /api/v1/auth/login`
   - Sends: email & password
   - Receives: JWT token
   - Auto-saves: `token` variable

2. **Subsequent Requests**: Token auto-attached
   - All authenticated endpoints use `Bearer {{token}}`
   - Token automatically included via collection settings

3. **Token Refresh**: Use when token expires
   - Endpoint: `POST /api/v1/auth/refresh`
   - Uses: Current token
   - Updates: `token` variable with new token

## 📝 Testing Workflows

### Customer Workflow
1. Register User
2. Login User ← Saves token
3. Get All Products
4. Add to Cart
5. Create Order
6. Get Order Status

### Affiliate Workflow
1. Login User ← Saves token
2. Register as Affiliate ← Saves affiliate_id & code
3. Get Affiliate Dashboard
4. Track Referral Click (as customer)
5. View Commissions
6. Request Payout
7. Admin Approves Payout

### Admin Workflow
1. Login as Admin ← Saves token
2. Get Dashboard Stats
3. Get All Users
4. Get All Payouts (filter by status)
5. Approve/Reject Payout

### Product Upload Workflow
1. Create Product
2. Upload Product Image ← Gets URL
3. Update Product with image URL
4. Upload Multiple Images
5. Get Product details

## 🧪 Test Scripts

**Pre-Request Scripts**: Auto-attach headers
- `Authorization: Bearer {{token}}`
- `Content-Type: application/json`

**Test Scripts**: Validate responses
- Check HTTP status codes (200, 201, 400, 401, 500)
- Save response data to collection variables
- Validate response structure
- Measure response time

## 🌍 Environment Configuration

### Development
```
base_url: http://localhost:5000
timeout: 5000ms
```

### Staging
```
base_url: https://staging-api.spherekings.com
timeout: 10000ms
```

### Production
```
base_url: https://api.spherekings.com
timeout: 15000ms
```

## 📤 Setting Up Your Own Environment

To create a custom environment:

1. In Postman, click **gear icon** → **Environments**
2. Click **Create New**
3. Add these variables:
   ```
   base_url: your-api-url
   token: (leave empty - auto-populated)
   user_id: (leave empty - auto-populated)
   (etc. for all variables)
   ```
4. Save with a clear name (e.g., "Spherekings - Custom")

## 🔍 Tips & Tricks

### Auto-populate Variables
After key endpoints, variables are automatically saved:

- Login: `token` → saved
- Register: `user_id` → saved
- Create Product: `product_id` → saved
- Create Order: `order_id` → saved
- Register Affiliate: `affiliate_id` → saved

### Chaining Requests
1. Use one endpoint's response as input for the next
2. All resource IDs auto-populate
3. Example flow: Register → Login → Add to Cart → Order

### Debugging
1. Open **Console** (bottom left)
2. View request/response details
3. Check variable values
4. Inspect test script output

### Bulk Testing
1. Select multiple endpoints in a folder
2. Click `Run`
3. Choose number of iterations
4. View results in **Runner**

## 🚨 Common Issues

### "Token not found"
- **Fix**: Run **Auth > Login** endpoint first
- It auto-saves the token variable

### "Product ID is empty"
- **Fix**: Run **Products > Create Product** first
- It auto-saves the product_id variable

### "401 Unauthorized"
- **Fix**: Check if `token` variable is set
- Login again if token expired
- Use **Auth > Refresh** to get new token

### "404 Not Found"
- **Cause**: Resource ID doesn't exist
- **Fix**: Create the resource first
- OR use auto-populated variable names

### CORS Errors
- These are normal in Postman (it handles them)
- In browser/frontend, CORS must be configured
- Server has CORS enabled for development

## 📚 API Documentation

For detailed endpoint documentation, see:
- `src/PRODUCT_API_DOCUMENTATION.js`
- `src/ORDER_API_DOCUMENTATION.js`
- `src/CHECKOUT_API_DOCUMENTATION.js`
- `src/AFFILIATE_API_DOCUMENTATION.js`

## 🛠️ Integration with CI/CD

Use Newman (Postman CLI) for automated testing:

```bash
# Install Newman
npm install -g newman

# Run collection
newman run Spherekings-API-Collection.postman_collection.json \
  -e Spherekings-Dev-Environment.postman_environment.json

# Generate HTML report
newman run Spherekings-API-Collection.postman_collection.json \
  -e Spherekings-Dev-Environment.postman_environment.json \
  -r htmlextra
```

## 📞 Support

For API issues, check:
1. `.env` file configuration
2. MongoDB connection status
3. Server logs (npm run dev output)
4. Network tab in browser console

## 📄 Version Info

- **Collection Version**: v1.0.0
- **Created**: March 13, 2026
- **API Version**: v1
- **Postman Compatibility**: v11.0+

---

**Happy Testing! 🎉**
