# Quick Start Guide - Spherekings Marketplace Backend

## 5-Minute Setup

### Step 1: Install Dependencies

```bash
npm install
```

This installs all required packages for the authentication system and backend framework.

### Step 2: Create Environment File

```bash
cp .env.example .env
```

Edit `.env` with your configuration. Minimum required:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/spherekings
JWT_SECRET=your-random-secret-key
JWT_REFRESH_SECRET=your-random-refresh-secret
```

### Step 3: Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**OR MongoDB Atlas (Cloud):**
1. Create account at [mongodb.com/cloud](https://mongodb.com/cloud)
2. Create cluster and get connection string
3. Add to `.env` as `MONGODB_URI`

### Step 4: Start Development Server

```bash
npm run dev
```

✅ Server running on `http://localhost:5000`

---

## Testing the API

### Test User Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!",
    "confirmPassword": "TestPass123!",
    "agreeToTerms": true
  }'
```

### Test User Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

Copy the `accessToken` from response.

### Test Protected Route

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Project Structure

```
src/
├── config/              # Configuration files
│   ├── database.js     # MongoDB connection
│   └── environment.js  # Environment variables
│
├── models/             # Mongoose schemas
│   └── User.js        # User model with authentication
│
├── controllers/        # HTTP request handlers
│   └── authController.js
│
├── services/          # Business logic
│   └── authService.js
│
├── routes/            # API route definitions
│   └── authRoutes.js
│
├── middlewares/       # Express middleware
│   ├── authMiddleware.js      # JWT verification
│   ├── roleMiddleware.js      # Role-based access
│   └── errorHandler.js        # Error handling
│
├── validators/        # Input validation
│   └── authValidator.js
│
├── utils/            # Utility functions
│   ├── jwtUtils.js           # JWT operations
│   └── passwordUtils.js      # Password hashing
│
└── server.js         # Main Express app
```

---

## Core Features

### ✅ User Authentication
- **Register**: Create new user accounts
- **Login**: Authenticate with email/password
- **JWT Tokens**: Secure token-based auth
- **Refresh Tokens**: Extend session automatically

### ✅ User Management
- **Update Profile**: Change name, phone, bio, address
- **Change Password**: Update password securely
- **Password Reset**: Forgot password flow ready
- **Account Status**: Track active/locked accounts

### ✅ Security
- **Bcrypt Hashing**: Industry-standard password security
- **Account Locking**: 5 failed attempts lock account
- **Rate Limiting**: Prevent brute force attacks
- **Token Expiration**: Automatic session timeout
- **HTTPS Ready**: Secure production deployment

### ✅ Role-Based Access
- **Customer**: Browse marketplace, place orders
- **Affiliate**: Manage referrals, track commissions
- **Admin**: Manage platform, products, affiliates

---

## Next Steps

### 1. Extend with Marketplace Features
```javascript
// src/models/Product.js
// src/routes/productRoutes.js
// src/controllers/productController.js
```

### 2. Add Cart Management
```javascript
// src/models/Cart.js
// src/routes/cartRoutes.js
```

### 3. Implement Affiliate System
```javascript
// src/models/ReferralClick.js
// src/models/Commission.js
// src/routes/affiliateRoutes.js
```

### 4. Integrate Payment Processing
```javascript
// Stripe webhook handlers
// Order creation on successful payment
```

---

## Common Commands

```bash
# Start development server with hot-reload
npm run dev

# Start production server
npm start

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Watch mode tests
npm run test:watch

# Generate test coverage
npm run test:coverage

# Seed database (when ready)
npm run seed
```

---

## Environment Variables

**Essential:**
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token secret

**Optional:**
- `CORS_ORIGIN` - Frontend URL
- `STRIPE_SECRET_KEY` - Payment processing
- `EMAIL_SERVICE` - Email provider
- `CLOUDINARY_CLOUD_NAME` - Image storage and optimization

See `.env.example` for complete list.

---

## Troubleshooting

### MongoDB Connection Fails
- Check MongoDB is running: `mongod`
- Verify connection string in `.env`
- Atlas users: Add IP to whitelist

### "JWT_SECRET not found"
- Copy `.env.example` to `.env`
- Edit `.env` with your values
- Restart server

### Port Already in Use
- Change `PORT` in `.env`
- Or kill process: `lsof -ti:5000 | xargs kill -9`

### Password Hash Issues
- Ensure bcrypt installed: `npm install bcrypt`
- Node version >= 14.0.0
- Check error logs in console

---

## API Documentation

See `AUTHENTICATION_SYSTEM.md` for complete API documentation including:
- All endpoints with examples
- Request/response formats
- Error codes and messages
- Authentication flows
- Security best practices

---

## Production Deployment

Before deploying to production:

1. **Security**
   - Generate strong JWT secrets
   - Set `NODE_ENV=production`
   - Enable HTTPS/SSL
   - Configure CORS properly

2. **Database**
   - Use MongoDB Atlas (cloud)
   - Enable authentication
   - Regular backups
   - Monitor performance

3. **Environment**
   - Move all secrets to env vars
   - Use secure .env file (not in git)
   - Set up monitoring and logging
   - Configure error tracking

4. **Testing**
   - Test all auth flows
   - Test role-based access
   - Test error handling
   - Load test rate limiting

---

## Support

For issues or questions:
1. Check `AUTHENTICATION_SYSTEM.md` for detailed docs
2. Review error messages in console
3. Check MongoDB logs
4. Verify environment variables

---

**Ready to build the marketplace! 🚀**

Next: Create Product Management System
