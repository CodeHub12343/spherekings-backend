# Authentication & User Management System Documentation

## Overview

The Spherekings Marketplace backend includes a production-ready Authentication and User Management system that supports three user roles: **customer**, **affiliate**, and **admin**. The system uses JWT for stateless authentication with bcrypt for secure password hashing.

---

## Architecture

### Components

```
┌─────────────────────────────────────────────────┐
│        Express HTTP Requests                    │
└────────────────────┬────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼────────┐      ┌──────▼──────┐
    │ Controllers │      │ Middleware  │
    └────┬────────┘      └──────┬──────┘
         │                      │
         ├──────────┬───────────┤
         │          │           │
    ┌────▼────┐ ┌───▼──┐  ┌────▼────┐
    │ Services │ │Utils │  │ Models  │
    └────┬────┘ └───┬──┘  └────┬────┘
         │          │          │
         └──────────┴──────────┴──┐
                                  │
                          ┌───────▼───────┐
                          │   MongoDB    │
                          └──────────────┘
```

### Key Layers

1. **Controllers** (`src/controllers/authController.js`)
   - HTTP request handlers
   - Input validation
   - Response formatting

2. **Services** (`src/services/authService.js`)
   - Business logic
   - User registration, login, profile management
   - Password reset flows

3. **Models** (`src/models/User.js`)
   - Mongoose schema definition
   - Pre-save middleware for password hashing
   - Instance methods for authentication

4. **Middleware** (`src/middlewares/`)
   - JWT token verification
   - Role-based authorization
   - Error handling

5. **Utils** (`src/utils/`)
   - JWT token generation/verification
   - Password hashing and validation
   - Token extraction helpers

---

## Database Schema

### User Collection

```javascript
{
  _id: ObjectId,                    // MongoDB primary key
  
  // Basic Information
  name: String,                     // Full name (required)
  email: String,                    // Unique email (required)
  password: String,                 // Hashed password (required)
  
  // Role and Permissions
  role: Enum,                       // 'customer' | 'affiliate' | 'admin'
  
  // Affiliate-Specific
  affiliateCode: String,            // Unique code (AFX12345678)
  affiliateStatus: String,          // 'pending' | 'active' | 'inactive' | 'suspended'
  
  // Email Verification
  isEmailVerified: Boolean,         // Default: false
  emailVerificationToken: String,   // For verification link
  emailVerificationExpires: Date,   // Token expiration
  
  // Password Reset
  passwordResetToken: String,       // Hashed reset token
  passwordResetExpires: Date,       // Reset token expiration
  
  // Account Security
  lastLogin: Date,                  // Last successful login
  loginAttempts: Number,            // Failed login counter
  lockUntil: Date,                  // Account lock expiration
  
  // Account Status
  isActive: Boolean,                // Default: true
  
  // Profile Information
  phoneNumber: String,              // Optional
  address: {                        // Optional
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  profileImage: String,             // URL to profile image
  bio: String,                      // User bio (max 500 chars)
  
  // Metadata
  createdAt: Date,                  // Account creation timestamp
  updatedAt: Date,                  // Last update timestamp
  deletedAt: Date                   // Soft delete marker
}
```

---

## API Endpoints

### Authentication Routes `/api/auth`

#### 1. Register New User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "role": "customer",         // Optional: 'customer' | 'affiliate' | 'admin'
  "phoneNumber": "+1234567890", // Optional
  "agreeToTerms": true
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "affiliateCode": null,
      "isEmailVerified": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "rememberMe": true  // Optional: sets 30-day cookie
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "lastLogin": "2024-01-15T10:30:00Z"
    }
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 3. Get Current User

```http
GET /api/auth/me
Authorization: Bearer <accessToken>
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Current user fetched successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    }
  }
}
```

#### 4. Refresh Token

```http
POST /api/auth/refresh
Authorization: Bearer <refreshToken>
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 5. Update Profile

```http
PUT /api/auth/profile
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "Jane Doe",
  "phoneNumber": "+1987654321",
  "bio": "I love board games!",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA"
  }
}
```

#### 6. Change Password

```http
POST /api/auth/change-password
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!",
  "confirmPassword": "NewPassword456!"
}
```

#### 7. Forgot Password

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "If the email exists, password reset link has been sent",
  "resetToken": "abc123def456..."  // Dev only
}
```

#### 8. Reset Password

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "resetToken": "abc123def456...",
  "newPassword": "NewPassword456!",
  "confirmPassword": "NewPassword456!"
}
```

#### 9. Logout

```http
POST /api/auth/logout
Authorization: Bearer <accessToken>
```

---

## Authentication Flow

### Registration Flow

```
User Registration Request
        ↓
Validate Input (Joi schema)
        ↓
Check Email Uniqueness
        ↓
Validate Password Strength
        ↓
Generate Affiliate Code (if affiliate role)
        ↓
Create User Document
        ↓
Hash Password (bcrypt middleware)
        ↓
Save to MongoDB
        ↓
Generate Access & Refresh Tokens
        ↓
Return User + Tokens
```

### Login Flow

```
User Login Request
        ↓
Validate Input
        ↓
Find User by Email
        ↓
Check Account Status & Lock Status
        ↓
Compare Password with Hash
        ↓
Password Valid?
    ├─ Yes: Update lastLogin, Reset Attempts
    │        Generate Tokens, Return Response
    │
    └─ No: Increment Login Attempts
           Check if >= 5 attempts? Lock Account
           Return Error
```

### Protected Route Access

```
Request with Authorization Header
        ↓
Extract Token from "Bearer <token>"
        ↓
Verify JWT Signature
        ↓
Check Token Expiration
        ↓
Check Token Type (access/refresh)
        ↓
Attach User Info to req.user
        ↓
Call Next Middleware/Route Handler
        ↓
If Invalid/Expired → 401 Unauthorized
```

### Role-Based Authorization

```
Protected Route (e.g., /api/admin/*)
        ↓
Authenticate User (verify token)
        ↓
Check user.role against allowed roles
        ↓
Role Matches?
    ├─ Yes: Grant Access, Call Handler
    │
    └─ No: Return 403 Forbidden
```

---

## Middleware Usage

### Authentication Middleware

```javascript
// Require authentication
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/protected-route', authenticateToken, (req, res) => {
  // req.user.userId and req.user.role available
  console.log(req.user.userId);
});
```

### Role-Based Middleware

```javascript
// Admin only
const { isAdmin } = require('../middlewares/roleMiddleware');

router.get('/admin-only', authenticateToken, isAdmin, (req, res) => {
  // Only admin users can access
});

// Affiliate or Admin
const { isAffiliateOrAdmin } = require('../middlewares/roleMiddleware');

router.get('/affiliate-dashboard', authenticateToken, isAffiliateOrAdmin, (req, res) => {
  // Affiliates and admins can access
});
```

---

## Security Features

### 1. Password Security

- **Bcrypt Hashing**: Passwords are hashed with 10 salt rounds
- **Password Strength Validation**:
  - Minimum 6 characters
  - Uppercase and lowercase letters recommended
  - Numbers recommended
  - Special characters recommended
- **Password Never Returned**: Password field excluded from all responses

### 2. JWT Security

- **Signed Tokens**: Tokens signed with HS256 algorithm
- **Expiration**: Access tokens expire in 7 days by default
- **Token Types**: Separate access and refresh token types
- **Refresh Token**: 30-day expiration for token renewal
- **Secret Management**: Keys stored in environment variables

### 3. Account Security

- **Account Locking**: 5 failed login attempts lock account for 2 hours
- **Rate Limiting**: 5 login attempts per 15 minutes per IP
- **Last Login Tracking**: Records last successful login
- **Account Status**: Tracks active/inactive status

### 4. Data Security

- **Sanitization**: NoSQL injection prevention with express-mongo-sanitize
- **CORS Protection**: Whitelist allowed origins
- **Helmet**: Security headers (X-Frame-Options, CSP, etc.)
- **Cookie Security**: HttpOnly, Secure (HTTPS), SameSite flags

### 5. Authorization

- **Role-Based Access Control**: Three roles: customer, affiliate, admin
- **Protected Routes**: Endpoints require valid authentication
- **Role Validation**: Middleware checks user role for operations

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "email": "Email already exists"
  }
}
```

### Common Error Codes

| Status | Message | Cause |
|--------|---------|-------|
| 400 | Validation failed | Invalid input data |
| 400 | Invalid email or password | Wrong credentials |
| 401 | Access token required | Missing authorization header |
| 401 | Token has expired | Access token expired |
| 401 | Invalid token | Malformed or invalid JWT |
| 403 | Access denied | Insufficient permissions |
| 409 | Email already exists | Email already registered |
| 500 | Internal Server Error | Server-side error |

---

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create .env File

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start MongoDB

```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas for cloud database
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

---

## Testing Authentication

### Using cURL

#### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!",
    "agreeToTerms": true
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

#### Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman

1. Create new request
2. Set method to POST
3. URL: `http://localhost:5000/api/auth/login`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```
6. Send and copy `accessToken from response
7. For protected routes, add header: `Authorization: Bearer {accessToken}`

---

## Password Reset Flow

### Email-Based Password Reset (Production)

1. User requests password reset with email
2. Backend generates reset token (valid 24 hours)
3. Email sent with reset link: `https://app.com/reset-password?token=xyz`
4. User clicks link and enters new password
5. Backend validates token and updates password
6. User can login with new password

### Implementation

The `requestPasswordReset` and `resetPassword` functions are ready. To enable email:

```javascript
// In authController.js
const sendPasswordResetEmail = async (email, resetToken) => {
  // Use your email service (Nodemailer, SendGrid, etc.)
};
```

---

## Performance Optimization

### 1. Token Caching
Cache JWT secret in memory to avoid repeated env var reads

### 2. User Lookups
Database indexes on `email`, `affiliateCode` for fast queries

### 3. Rate Limiting
Built-in rate limiting prevents brute force attacks

### 4. Connection Pooling
Mongoose manages MongoDB connection pool automatically

---

## Scaling Considerations

### 1. Stateless Authentication
JWT means no session storage needed - scales horizontally

### 2. Database Optimization
Add Redis to cache frequently accessed user data

### 3. Load Balancing
Multiple instances behind load balancer share JWT secret

### 4. Caching Strategy
Cache user profiles with short TTL (5-10 minutes)

---

## Production Checklist

- [ ] Change JWT_SECRET in production
- [ ] Change JWT_REFRESH_SECRET
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS (secure cookies)
- [ ] Configure CORS with specific origins
- [ ] Set up email service for password resets
- [ ] Enable password reset token in production
- [ ] Set up monitoring and logging
- [ ] Regular security audits
- [ ] Test rate limiting
- [ ] Test account lockout mechanism

---

## Future Enhancements

1. **Two-Factor Authentication (2FA)**: SMS or email OTP
2. **Social Login**: Google, Facebook, GitHub OAuth
3. **Email Verification Workflow**: Confirm email before account activation
4. **Audit Logging**: Track all authentication events
5. **Session Management**: Track multiple login sessions
6. **API Key Authentication**: For third-party integrations
7. **OAuth 2.0 Server**: Allow third-party apps to OAuth with Spherekings
8. **WebAuthn/Passkeys**: Passwordless authentication

---

## Support & Debugging

### Enable Debug Logging

```javascript
// In src/config/environment.js
console.log('JWT Secret loaded:', !!config.JWT_SECRET);
console.log('MongoDB URI:', config.MONGODB_URI);
```

### Check JWT Token Contents

```javascript
// In browser console
const token = 'YOUR_TOKEN';
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log(payload);
```

### Monitor Failed Logins

Check MongoDB for users with non-zero `loginAttempts`:

```javascript
db.users.find({ loginAttempts: { $gt: 0 } });
```

---

## References

- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security](https://docs.mongodb.com/manual/security/)

---

**System Status**: ✅ Production Ready
**Last Updated**: March 2026
**Version**: 1.0.0
