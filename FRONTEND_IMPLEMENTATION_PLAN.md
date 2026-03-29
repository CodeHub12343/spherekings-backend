# Spherekings Frontend Implementation Plan
## AI-Assisted Development with Next.js, React & Modern Tech Stack

**Date**: March 14, 2026  
**Status**: Frontend Architecture Planning  
**Approach**: Component-Driven Architecture with Design System Integration

---

## 1. DESIGN ANALYSIS

### Design Philosophy: Conversion-First Minimalism

The design concept establishes three core principles:

**1. Clarity Over Decoration**
- Instant product understanding (what, how to buy, how to promote, earnings)
- Minimalist interface focusing on conversion
- Data visualization that's immediately comprehensible
- Clear information hierarchy without cognitive overload

**2. Trust-Driven Design** (Payment/Earnings Focus)
- Professional and reliable visual treatment
- Secure payment flow perception
- Transparent earnings tracking
- Financial data clearly displayed and understandable

**3. Dashboard-Centric UX** (Affiliate-First)
- Majority of user time spent in dashboards
- Data-heavy but clean presentation
- Predictable navigation patterns
- Rapid stats comprehension

### Visual Hierarchy & Brand Identity

**Color Palette**
```
Primary: Royal Purple (#5B4DFF) - Brand identity, conversions
Secondary: Deep Navy (#0F172A) - Dashboards, headers, sidebar
Accent: Gold (#F59E0B) - Earnings highlights, premium tags
Neutral: Gray palette (50-900) - UI backgrounds, typography hierarchy
```

**Typography System (Inter Font)**
```
H1: 36px / 600 weight - Page titles
H2: 28px / 600 weight - Section headers
H3: 22px / 600 weight - Subsections
Body: 16px / 400 weight - Content text
Label: 14px / 500 weight - UI labels
Caption: 12px / 400 weight - Secondary info
```

**Spacing Grid**
- 8-point base unit (4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px)
- Ensures consistent layouts and responsive scaling
- Predictable and maintainable spacing relationships

### UX Flow Structure

**Navigation Architecture**
```
Navbar (Top)
├── Brand Logo
├── Search/Quick Actions
├── User Menu
└── Notifications

Sidebar (Left)
├── Dashboard
├── Marketplace (Browse products)
├── My Orders
├── Affiliate Center
├── Earnings & Analytics
├── Settings
└── Admin Panel (if applicable)
```

---

## 2. PAGE STRUCTURE

### Core User Journey Pages

#### Public/Marketing Pages
1. **Landing Page** - Hero, features, CTA for signup
2. **Product Marketplace** - Discovery, filtering, search
3. **Product Detail** - Images, description, reviews, affiliate info
4. **Pricing/Plans** (if tiered)

#### Authentication Pages
5. **Login** - Email/password authentication
6. **Register** - User signup with role selection (Buyer/Affiliate)
7. **Password Reset** - Forgot/reset flow

#### Buyer Pages
8. **Shopping Cart** - Review items, quantities, coupon code
9. **Checkout** - 2-step payment (Cart Review → Payment Info)
10. **Order Confirmation** - Success page with order details
11. **Order History** - View past orders with status
12. **Order Detail** - Individual order tracking

#### Affiliate Pages
13. **Affiliate Dashboard** - Stats overview (earnings, clicks, conversions)
14. **Referral Management** - Generate/manage referral links
15. **Earnings Report** - Detailed commission breakdown
16. **Analytics** - Charts: clicks vs conversions, revenue growth
17. **Referral History** - Table of recent referrals and conversions
18. **Payout Management** - Pending payouts, payout history
19. **Affiliate Settings** - Bank details, withdrawal preferences

#### User Settings Pages
20. **Profile Settings** - Name, email, avatar, personal info
21. **Account Security** - Password, 2FA, login history
22. **Privacy Settings** - Data preferences
23. **Notification Settings** - Email/push preferences

#### Admin Pages (if applicable)
24. **Admin Dashboard** - Overview of platform metrics
25. **Product Management** - CRUD operations for products
26. **Order Management** - View/manage all platform orders
27. **User Management** - View/manage users
28. **Affiliate Management** - Manage affiliate accounts and commissions
29. **Payout Management** - Process and track payouts

---

## 3. COMPONENT BREAKDOWN

### Core/Basic Components (Design System Foundation)

```javascript
// Button.jsx
<Button variant="primary|secondary|ghost|outline|danger" size="sm|md|lg" loading={false} />

// Input.jsx
<Input placeholder="" type="text|email|password" error={false} hint="" />

// Select.jsx
<Select options={[]} placeholder="" disabled={false} />

// Card.jsx
<Card variant="default|elevated" padding="sm|md|lg">Content</Card>

// Badge.jsx
<Badge variant="success|warning|error|info" size="sm|md" />

// Modal.jsx
<Modal isOpen={true} title="" onClose={() => {}}>Content</Modal>

// Tabs.jsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content</TabsContent>
</Tabs>

// Toast.jsx - For notifications
toast.success("Message")
toast.error("Error")
toast.loading("Loading...")
```

### Layout Components

```javascript
// MainLayout.jsx - Top navbar + sidebar
<MainLayout>
  <Navbar />
  <Sidebar />
  <main>{children}</main>
</MainLayout>

// PageHeader.jsx - Title, breadcrumbs, actions
<PageHeader title="" subtitle="" breadcrumbs={[]} actions={[]} />

// Container.jsx - Max-width wrapper
<Container maxWidth="lg" padding="md">{children}</Container>

// Grid.jsx - Responsive grid system
<Grid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md">

// Stack.jsx - Flexbox layout (vertical/horizontal)
<Stack direction="vertical|horizontal" spacing="md" align="start|center|end">

// DashboardLayout.jsx - Stats cards + charts + tables
<DashboardLayout>
  <StatsCardsRow />
  <ChartsSection />
  <DataTable />
</DashboardLayout>

// SidebarLayout.jsx - Sidebar + main content
<SidebarLayout sidebar={<Sidebar />}>Content</SidebarLayout>
```

### Marketplace Components

```javascript
// ProductCard.jsx
<ProductCard 
  image="" 
  title="" 
  description="" 
  price={49} 
  commission="30%" 
  onBuy={() => {}} 
  onPromote={() => {}} 
/>

// ProductGallery.jsx - Image carousel
<ProductGallery images={[]} />

// PriceBox.jsx - Price with commission display
<PriceBox 
  price={49} 
  currency="USD" 
  commission="30%" 
  affiliateEarning={14.7}
/>

// AddToCartButton.jsx - With quantity selector
<AddToCartButton productId="" onAdd={() => {}} />

// ProductFilters.jsx - Category, price range, etc.
<ProductFilters onFilterChange={() => {}} />

// SearchBar.jsx - Product search
<SearchBar placeholder="Search products..." onSearch={() => {}} />

// ShoppingCart.jsx - Cart items list
<ShoppingCart items={[]} onRemove={() => {}} onQuantityChange={() => {}} />

// CheckoutStepper.jsx - 2-step checkout progress
<CheckoutStepper currentStep={1} totalSteps={2} />

// PaymentForm.jsx - Stripe integration
<PaymentForm onSubmit={() => {}} />
```

### Affiliate Components

```javascript
// EarningsCard.jsx - Total/pending/monthly earnings
<EarningsCard 
  title="Total Earnings" 
  amount={1234.56} 
  trend="up" 
  percentChange={12}
/>

// StatsCard.jsx - Generic stat display
<StatsCard 
  icon={IconComponent} 
  label="Clicks" 
  value={1024} 
  subtitle="This month"
/>

// ReferralLinkGenerator.jsx - Generate unique links
<ReferralLinkGenerator productId="" onCopy={() => {}} />

// AffiliateLinkCard.jsx - Display and copy referral link
<AffiliateLinkCard 
  link="https://spherekings.com/?ref=abc123" 
  clicks={150} 
  conversions={12}
/>

// CommissionBadge.jsx - Display commission percentage
<CommissionBadge percentage="30%" tierName="Gold" />

// ConversionChart.jsx - Clicks vs Conversions line/bar chart
<ConversionChart data={chartData} timeRange="month" />

// RevenueGrowthChart.jsx - Revenue trend chart
<RevenueGrowthChart data={chartData} />

// ReferralTable.jsx - Recent referrals with status
<ReferralTable 
  referrals={[]} 
  onViewDetails={() => {}} 
  sortBy="" 
  filterBy=""
/>

// PayoutStatusCard.jsx - Pending/completed payouts
<PayoutStatusCard pending={500} completed={2500} nextPayoutDate="" />

// AffiliateDashboardOverview.jsx - All-in-one dashboard
<AffiliateDashboardOverview 
  earnings={} 
  clicks={} 
  conversions={} 
  approvalStatus=""
/>
```

### Admin Components

```javascript
// ProductManagerTable.jsx - CRUD operations for products
<ProductManagerTable 
  products={[]} 
  onEdit={() => {}} 
  onDelete={() => {}} 
  onAdd={() => {}}
/>

// OrderTable.jsx - All platform orders
<OrderTable 
  orders={[]} 
  filters={{}} 
  onViewDetails={() => {}}
  onUpdateStatus={() => {}}
/>

// PayoutManager.jsx - Process and manage payouts
<PayoutManager 
  pendingPayouts={[]} 
  completedPayouts={[]} 
  onProcess={() => {}}
/>

// UserManager.jsx - Manage user accounts
<UserManager users={[]} onEdit={() => {}} onDelete={() => {}} />

// AffiliateApprovalPanel.jsx - Approve/reject affiliates
<AffiliateApprovalPanel 
  pendingApprovals={[]} 
  onApprove={() => {}} 
  onReject={() => {}}
/>

// PlatformMetrics.jsx - Dashboard overview
<PlatformMetrics 
  totalRevenue={} 
  totalOrders={} 
  activeUsers={} 
  activeAffiliates={}
/>
```

---

## 4. STATE MANAGEMENT STRATEGY

### Zustand Stores Architecture

**Store 1: User/Auth Store**
```javascript
// stores/authStore.js
create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  setUser: (user) => set({ user }),
  setAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),
  logout: () => set({ user: null, isAuthenticated: false }),
  
  // Selectors
  role: (state) => state.user?.role,
  userId: (state) => state.user?.id
}))
```

**Store 2: Affiliate Store**
```javascript
// stores/affiliateStore.js
create((set) => ({
  affiliateData: {
    totalEarnings: 0,
    monthlyEarnings: 0,
    clicks: 0,
    conversions: 0,
    approvalStatus: 'pending'
  },
  referralLinks: [],
  
  setAffiliateData: (data) => set({ affiliateData: data }),
  addReferralLink: (link) => set((state) => ({
    referralLinks: [...state.referralLinks, link]
  })),
  
  conversionRate: (state) => 
    state.affiliateData.clicks > 0 
      ? (state.affiliateData.conversions / state.affiliateData.clicks * 100).toFixed(2)
      : 0
}))
```

**Store 3: Cart Store**
```javascript
// stores/cartStore.js
create((set) => ({
  items: [],
  total: 0,
  
  addItem: (product) => set((state) => ({
    items: [...state.items, product],
    total: state.total + product.price
  })),
  
  removeItem: (productId) => set((state) => {
    const item = state.items.find(i => i.id === productId);
    return {
      items: state.items.filter(i => i.id !== productId),
      total: state.total - item.price
    };
  }),
  
  updateQuantity: (productId, quantity) => set((state) => ({
    items: state.items.map(i => 
      i.id === productId ? { ...i, quantity } : i
    )
  })),
  
  clearCart: () => set({ items: [], total: 0 }),
  
  itemCount: (state) => state.items.length,
  hasItems: (state) => state.items.length > 0
}))
```

**Store 4: UI/Theme Store**
```javascript
// stores/uiStore.js
create((set) => ({
  theme: 'light',
  sidebarOpen: true,
  notifications: [],
  
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, notification]
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  }))
}))
```

**Store 5: Filters/UI State Store**
```javascript
// stores/filterStore.js
create((set) => ({
  productFilters: {
    category: null,
    priceRange: [0, 500],
    sortBy: 'recent'
  },
  
  setProductFilters: (filters) => set({ productFilters: filters }),
  resetFilters: () => set({ 
    productFilters: {
      category: null,
      priceRange: [0, 500],
      sortBy: 'recent'
    }
  })
}))
```

### Zustand Usage Patterns

```javascript
// In components - Selector pattern for single values
const userId = useAuthStore(state => state.userId);
const isAuthenticated = useAuthStore(state => state.isAuthenticated);

// Multiple values destructuring
const { user, setUser } = useAuthStore();

// Computed/derived state
const cartTotal = useCartStore(state => state.total);
const conversionRate = useAffiliateStore(state => state.conversionRate(state));
```

### React Context (Minimal Usage)

Use Context only for:
- **Payment Context** - Stripe configuration, payment state
- **Theme Context** - Global theme provider (can also use Zustand)

```javascript
// contexts/PaymentContext.js
const PaymentContext = createContext();

export function PaymentProvider({ children }) {
  const [stripeElements, setStripeElements] = useState(null);
  
  return (
    <PaymentContext.Provider value={{ stripeElements }}>
      {children}
    </PaymentContext.Provider>
  );
}

export const usePayment = () => useContext(PaymentContext);
```

---

## 5. DATA FETCHING STRATEGY

### React Query (TanStack Query) Setup

**API Service Layer with Axios**
```javascript
// api/client.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000
});

// Axios interceptor for auth tokens
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### Service Files

```javascript
// api/services/productService.js
export const productService = {
  getProducts: (filters) => 
    apiClient.get('/products', { params: filters }),
  
  getProductById: (id) => 
    apiClient.get(`/products/${id}`),
  
  getProductsByAffiliateId: (affiliateId) => 
    apiClient.get(`/affiliates/${affiliateId}/products`)
};

// api/services/affiliateService.js
export const affiliateService = {
  getAffiliateData: () => 
    apiClient.get('/affiliates/me'),
  
  getEarnings: () => 
    apiClient.get('/affiliates/me/earnings'),
  
  getReferralLinks: () => 
    apiClient.get('/affiliates/me/referral-links'),
  
  createReferralLink: (productId) => 
    apiClient.post('/affiliates/me/referral-links', { productId }),
  
  getAnalytics: (timeRange) => 
    apiClient.get('/affiliates/me/analytics', { params: { timeRange } })
};

// api/services/orderService.js
export const orderService = {
  getOrders: () => 
    apiClient.get('/orders'),
  
  getOrderById: (id) => 
    apiClient.get(`/orders/${id}`),
  
  createOrder: (orderData) => 
    apiClient.post('/orders', orderData),
  
  updateOrder: (id, data) => 
    apiClient.patch(`/orders/${id}`, data)
};

// api/services/authService.js
export const authService = {
  login: (email, password) => 
    apiClient.post('/auth/login', { email, password }),
  
  register: (userData) => 
    apiClient.post('/auth/register', userData),
  
  logout: () => 
    apiClient.post('/auth/logout'),
  
  me: () => 
    apiClient.get('/auth/me')
};
```

### React Query Hooks

```javascript
// api/hooks/useProducts.js
import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/productService';

export function useProducts(filters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id, // Only fetch if id exists
    staleTime: 10 * 60 * 1000
  });
}

// api/hooks/useAffiliate.js
export function useAffiliateData() {
  return useQuery({
    queryKey: ['affiliate', 'me'],
    queryFn: () => affiliateService.getAffiliateData(),
    staleTime: 2 * 60 * 1000
  });
}

export function useAffiliateAnalytics(timeRange = 'month') {
  return useQuery({
    queryKey: ['affiliate', 'analytics', timeRange],
    queryFn: () => affiliateService.getAnalytics(timeRange),
    staleTime: 5 * 60 * 1000
  });
}

// api/hooks/useOrder.js
export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getOrders(),
    staleTime: 2 * 60 * 1000
  });
}

export function useOrder(id) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => orderService.getOrderById(id),
    enabled: !!id
  });
}

// api/hooks/useMutations.js - Mutations
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData) => orderService.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });
}

export function useCreateReferralLink() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productId) => 
      affiliateService.createReferralLink(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['affiliate', 'referral-links'] 
      });
    }
  });
}
```

### Query Client Configuration

```javascript
// lib/queryClient.js
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // garbage collection: 10 minutes
      retry: 1,
      refetchOnWindowFocus: false
    },
    mutations: {
      retry: 1
    }
  }
});
```

### Usage in Components

```javascript
// Example component using query + mutation
function ProductPage({ productId }) {
  const { data: product, isLoading, error } = useProduct(productId);
  const { mutate: addToCart } = useMutation({
    mutationFn: (product) => cartService.addItem(product)
  });
  
  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <ProductDetail 
      product={product}
      onAddToCart={() => addToCart(product)}
    />
  );
}
```

---

## 6. ANIMATION STRATEGY

### Framer Motion Setup & Patterns

**Page Transitions**
```javascript
// animations/pageTransitions.js
export const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.15 }
  }
};

// In layout
<motion.div 
  variants={pageVariants}
  initial="hidden"
  animate="visible"
  exit="exit"
>
  {children}
</motion.div>
```

**Component Entrance Animations**
```javascript
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
};

// Usage
<motion.div 
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  {items.map((item, i) => (
    <motion.div key={i} variants={itemVariants}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

**Hover & Interaction Animations**
```javascript
// Product card hover effect
<motion.div
  whileHover={{ scale: 1.03, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: 'spring', stiffness: 300 }}
>
  <ProductCard />
</motion.div>

// Button interactions
<motion.button
  whileHover={{ backgroundColor: '#4C3FFF' }}
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
  Click Me
</motion.button>

// Link underline animation
<motion.a
  whileHover={{ x: 5 }}
  transition={{ duration: 0.2 }}
>
  Learn More
</motion.a>
```

**Loading Skeletons** (Instead of spinners)
```javascript
// components/SkeletonLoader.jsx
export function ProductCardSkeleton() {
  return (
    <motion.div
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="skeleton"
    >
      <SkeletonPlaceholder height={200} />
      <SkeletonPlaceholder height={20} width="80%" />
      <SkeletonPlaceholder height={16} width="60%" />
    </motion.div>
  );
}
```

**Toast Notifications Animation**
```javascript
export const toastVariants = {
  hidden: { opacity: 0, x: 100, y: 0 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: { duration: 0.2 }
  }
};

// Toast component
<AnimatePresence>
  {toasts.map((toast) => (
    <motion.div
      key={toast.id}
      variants={toastVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {toast.message}
    </motion.div>
  ))}
</AnimatePresence>
```

**Micro-interactions Examples**
```javascript
// Add to cart button morphs to check
<motion.button
  onClick={() => setAdded(true)}
  animate={added ? 'added' : 'default'}
  variants={{
    default: { width: 'auto' },
    added: { width: 40, borderRadius: '50%' }
  }}
>
  {added ? <CheckIcon /> : 'Add to Cart'}
</motion.button>

// Copy affiliate link with feedback
<motion.button
  onClick={() => {
    copyToClipboard(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }}
  animate={copied ? 'copied' : 'default'}
  variants={{
    copied: { scale: 1.1 }
  }}
>
  {copied ? '✓ Copied!' : 'Copy Link'}
</motion.button>

// Commission earned coin sparkle
<motion.div
  animate={{ opacity: [1, 0], y: [0, -50] }}
  transition={{ duration: 1 }}
  onAnimationComplete={() => setShowSparkle(false)}
>
  <CoinIcon /> +$14.70
</motion.div>
```

---

## 7. RECOMMENDED PROJECT STRUCTURE

```
spherekings-frontend/
├── public/
│   ├── images/
│   ├── icons/
│   └── ...
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.jsx                # Root layout
│   │   ├── page.jsx                  # Home page
│   │   ├── (auth)/
│   │   │   ├── login/page.jsx
│   │   │   ├── register/page.jsx
│   │   │   ├── forgot-password/page.jsx
│   │   │   └── layout.jsx
│   │   ├── (marketplace)/
│   │   │   ├── products/page.jsx
│   │   │   ├── products/[id]/page.jsx
│   │   │   ├── search/page.jsx
│   │   │   └── layout.jsx
│   │   ├── (user)/
│   │   │   ├── dashboard/page.jsx
│   │   │   ├── orders/page.jsx
│   │   │   ├── orders/[id]/page.jsx
│   │   │   ├── cart/page.jsx
│   │   │   ├── checkout/page.jsx
│   │   │   ├── settings/page.jsx
│   │   │   ├── settings/profile/page.jsx
│   │   │   ├── settings/security/page.jsx
│   │   │   └── layout.jsx
│   │   ├── (affiliate)/
│   │   │   ├── dashboard/page.jsx
│   │   │   ├── earnings/page.jsx
│   │   │   ├── analytics/page.jsx
│   │   │   ├── referrals/page.jsx
│   │   │   ├── payouts/page.jsx
│   │   │   ├── settings/page.jsx
│   │   │   └── layout.jsx
│   │   ├── (admin)/
│   │   │   ├── dashboard/page.jsx
│   │   │   ├── products/page.jsx
│   │   │   ├── orders/page.jsx
│   │   │   ├── users/page.jsx
│   │   │   ├── affiliates/page.jsx
│   │   │   ├── payouts/page.jsx
│   │   │   └── layout.jsx
│   │
│   ├── components/
│   │   ├── common/                   # Shared across app
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Breadcrumb.jsx
│   │   │   └── Loader.jsx
│   │   ├── ui/                       # Design system components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Tabs.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── Dropdown.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── MainLayout.jsx
│   │   │   ├── AuthLayout.jsx
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── Container.jsx
│   │   │   ├── Grid.jsx
│   │   │   ├── Stack.jsx
│   │   │   └── ...
│   │   ├── marketplace/
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProductGallery.jsx
│   │   │   ├── ProductFilters.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── PriceBox.jsx
│   │   │   └── ...
│   │   ├── cart/
│   │   │   ├── CartSummary.jsx
│   │   │   ├── CartItem.jsx
│   │   │   └── CartCoupon.jsx
│   │   ├── checkout/
│   │   │   ├── CheckoutStepper.jsx
│   │   │   ├── CartReview.jsx
│   │   │   ├── PaymentForm.jsx
│   │   │   └── OrderConfirmation.jsx
│   │   ├── affiliate/
│   │   │   ├── EarningsCard.jsx
│   │   │   ├── StatsCard.jsx
│   │   │   ├── ReferralLinkGenerator.jsx
│   │   │   ├── ConversionChart.jsx
│   │   │   ├── ReferralTable.jsx
│   │   │   ├── PayoutStatus.jsx
│   │   │   └── ...
│   │   ├── admin/
│   │   │   ├── ProductTable.jsx
│   │   │   ├── OrderTable.jsx
│   │   │   ├── UserTable.jsx
│   │   │   ├── PayoutManager.jsx
│   │   │   └── ...
│   │   └── ...
│   │
│   ├── api/
│   │   ├── client.js                 # Axios client
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── productService.js
│   │   │   ├── orderService.js
│   │   │   ├── cartService.js
│   │   │   ├── affiliateService.js
│   │   │   ├── userService.js
│   │   │   └── ...
│   │   └── hooks/
│   │       ├── useProducts.js
│   │       ├── useProduct.js
│   │       ├── useOrders.js
│   │       ├── useAffiliateData.js
│   │       ├── useMutations.js
│   │       └── ...
│   │
│   ├── stores/                       # Zustand stores
│   │   ├── authStore.js
│   │   ├── cartStore.js
│   │   ├── affiliateStore.js
│   │   ├── uiStore.js
│   │   ├── filterStore.js
│   │   └── ...
│   │
│   ├── contexts/                     # React Context (minimal)
│   │   ├── PaymentContext.jsx
│   │   └── ...
│   │
│   ├── styles/
│   │   ├── theme.js                  # Global theme config
│   │   ├── globals.css               # Global styles
│   │   ├── tokens.js                 # Design system tokens
│   │   └── ...
│   │
│   ├── animations/
│   │   ├── pageTransitions.js
│   │   ├── componentAnimations.js
│   │   ├── microInteractions.js
│   │   └── ...
│   │
│   ├── hooks/                        # Custom hooks
│   │   ├── useAuth.js
│   │   ├── useMediaQuery.js
│   │   ├── useDebounce.js
│   │   ├── usePrevious.js
│   │   └── ...
│   │
│   ├── utils/
│   │   ├── constants.js
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   ├── localStorage.js
│   │   ├── errorHandler.js
│   │   └── ...
│   │
│   ├── config/
│   │   ├── api.config.js
│   │   ├── stripe.config.js
│   │   └── ...
│   │
│   └── middleware.js                 # Next.js middleware
│
├── .env.local                        # Local environment variables
├── .env.example                      # Example env file
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.js                # If using Tailwind (optional)
├── jsconfig.json                     # Path aliases
├── README.md
└── ...
```

**Path Aliases in jsconfig.json**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@api/*": ["./src/api/*"],
      "@stores/*": ["./src/stores/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@utils/*": ["./src/utils/*"],
      "@styles/*": ["./src/styles/*"],
      "@animations/*": ["./src/animations/*"],
      "@config/*": ["./src/config/*"]
    }
  }
}
```

---

## 8. IMPLEMENTATION CHECKLIST

### Phase 1: Foundation (Week 1-2)
- [ ] Setup Next.js project with App Router
- [ ] Configure Zustand stores
- [ ] Setup React Query with query client
- [ ] Configure Axios client with interceptors
- [ ] Setup styled-components with theme system
- [ ] Create design system tokens
- [ ] Build basic UI components (Button, Input, Card, etc.)
- [ ] Setup authentication flow (Login/Register pages)
- [ ] Configure environment variables

### Phase 2: Core Pages (Week 2-3)
- [ ] Create marketplace product listing page
- [ ] Create product detail page
- [ ] Create shopping cart functionality
- [ ] Create 2-step checkout flow
- [ ] Create order confirmation page
- [ ] Integrate Stripe payment processing
- [ ] Create user dashboard

### Phase 3: Affiliate System (Week 3-4)
- [ ] Create affiliate dashboard
- [ ] Build referral link generator
- [ ] Create earnings analytics dashboard
- [ ] Build conversion tracking charts
- [ ] Create payout management system
- [ ] Build affiliate settings

### Phase 4: Admin & Polish (Week 4-5)
- [ ] Create admin dashboard
- [ ] Build product management
- [ ] Build order management
- [ ] Build user management
- [ ] Build payout processing
- [ ] Add animations and transitions
- [ ] Optimize performance
- [ ] Setup error boundaries

### Phase 5: Testing & Deployment (Week 5)
- [ ] Unit tests for components
- [ ] Integration tests for flows
- [ ] E2E tests with Cypress/Playwright
- [ ] Performance testing
- [ ] Security audit
- [ ] Deploy to production

---

## 9. KEY INTEGRATION POINTS

### Backend API Integration
- Base URL: `process.env.NEXT_PUBLIC_API_URL`
- Authentication: JWT tokens in Authorization header
- Error handling: Consistent error response format
- Rate limiting: Handle 429 responses
- Pagination: Implement offset/limit pattern
- Filters: Pass filter objects as query params

### Stripe Integration
- Publishable key: `process.env.NEXT_PUBLIC_STRIPE_KEY`
- Elements setup in PaymentContext
- Card tokenization before order creation
- Webhook handling for payment events
- PCI compliance: Never handle raw card data

### File Uploads
- Product images: Hosted storage (AWS S3 or similar)
- Avatar uploads: User profile images
- File validation: Type and size checks
- Progress tracking: Show upload progress

---

## 10. PERFORMANCE OPTIMIZATION STRATEGY

- **Code Splitting**: Lazy load pages with dynamic imports
- **Image Optimization**: Use Next.js Image component
- **Bundle Analysis**: Monitor bundle size
- **Memoization**: useCallback/useMemo for expensive operations
- **Debouncing**: Search inputs, filter changes
- **Virtual Scrolling**: Long lists in tables
- **Caching**: React Query stale time configuration
- **CDN**: Serve static assets from CDN

---

## 11. SECURITY CONSIDERATIONS

- **Authentication**: Secure token storage and refresh
- **HTTPS Only**: Enforce in production
- **CORS**: Proper CORS headers configuration
- **XSS Prevention**: React's default escaping
- **CSRF Protection**: Include tokens in requests
- **Sensitive Data**: Never expose in localStorage without hashing
- **API Key**: Never commit API keys or secrets
- **Input Validation**: Validate all user inputs

---

## 12. ACCESSIBILITY (A11Y)

- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Tab order and focus management
- **Color Contrast**: WCAG AA compliance
- **Alt Text**: Images must have alt descriptions
- **Form Labels**: All inputs must have associated labels
- **Loading States**: Announce to screen readers

---

## NEXT STEPS

1. **Setup Next.js Environment**
   ```bash
   npx create-next-app@latest spherekings-frontend --typescript=false
   cd spherekings-frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install zustand @tanstack/react-query axios react-hook-form framer-motion lucide-react styled-components
   npm install -D @tanstack/react-query-devtools
   ```

3. **Configure Environment Variables**
   - Create `.env.local` with API URLs and keys

4. **Begin Phase 1 Implementation**
   - Start with design system and UI components
   - Setup stores and API layer
   - Build authentication flow

---

**Status**: Implementation Plan Complete ✅  
**Ready for**: Frontend Development Setup & Component Creation

