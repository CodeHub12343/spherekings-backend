# Spherekings Frontend Auth - Complete File Reference

**Generated:** March 14, 2026  
**Status:** ✅ Production Ready  
**Total Files Created:** 21+ core files

---

## 📁 Quick File Locations

### Root Configuration
```
📄 .env.local                 - Environment variables
📄 package.json               - Dependencies (auto-present)
📄 next.config.js             - Next.js config (auto-present)
📄 jsconfig.json              - Path aliases (auto-present)
```

### Documentation
```
📄 FRONTEND_AUTH_SETUP_GUIDE.md           - Complete setup guide
📄 SPHEREKINGS_COMPLETE_INTEGRATION.md    - System architecture
📄 QUICK_START_COMMANDS.md                - Command reference
📄 FILE_REFERENCE.md                      - This file
```

---

## 🔧 Application Files

### Layout & Pages

| File | Purpose | Type | Exports |
|------|---------|------|---------|
| `src/app/layout.jsx` | Root layout with providers | Component | Default |
| `src/app/page.jsx` | Home page | Component | Default |
| `src/app/(auth)/register/page.jsx` | Registration form | Page | Default |
| `src/app/(auth)/login/page.jsx` | Login form | Page | Default |
| `src/app/(auth)/forgot-password/page.jsx` | Forgot password form | Page | Default |
| `src/app/(auth)/reset-password/[token]/page.jsx` | Reset password form | Dynamic page | Default |
| `src/app/dashboard/page.jsx` | Protected dashboard | Page | Default |

---

### Core Context & State

| File | Location | Purpose | Key Exports | Import |
|------|----------|---------|-------------|--------|
| **AuthContext** | `src/contexts/AuthContext.jsx` | Global auth state | `AuthProvider`, `useAuth` | `useAuth()` hook |

**Usage:**
```javascript
import { useAuth } from '@/contexts/AuthContext';

// In component
const { user, isAuthenticated, isLoading, login, register, logout } = useAuth();
```

**Provided Values:**
- `user`: { id, email, firstName, lastName, role, isActive, emailVerified, phone }
- `isAuthenticated`: boolean
- `isLoading`: boolean
- `error`: string or null
- `register(userData)`: async function
- `login(credentials)`: async function
- `logout()`: async function
- `updateUser(data)`: function
- `clearError()`: function

---

### API Layer

| File | Location | Purpose | Key Exports | Import |
|------|----------|---------|-------------|--------|
| **HTTP Client** | `src/api/client.js` | Axios with interceptors | Default export | `import client from '@/api/client'` |
| **Auth Service** | `src/api/services/authService.js` | Auth endpoints | `authService` | `import { authService } from '@/api/services/authService'` |
| **API Config** | `src/api/config/api.config.js` | Constants & config | Default export | `import apiConfig from '@/api/config/api.config'` |

**Auth Service Methods:**
```javascript
import { authService } from '@/api/services/authService';

authService.register(userData)           // POST /auth/register
authService.login(credentials)           // POST /auth/login
authService.logout()                     // POST /auth/logout
authService.refreshToken(refreshToken)   // POST /auth/refresh
authService.getCurrentUser()             // GET /auth/me
authService.forgotPassword(email)        // POST /auth/forgot-password
authService.resetPassword(token, pwd, confirmPwd)  // POST /auth/reset-password
```

**Axios Client:**
```javascript
import client from '@/api/client';

// Usage - automatically handles:
// - Authorization header injection
// - Token refresh on 401
// - Request queuing during refresh
const response = await client.get('/endpoint');
const response = await client.post('/endpoint', data);
```

---

### Utilities

| File | Location | Purpose | Key Exports | Import |
|------|----------|---------|-------------|--------|
| **Validation** | `src/utils/validation.js` | Form validation | Functions | `import { validateLoginForm } from '@/utils/validation'` |
| **Token Manager** | `src/utils/tokenManager.js` | Token lifecycle | `tokenManager` named export | `import { tokenManager } from '@/utils/tokenManager'` |

**Validation Functions:**
```javascript
import { 
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateLoginForm,
  validateRegisterForm,
  validateForgotPasswordForm,
  validateResetPasswordForm
} from '@/utils/validation';

// Individual validators return: { isValid: bool, error: string }
validateEmail('email@example.com')

// Form validators return: { isValid: bool, errors: {} }
const { isValid, errors } = validateLoginForm(formData);
```

**Token Manager:**
```javascript
import { tokenManager } from '@/utils/tokenManager';

tokenManager.setTokens(accessToken, refreshToken)
tokenManager.getAccessToken()          // Returns: string
tokenManager.getRefreshToken()         // Returns: string
tokenManager.isTokenExpired(token)     // Returns: boolean
tokenManager.shouldRefreshToken()      // Returns: boolean
tokenManager.clearTokens()             // Returns: void
tokenManager.getTokenExpirationTime(token)  // Returns: number (milliseconds)
```

---

### UI Components

| File | Location | Purpose | Props | Import |
|------|----------|---------|-------|--------|
| **Button** | `src/components/ui/Button.jsx` | Reusable button | See below | `import Button from '@/components/ui/Button'` |
| **Input** | `src/components/ui/Input.jsx` | Reusable input | See below | `import Input from '@/components/ui/Input'` |
| **Toast** | `src/components/ui/Toast.jsx` | Notifications | Context-based | `import { useToast } from '@/components/ui/Toast'` |
| **ProtectedRoute** | `src/components/ProtectedRoute.jsx` | Route protection | See below | `import ProtectedRoute from '@/components/ProtectedRoute'` |

**Button Component:**
```javascript
import Button from '@/components/ui/Button';

// Props
<Button
  variant="primary"              // 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  size="md"                      // 'sm' | 'md' | 'lg' | 'full'
  loading={false}                // Shows spinner while true
  disabled={false}               // Disable interactions
  onClick={() => {}}             // Click handler
  type="button"                  // 'button' | 'submit' | 'reset'
>
  Button Text
</Button>
```

**Input Component:**
```javascript
import Input from '@/components/ui/Input';

// Props
<Input
  label="Field Label"            // Displayed label
  type="email"                   // 'text' | 'email' | 'password' | 'number' | etc
  placeholder="Enter..."         // Placeholder text
  value={value}                  // Controlled input value
  onChange={(e) => {}}           // Change handler
  error="Error message"          // Error text below input
  hint="Help text"              // Help text below input
  required={false}               // Show required indicator
  disabled={false}               // Disable input
  autoComplete="email"           // Auto-complete attribute
  icon={<IconComponent />}       // Custom icon on right side
/>
```

**Toast Hook:**
```javascript
import { useToast } from '@/components/ui/Toast';

// In component
const { success, error, info, warning } = useToast();

// Usage
success('Success message')    // Auto-dismisses after 3s
error('Error message')        // Red toast
info('Info message')          // Blue toast
warning('Warning message')    // Yellow toast
```

**ProtectedRoute:**
```javascript
import ProtectedRoute from '@/components/ProtectedRoute';

// Wrap component - redirects to /login if not authenticated
<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>

// With role requirement
<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>

// Custom redirect
<ProtectedRoute redirectTo="/unauthorized">
  <RestrictedContent />
</ProtectedRoute>

// Higher Order Component pattern
import { withProtectedRoute } from '@/components/ProtectedRoute';
export default withProtectedRoute(YourComponent, { requiredRole: 'admin' });
```

---

### Styles

| File | Location | Purpose | Type |
|------|----------|---------|------|
| **Global Styles** | `src/styles/globals.js` | CSS reset & base | Styled Components |
| **Theme Config** | `src/app/layout.jsx` | Theme object | Theme Provider |

**Theme Object (in layout.jsx):**
```javascript
const theme = {
  colors: {
    primary: '#5b4dff',
    secondary: '#0f172a',
    accent: '#f59e0b',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    gray100: '#f9fafb',
    gray500: '#6b7280',
    gray900: '#111827'
  },
  spacing: {
    // sm: 8px, md: 12px, lg: 16px, xl: 20px, etc
  },
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px'
  }
};
```

---

## 🔌 Provider Hierarchy

### ToastProvider Location
```
File: src/components/ui/Toast.jsx
Wrap: In <RootLayout> around children
Export: ToastProvider, useToast
```

### AuthProvider Location
```
File: src/contexts/AuthContext.jsx
Wrap: In <RootLayout> around <ToastProvider>
Export: AuthProvider, useAuth
```

### ThemeProvider Location
```
From: styled-components
Wrap: In <RootLayout> around everything
Config: theme object with colors/spacing
```

---

## ✅ Import/Export Reference

### Named Exports (use {})
```javascript
export { authService } from '@/api/services/authService'
export { tokenManager } from '@/utils/tokenManager'
export { AuthProvider, useAuth } from '@/contexts/AuthContext'
export { useToast, ToastProvider } from '@/components/ui/Toast'
export { withProtectedRoute } from '@/components/ProtectedRoute'

// Various validation functions
export { validateEmail, validateLoginForm, ... } from '@/utils/validation'
```

### Default Exports (no {})
```javascript
export default from '@/api/client'
export default from '@/components/ui/Button'
export default from '@/components/ui/Input'
export default from '@/components/ProtectedRoute'
export default from '@/app/layout'
export default from '@/app/page'
```

---

## 🚀 Common Import Patterns

### Setup in Page Component
```javascript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styled from 'styled-components';

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { validateLoginForm } from '@/utils/validation';
import { authService } from '@/api/services/authService';
```

### Protected Route Setup
```javascript
'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();
  // ... rest of component
}
```

### Form Submission Pattern
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const { isValid, errors } = validateLoginForm(formData);
  if (!isValid) {
    setErrors(errors);
    error('Please fix errors');
    return;
  }
  
  try {
    const result = await authService.login(formData);
    success('Logged in!');
    router.push('/dashboard');
  } catch (err) {
    error(err.message || 'Login failed');
  }
};
```

---

## 📊 Environment Variables

### Required Variables
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Optional Variables
```bash
NEXT_PUBLIC_TOKEN_KEY=spherekings_access_token
NEXT_PUBLIC_REFRESH_TOKEN_KEY=spherekings_refresh_token
NODE_ENV=development  # Set automatically
```

### Where Used
```javascript
// src/api/config/api.config.js
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
```

---

## 🔄 API Endpoints

### Registered Endpoints (src/api/config/api.config.js)

```javascript
const endpoints = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  GET_CURRENT_USER: '/auth/me',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
};
```

---

## 📋 localStorage Keys

### Auth Tokens
```javascript
spherekings_access_token       // JWT access token
spherekings_refresh_token      // JWT refresh token
spherekings_token_expiry       // Expiration timestamp
```

### Storage Format
```javascript
// Token storage
localStorage.setItem('spherekings_access_token', tokenString);

// Retrieval
const token = localStorage.getItem('spherekings_access_token');

// Removal
localStorage.removeItem('spherekings_access_token');

// Clear all
localStorage.clear();
```

---

## 🎯 Page Routes

| Route | File | Protected | Purpose |
|-------|------|-----------|---------|
| `/` | `src/app/page.jsx` | No | Home page |
| `/register` | `src/app/(auth)/register/page.jsx` | No | Sign up |
| `/login` | `src/app/(auth)/login/page.jsx` | No | Sign in |
| `/forgot-password` | `src/app/(auth)/forgot-password/page.jsx` | No | Password recovery |
| `/reset-password/[token]` | `src/app/(auth)/reset-password/[token]/page.jsx` | No | Reset password |
| `/dashboard` | `src/app/dashboard/page.jsx` | **YES** | User dashboard |

---

## 🧪 Test URLs

```bash
# Development
http://localhost:3000/register
http://localhost:3000/login
http://localhost:3000/dashboard
http://localhost:3000/forgot-password
http://localhost:3000/reset-password/test-token

# Backend
http://localhost:5000/api/v1/auth/register
http://localhost:5000/api/v1/auth/login
http://localhost:5000/api/v1/auth/me
```

---

## 🔐 Token Flow

### 1. Initial Registration/Login
```
User fills form
  ↓
authService.register() or authService.login()
  ↓
Backend returns { accessToken, refreshToken, user }
  ↓
tokenManager.setTokens(accessToken, refreshToken)
  ↓
Stored in localStorage with keys above
```

### 2. API Request with Token
```
Component calls API endpoint
  ↓
Axios request interceptor runs
  ↓
tokenManager.getAccessToken()
  ↓
Add header: Authorization: Bearer {accessToken}
  ↓
Send request
```

### 3. Token Expiration
```
Backend returns 401 Unauthorized
  ↓
Axios response interceptor catches error
  ↓
tokenManager.getRefreshToken()
  ↓
POST /auth/refresh with refreshToken
  ↓
Backend validates, returns new accessToken
  ↓
tokenManager.setTokens(newAccessToken)
  ↓
Retry original request with new token
  ↓
Success
```

---

## 🛠️ Build & Deployment

### Build Output Locations
```
.next/                 - Optimized production code
.next/static/         - Static files
.next/server/         - Server code
```

### Build Commands
```bash
npm run dev            # Development server
npm run build          # Production build
npm run start          # Start production server
npm run lint           # Run linter (if configured)
npm run format         # Format code (if configured)
```

---

## 📞 Quick Reference Table

| Need | File | Function | Import |
|------|------|----------|--------|
| Get current user | `src/contexts/AuthContext.jsx` | `useAuth()` | Hook |
| Call API | `src/api/client.js` | client.post() | Default |
| Validate form | `src/utils/validation.js` | validateLoginForm() | Function |
| Show toast | `src/components/ui/Toast.jsx` | `useToast()` | Hook |
| Protect route | `src/components/ProtectedRoute.jsx` | `<ProtectedRoute>` | Component |
| Make button | `src/components/ui/Button.jsx` | `<Button>` | Component |
| Input field | `src/components/ui/Input.jsx` | `<Input>` | Component |
| Token manage | `src/utils/tokenManager.js` | tokenManager | Object |

---

## ✨ Quick Fixes

### "useAuth not working"
→ Check `<AuthProvider>` wraps app in `src/app/layout.jsx`

### "Toast not showing"
→ Check `<ToastProvider>` wraps app in `src/app/layout.jsx`

### "API requests fail"
→ Check `.env.local` has `NEXT_PUBLIC_API_URL` and backend is running

### "Tokens not storing"
→ Check `tokenManager.setTokens()` is called after login

### "Can't access protected route"
→ Check user is logged in (check localStorage for tokens)

### "Module not found"
→ Check import path uses `@/` alias and file exists

---

## 🎓 Learning Path

1. **Start here:** QUICK_START_COMMANDS.md
2. **Understand setup:** FRONTEND_AUTH_SETUP_GUIDE.md
3. **Learn architecture:** SPHEREKINGS_COMPLETE_INTEGRATION.md
4. **Check references:** This file
5. **Read source code:** Individual component files
6. **Test features:** Run `npm run dev` and experiment

---

**Document Version:** 1.0  
**Last Updated:** March 14, 2026  
**Status:** ✅ Complete & Accurate
