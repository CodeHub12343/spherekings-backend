# Spherekings Frontend Authentication System - Complete Implementation Guide

## Overview

This is a **production-ready frontend authentication system** for Spherekings Marketplace built with **Next.js 14**, **React 18**, **Styled Components**, and **Framer Motion**.

The system implements:
- ✅ User registration with validation
- ✅ User login with JWT authentication
- ✅ Automatic token refresh
- ✅ Password reset with email tokens
- ✅ Forgot password flow
- ✅ Protected routes with role-based access control
- ✅ Global auth state management
- ✅ Toast notifications
- ✅ Responsive design
- ✅ Smooth animations

---

## Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | Next.js 14 (App Router) | Full-stack React framework with file-based routing |
| UI Library | React 18 | Component library with hooks |
| Styling | styled-components | CSS-in-JS with theming |
| Animation | Framer Motion | Smooth page/component animations |
| Icons | Lucide React | 200+ built-in SVG icons |
| HTTP Client | Axios | HTTP requests with interceptors |
| State Management | React Context + Zustand (optional) | Global state management |
| Forms | react-hook-form (optional) | Advanced form handling |
| Validation | Custom schemas | Client-side form validation |
| Deployment | Vercel | Recommended Next.js hosting |

---

## Project Structure

```
FRONTEND_AUTH_IMPLEMENTATION/
├── src/
│   ├── app/
│   │   ├── layout.jsx                 # Root layout with providers
│   │   ├── page.jsx                   # Home page
│   │   ├── (auth)/
│   │   │   ├── register/page.jsx      # Registration form
│   │   │   ├── login/page.jsx         # Login form
│   │   │   ├── forgot-password/page.jsx
│   │   │   └── reset-password/[token]/page.jsx
│   │   └── dashboard/page.jsx         # Protected dashboard
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.jsx             # Reusable button
│   │   │   ├── Input.jsx              # Reusable input field
│   │   │   └── Toast.jsx              # Toast notifications
│   │   ├── ProtectedRoute.jsx         # Auth protection wrapper
│   │   └── ...other components
│   ├── contexts/
│   │   └── AuthContext.jsx            # Global auth state
│   ├── api/
│   │   ├── client.js                  # Axios HTTP client
│   │   ├── services/
│   │   │   ├── authService.js         # Auth API endpoints
│   │   │   └── ...other services
│   │   ├── config/
│   │   │   └── api.config.js          # API configuration
│   │   └── interceptors/
│   │       └── ...axios interceptors
│   ├── styles/
│   │   ├── globals.js                 # Global CSS
│   │   ├── theme.js                   # Theme configuration
│   │   └── ...other styles
│   ├── utils/
│   │   ├── validation.js              # Form validation
│   │   ├── tokenManager.js            # Token lifecycle
│   │   └── ...utilities
│   └── hooks/
│       └── ...custom hooks
├── .env.local                         # Environment variables
├── package.json
├── next.config.js
├── jsconfig.json
└── README.md
```

---

## Installation & Setup

### Prerequisites

- **Node.js 16.8+** or **Node.js 18+** (recommended)
- **npm 8+** or **yarn 3+**
- Backend API running on `http://localhost:5000/api/v1`
- Git

### Step 1: Clone or Create Project

```bash
# If cloning existing project
git clone <repository-url>
cd FRONTEND_AUTH_IMPLEMENTATION

# OR create new Next.js project
npx create-next-app@latest spherekings-frontend --typescript=false
cd spherekings-frontend
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

**Key packages installed:**
```bash
npm install next react react-dom
npm install styled-components
npm install framer-motion
npm install lucide-react
npm install axios
npm install zustand # Optional: additional state management
```

### Step 3: Configure Environment Variables

Create `.env.local` file in project root:

```bash
# .env.local

# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Token Configuration (optional)
NEXT_PUBLIC_TOKEN_KEY=spherekings_access_token
NEXT_PUBLIC_REFRESH_TOKEN_KEY=spherekings_refresh_token
```

### Step 4: Start Development Server

```bash
npm run dev
# or
yarn dev
```

**Expected output:**
```
> next dev
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 1234ms
```

Open **http://localhost:3000** in your browser.

### Step 5: Verify Setup

Navigate to pages and verify they load:
- ✅ http://localhost:3000 - Home
- ✅ http://localhost:3000/register - Registration form
- ✅ http://localhost:3000/login - Login form
- ✅ http://localhost:3000/forgot-password - Forgot password form
- ✅ http://localhost:3000/dashboard - Protected dashboard (redirects to login if not authenticated)

---

## API Endpoints Reference

### Authentication Endpoints

All endpoints respond to the base URL: `http://localhost:5000/api/v1`

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/auth/register` | `{email, firstName, lastName, phone?, password, confirmPassword}` | `{user, accessToken, refreshToken}` |
| POST | `/auth/login` | `{email, password}` | `{user, accessToken, refreshToken}` |
| POST | `/auth/logout` | - | `{success: true}` |
| POST | `/auth/refresh` | `{refreshToken}` | `{accessToken, refreshToken}` |
| GET | `/auth/me` | - | `{user}` |
| POST | `/auth/forgot-password` | `{email}` | `{message: 'Email sent'}` |
| POST | `/auth/reset-password` | `{token, password, confirmPassword}` | `{message: 'Password reset'}` |

### Request Headers

All authenticated requests include:

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

---

## Core Features Explained

### 1. Authentication Context (Global State)

**File:** `src/contexts/AuthContext.jsx`

Provides authentication state to entire app:

```javascript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, isLoading, error, login, register, logout } = useAuth();

  // user: { id, email, firstName, lastName, role, isActive, emailVerified }
  // isAuthenticated: boolean
  // isLoading: boolean (during API calls)
  // error: string or null
}
```

### 2. Protected Routes

**File:** `src/components/ProtectedRoute.jsx`

Wrap components to require authentication:

```javascript
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <YourDashboard />
    </ProtectedRoute>
  );
}

// With role-based access:
export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminPanel />
    </ProtectedRoute>
  );
}
```

### 3. Token Management

**File:** `src/utils/tokenManager.js`

Handles JWT token lifecycle:

```javascript
import { tokenManager } from '@/utils/tokenManager';

// Store tokens after login
tokenManager.setTokens(accessToken, refreshToken);

// Get current token
const token = tokenManager.getAccessToken();

// Check if expired
const isExpired = tokenManager.isTokenExpired(token);

// Auto-refresh when needed (handled by Axios interceptor)
if (tokenManager.shouldRefreshToken()) {
  // Refresh will be triggered automatically
}

// Clear on logout
tokenManager.clearTokens();
```

### 4. Form Validation

**File:** `src/utils/validation.js`

Comprehensive client-side validation:

```javascript
import { 
  validateLoginForm, 
  validateRegisterForm,
  validateEmail,
  validatePassword 
} from '@/utils/validation';

// Login validation
const { isValid, errors } = validateLoginForm({
  email: 'user@example.com',
  password: 'Password123!'
});

// Register validation
const { isValid, errors } = validateRegisterForm({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  password: 'MySecurePass123!',
  confirmPassword: 'MySecurePass123!'
});

// Individual field validation
const emailValidation = validateEmail('user@example.com');
// Returns: { isValid: true, error: '' }
```

**Password Requirements:**
- Minimum 8 characters
- 1 uppercase letter (A-Z)
- 1 lowercase letter (a-z)
- 1 number (0-9)
- 1 special character (@$!%*?&)

### 5. HTTP Client with Interceptors

**File:** `src/api/client.js`

Automatic token injection and refresh:

```javascript
import client from '@/api/client';

// Automatically includes Authorization header
const response = await client.get('/user/profile');

// Automatically handles token refresh on 401
// If access token expired, requests refresh
// Retries failed request with new token
```

### 6. Toast Notifications

**File:** `src/components/ui/Toast.jsx`

Global notification system:

```javascript
import { useToast } from '@/components/ui/Toast';

function MyComponent() {
  const { success, error, info, warning } = useToast();

  const handleClick = () => {
    success('Operation successful!');
    error('Something went wrong');
    info('Information message');
    warning('Warning message');
  };

  // Auto-dismisses after 3 seconds
}
```

---

## Testing the Authentication System

### Test Scenario 1: User Registration

**Steps:**
1. Open http://localhost:3000/register
2. Fill form with valid data:
   - Email: `test@example.com`
   - First Name: `John`
   - Last Name: `Doe`
   - Phone: `+1234567890` (optional)
   - Password: `MyPassword123!`
   - Confirm Password: `MyPassword123!`
3. Click "Create Account"
4. Expected results:
   - ✅ Form validates without errors
   - ✅ POST request to `/api/v1/auth/register`
   - ✅ Success toast appears
   - ✅ Redirects to `/dashboard`

**Debug if fails:**
- Check browser Console (F12 → Console)
- Check Network tab for API response
- Check backend logs on `http://localhost:5000`
- Verify `.env.local` has correct `NEXT_PUBLIC_API_URL`

### Test Scenario 2: User Login

**Steps:**
1. Open http://localhost:3000/login
2. Fill form:
   - Email: `test@example.com`
   - Password: `MyPassword123!`
3. Click "Sign In"
4. Expected results:
   - ✅ Form validates
   - ✅ POST request to `/api/v1/auth/login`
   - ✅ Tokens stored in localStorage
   - ✅ Redirects to `/dashboard`
   - ✅ Dashboard displays user info

**Verify tokens stored:**
1. Open DevTools: F12 → Application → Local Storage
2. Look for keys:
   - `spherekings_access_token`
   - `spherekings_refresh_token`
   - `spherekings_token_expiry`

### Test Scenario 3: Protected Routes

**Steps:**
1. Clear localStorage (DevTools → Storage → Clear Site Data)
2. Try accessing http://localhost:3000/dashboard
3. Expected results:
   - ✅ Redirects to `/login`
   - ✅ Cannot access dashboard without auth

### Test Scenario 4: Token Refresh

**Steps:**
1. Login successfully
2. Open DevTools → Network tab
3. Set network throttling to "Slow 3G"
4. Make any API call
5. Expected results:
   - ✅ If token expired, automatic refresh happens
   - ✅ Request retries with new token
   - ✅ User stays logged in without redirect

### Test Scenario 5: Logout

**Steps:**
1. On dashboard, click "Logout" button
2. Expected results:
   - ✅ Tokens cleared from localStorage
   - ✅ Redirects to `/login`
   - ✅ Trying to access dashboard now redirects to login

---

## Common Issues & Solutions

### Issue 1: "Cannot read properties of undefined reading 'auth'"

**Cause:** AuthProvider not wrapping the app

**Solution:**
```javascript
// src/app/layout.jsx must have:
<AuthProvider>
  <ToastProvider>
    {children}
  </ToastProvider>
</AuthProvider>
```

### Issue 2: Registration/Login produces no response

**Cause:** Backend API URL incorrect

**Solution:**
1. Check `.env.local` has correct URL
2. Verify backend is running on `http://localhost:5000`
3. Check CORS settings on backend

### Issue 3: Tokens not storing  

**Cause:** localStorage disabled or cookie settings issue

**Solution:**
1. In DevTools → Settings → Disable "Block third-party cookies"
2. Check that `tokenManager.setTokens()` is being called
3. Clear browser cache and try again

### Issue 4: Infinite redirect loop on login

**Cause:** Auth context not initializing properly

**Solution:**
1. Check that `AuthContext` calls `getCurrentUser()` on init
2. Verify backend `/auth/me` endpoint works
3. Check token validity with decoder: https://jwt.io

### Issue 5: Password validation too strict

**Cause:** Password regex requirements

**Solution:** Edit `src/utils/validation.js`
```javascript
// Change PASSWORD_REGEX to adjust requirements
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
// Remove special char requirement: remove (?=.*[@$!%*?&])
```

---

## Deployment

### Deploy to Vercel (Recommended)

**Step 1: Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit: Frontend auth system"
git remote add origin <github-repo-url>
git push origin main
```

**Step 2: Connect to Vercel**
1. Go to https://vercel.com
2. Click "New Project"
3. Import GitHub repository
4. Select `FRONTEND_AUTH_IMPLEMENTATION`
5. Configure environment variables:
   - `NEXT_PUBLIC_API_URL=http://production-api.com/api/v1`
   - `NEXT_PUBLIC_APP_URL=https://your-domain.com`
6. Deploy

**Step 3: Update Backend CORS**

Backend must allow requests from your Vercel domain:
```javascript
// Backend cors config
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://your-domain.com',
  'https://your-project.vercel.app'
];
```

### Alternative: Deploy to Self-Hosted Server

**Step 1: Build for production**
```bash
npm run build
# Generates .next/ folder with optimized code
```

**Step 2: Deploy to server**
```bash
# Copy to server
scp -r .next/ user@server:/app/

# Install dependencies
npm install --production

# Start server
npm run start
```

**Step 3: Use process manager (PM2)**
```bash
npm install -g pm2

pm2 start npm --name "app" -- run start
pm2 save
pm2 startup
```

---

## File Modifications & Customization

### Customize Theme Colors

**File:** `src/app/layout.jsx`

```javascript
const theme = {
  colors: {
    primary: '#5b4dff',      // Purple
    secondary: '#0f172a',    // Dark blue
    accent: '#f59e0b',       // Amber
    success: '#10b981',      // Green
    error: '#ef4444',        // Red
    warning: '#f59e0b',      // Amber
    gray100: '#f9fafb',
    gray500: '#6b7280',
    gray900: '#111827'
  }
};
```

### Customize Button Styles

**File:** `src/components/ui/Button.jsx`

```javascript
// Change animation speed
transition={{ duration: 0.15 }}  // Faster/slower

// Change color
const variants = {
  primary: css`
    background: #5b4dff;
    color: white;
  `,
  // Add custom variant
  custom: css`
    background: #your-color;
  `
};
```

### Add Custom Form Validation

**File:** `src/utils/validation.js`

```javascript
export const validateCustomField = (value) => {
  if (!value) return { isValid: false, error: 'Field required' };
  if (value.length < 5) return { isValid: false, error: 'Min 5 chars' };
  return { isValid: true, error: '' };
};
```

---

## Performance Optimization

### Code Splitting & Lazy Loading

```javascript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/Heavy'), {
  loading: () => <p>Loading...</p>
});
```

### Image Optimization

```javascript
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={100}
  height={100}
  quality={75}  // Compress
/>
```

### Environment-Specific Config

```javascript
// src/utils/config.js
export const config = {
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
  apiUrl: process.env.NEXT_PUBLIC_API_URL
};
```

---

## Security Best Practices

✅ **Implemented:**
- JWT tokens in Authorization header (not cookies by default)
- Automatic token refresh on 401 responses
- XSS prevention via React's default escaping
- CSRF protection via JWT in header
- Secure token storage in localStorage
- Password validation requirements
- Email format validation
- Sensible error messages (no info leakage)

⚠️ **Additional Considerations:**
- Use HTTPS in production (enforced by Vercel)
- Implement CSRF token if using cookies
- Add rate limiting on backend
- Implement 2FA for sensitive operations
- Use Content Security Policy (CSP) headers
- Regularly update dependencies: `npm audit`, `npm update`

---

## Troubleshooting Checklist

Before reporting issues, verify:

- [ ] Node.js 16.8+ installed: `node --version`
- [ ] All dependencies installed: `npm install`
- [ ] `.env.local` file created with correct values
- [ ] Backend API running: `http://localhost:5000/api/v1`
- [ ] Backend CORS configured for `http://localhost:3000`
- [ ] Browser console shows no errors: F12 → Console
- [ ] Network requests showing correct endpoints: F12 → Network
- [ ] localStorage contains tokens after login: F12 → Application
- [ ] Cookies not blocking auth: F12 → Settings → Cookies
- [ ] Port 3000 not in use: `lsof -i :3000` (macOS/Linux)

---

## Next Steps & Feature Extensions

### Recommended Future Enhancements

1. **Email Verification**
   - Send verification email on signup
   - Block login until verified
   - Resend verification endpoint

2. **Two-Factor Authentication (2FA)**
   - SMS/Email second factor
   - TOTP support
   - Backup codes

3. **OAuth Integration**
   - Google Sign-In
   - Facebook Login
   - GitHub Sign-In

4. **User Profile Management**
   - Edit profile page
   - Avatar upload
   - Preference settings

5. **Admin Dashboard**
   - User management
   - Role assignment
   - Activity logs

6. **Analytics & Monitoring**
   - Google Analytics integration
   - Error tracking (Sentry)
   - Performance monitoring

---

## Support & Resources

- **Next.js Docs:** https://nextjs.org/docs
- **React Docs:** https://react.dev
- **styled-components Docs:** https://styled-components.com/docs
- **Framer Motion Docs:** https://www.framer.com/motion/
- **Axios Docs:** https://axios-http.com/docs/intro
- **Vercel Docs:** https://vercel.com/docs

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-14 | Initial release - Authentication system complete |

---

## License

This project is part of the Spherekings Marketplace backend & frontend system. All rights reserved.

---

**Last Updated:** March 14, 2026  
**Status:** ✅ Production Ready
