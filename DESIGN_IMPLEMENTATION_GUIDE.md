# Spherekings Frontend Design Implementation Guide
**Status:** Complete | Last Updated: March 14, 2026

---

## Table of Contents
1. [Design System Analysis](#design-system-analysis)
2. [Component Architecture](#component-architecture)
3. [State Management Strategy](#state-management-strategy)
4. [Page Structure](#page-structure)
5. [Styling Implementation](#styling-implementation)
6. [Animation Strategy](#animation-strategy)
7. [Project Structure](#project-structure)

---

## Design System Analysis

### Design Philosophy Implementation

**Principle 1: Clarity Over Decoration**
- Use **Lucide Icons** for immediate visual understanding
- Cards with clear CTAs (buttons with contrasting colors)
- Data displayed with hierarchy (headers, subheaders, values)
- No shadows or decorative elements; focus on content

**Principle 2: Trust-Driven Design**
- **Royal Purple + Deep Navy** accent scheme creates premium feel
- Clean, minimalist layout conveys professionalism
- Clear security indicators (SSL badges, secure tags)
- Transparent commission/payout calculations

**Principle 3: Dashboard-Centric UX**
- Card-based layout for affiliate dashboards
- Charts using **Framer Motion** for smooth data visualization
- Tab-based navigation for complex data
- Predictable left-sidebar navigation across all dashboards

**Principle 4: Frictionless Conversion**
- Fast product discovery: grid + search + filters
- Two-step checkout (cart → payment)
- Minimal distractions on product pages
- Clear value prop for affiliate users

### Color Palette Implementation

```javascript
// Global Styled Components Theme
const theme = {
  colors: {
    // Primary Brand
    primary: '#5B4DFF',      // Royal Purple (CTA buttons, links, primary accent)
    primaryHover: '#4A3FD0', // Darker for hover states
    primaryLight: '#E8E4FF', // Light background for secondary info
    
    // Secondary
    secondary: '#0F172A',    // Deep Navy (headers, sidebar, dark elements)
    
    // Accent
    accent: '#F59E0B',       // Gold (affiliate earnings, premium tags)
    
    // Neutral
    white: '#FFFFFF',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray400: '#9CA3AF',
    gray700: '#374151',
    gray900: '#111827',
    
    // Semantic
    success: '#10B981',      // Green (successful actions)
    warning: '#F59E0B',      // Gold (warnings)
    danger: '#EF4444',       // Red (errors, destructive actions)
    info: '#3B82F6',         // Blue (informational)
    
    // Component-specific
    bgPrimary: '#F9FAFB',    // Page background
    bgCard: '#FFFFFF',       // Card background
    borderColor: '#E5E7EB',  // Border color
    textPrimary: '#111827',  // Body text
    textSecondary: '#6B7280' // Subtitle/helper text
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  typography: {
    fontFamily: {
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    },
    fontSize: {
      h1: '36px',
      h2: '28px',
      h3: '22px',
      body: '16px',
      caption: '14px',
      small: '12px'
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)'
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px'
  },
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px'
  }
};
```

---

## Component Architecture

### Core UI Components

#### 1. Button Component
**Design Requirements:**
- Multiple variants (primary, secondary, outline, ghost)
- Multiple sizes (sm, md, lg)
- Loading, disabled, hover states
- With icons + text or icon-only

**Implementation:**
```javascript
// components/ui/Button.jsx
import styled from 'styled-components';
import { Loader } from 'lucide-react';

const StyledButton = styled.button`
  padding: ${props => {
    const sizes = { sm: '8px 12px', md: '12px 16px', lg: '16px 24px' };
    return sizes[props.size || 'md'];
  }};
  
  background-color: ${props => {
    const variants = {
      primary: props.theme.colors.primary,
      secondary: props.theme.colors.secondary,
      outline: 'transparent',
      ghost: 'transparent'
    };
    return variants[props.variant || 'primary'];
  }};
  
  color: ${props => props.variant === 'outline' ? props.theme.colors.primary : 'white'};
  border: ${props => props.variant === 'outline' ? `2px solid ${props.theme.colors.primary}` : 'none'};
  
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.fontSize.body};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  cursor: ${props => props.disabled || props.isLoading ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled || props.isLoading ? 0.6 : 1};
  
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  
  &:hover:not(:disabled) {
    opacity: 0.9;
    box-shadow: ${props => props.theme.shadows.md};
  }
  
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  ...props
}) => (
  <StyledButton
    variant={variant}
    size={size}
    disabled={disabled || isLoading}
    {...props}
  >
    {isLoading && <Loader size={16} />}
    {Icon && <Icon size={16} />}
    {children}
  </StyledButton>
);
```

**Usage Locations:**
- All CTAs (Add to Cart, Buy Now, Promote)
- Form submissions
- Navigation links
- Commission/Payout requests

#### 2. Card Component
**Design Requirements:**
- Flexible content area
- Meta information (small text, badges)
- Icon header (optional)
- Click animation (slight lift on hover)

**Implementation:**
```javascript
// components/ui/Card.jsx
import styled from 'styled-components';
import { motion } from 'framer-motion';

const StyledCard = styled(motion.div)`
  background: ${props => props.theme.colors.bgCard};
  border: 1px solid ${props => props.theme.colors.borderColor};
  border-radius: ${props => props.theme.radius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  
  transition: all 0.2s ease;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  
  &:hover {
    ${props => props.clickable && `
      box-shadow: ${props.theme.shadows.md};
      transform: translateY(-2px);
    `}
  }
`;

export const Card = ({ children, clickable = false, ...props }) => (
  <StyledCard
    whileHover={clickable ? { y: -4 } : undefined}
    clickable={clickable}
    {...props}
  >
    {children}
  </StyledCard>
);
```

**Usage Locations:**
- Product cards (marketplace)
- Stats cards (dashboards)
- Referral cards (affiliate area)
- Order history cards (orders page)

#### 3. Input Component
**Design Requirements:**
- Text, email, password, number types
- Clear label and error states
- Icon support (search icon for search box)
- Floating label animation (optional)

**Implementation:**
```javascript
// components/ui/Input.jsx
import styled from 'styled-components';

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const Label = styled.label`
  font-size: ${props => props.theme.typography.fontSize.caption};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.textPrimary};
`;

const StyledInput = styled.input`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.error ? props.theme.colors.danger : props.theme.colors.borderColor};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.fontSize.body};
  font-family: ${props => props.theme.typography.fontFamily.primary};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight};
  }
`;

const ErrorText = styled.span`
  font-size: ${props => props.theme.typography.fontSize.small};
  color: ${props => props.theme.colors.danger};
`;

export const Input = ({ label, error, ...props }) => (
  <InputWrapper>
    {label && <Label>{label}</Label>}
    <StyledInput error={error} {...props} />
    {error && <ErrorText>{error}</ErrorText>}
  </InputWrapper>
);
```

**Usage Locations:**
- Login/Register forms
- Product search
- Filter inputs
- Profile update forms
- Checkout forms

#### 4. Modal Component
**Design Requirements:**
- Overlay backdrop
- Centered content
- Close button (X icon)
- Animation entrance/exit
- Prevents background scroll

**Implementation:**
```javascript
// components/ui/Modal.jsx
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Content = styled(motion.div)`
  background: ${props => props.theme.colors.bgCard};
  border-radius: ${props => props.theme.radius.xl};
  padding: ${props => props.theme.spacing.xl};
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${props => props.theme.spacing.lg};
  right: ${props => props.theme.spacing.lg};
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.theme.colors.textSecondary};
  
  &:hover {
    color: ${props => props.theme.colors.textPrimary};
  }
`;

export const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <Backdrop
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <Content
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
          {title && <h2>{title}</h2>}
          {children}
        </Content>
      </Backdrop>
    )}
  </AnimatePresence>
);
```

**Usage Locations:**
- Affiliate link generator (copy modal)
- Product image gallery (lightbox)
- Confirm dialogs
- Terms and conditions

#### 5. Toast/Notification Component
**Design Requirements:**
- Bottom-right position
- Auto-dismiss after 3-5 seconds
- Success, error, warning, info types
- Smooth entrance/exit animation

**Implementation:**
```javascript
// components/ui/Toast.jsx
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, Info } from 'lucide-react';

const ToastContainer = styled.div`
  position: fixed;
  bottom: ${props => props.theme.spacing.lg};
  right: ${props => props.theme.spacing.lg};
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const ToastItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.radius.md};
  background: ${props => {
    const colors = {
      success: props.theme.colors.success,
      error: props.theme.colors.danger,
      warning: props.theme.colors.warning,
      info: props.theme.colors.info
    };
    return colors[props.type];
  }};
  color: white;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  box-shadow: ${props => props.theme.shadows.lg};
`;

const ToastIcon = {
  success: Check,
  error: AlertCircle,
  warning: AlertCircle,
  info: Info
};

export const useToast = () => {
  const [toasts, setToasts] = React.useState([]);
  
  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  };
  
  return { toasts, showToast };
};

export const Toast = ({ toasts }) => {
  return (
    <ToastContainer>
      <AnimatePresence>
        {toasts.map(toast => {
          const Icon = ToastIcon[toast.type];
          return (
            <ToastItem
              key={toast.id}
              type={toast.type}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
            >
              <Icon size={20} />
              {toast.message}
            </ToastItem>
          );
        })}
      </AnimatePresence>
    </ToastContainer>
  );
};
```

**Usage Locations:**
- After successful actions (add to cart, login, updated profile)
- Error notifications (failed checkout, validation errors)
- Informational messages (affiliate link copied)

#### 6. Badge Component
**Design Requirements:**
- Compact indicator
- Multiple variants (primary, success, warning, danger)
- Used for status tags and labels
- Round or rounded-square shape

**Implementation:**
```javascript
// components/ui/Badge.jsx
import styled from 'styled-components';

const StyledBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => {
    const sizes = { sm: '4px 8px', md: '6px 12px', lg: '8px 16px' };
    return sizes[props.size || 'md'];
  }};
  
  background-color: ${props => {
    const colors = {
      primary: props.theme.colors.primaryLight,
      success: '#D1FAE5',
      warning: '#FEF3C7',
      danger: '#FEE2E2',
      affiliate: '#FEF3C7'
    };
    return colors[props.variant || 'primary'];
  }};
  
  color: ${props => {
    const colors = {
      primary: props.theme.colors.primary,
      success: '#059669',
      warning: '#D97706',
      danger: '#DC2626',
      affiliate: '#D97706'
    };
    return colors[props.variant || 'primary'];
  }};
  
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.fontSize.small};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  white-space: nowrap;
`;

export const Badge = ({ children, variant, size, ...props }) => (
  <StyledBadge variant={variant} size={size} {...props}>
    {children}
  </StyledBadge>
);
```

**Usage Locations:**
- Product status badges ("Active", "Featured")
- Order status tags ("Shipped", "Delivered")
- Commission status tags ("Pending", "Approved", "Paid")
- Affiliate badges ("10% Commission", "Top Earner")

#### 7. Loading Skeleton
**Design Requirements:**
- Placeholder while data loads
- Smooth pulsing animation
- Match content dimensions
- Improve perceived performance

**Implementation:**
```javascript
// components/ui/Skeleton.jsx
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const StyledSkeleton = styled.div`
  background: linear-gradient(
    to right,
    ${props => props.theme.colors.gray200} 0%,
    ${props => props.theme.colors.gray100} 20%,
    ${props => props.theme.colors.gray200} 40%
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite;
  
  border-radius: ${props => props.theme.radius.md};
  height: ${props => props.height || '20px'};
  width: ${props => props.width || '100%'};
`;

// Usage in components while loading
export const Skeleton = ({ height, width }) => (
  <StyledSkeleton height={height} width={width} />
);
```

**Usage Locations:**
- Product grid while fetching
- Dashboard stats while loading
- Order list while fetching
- Any data table before content loads

#### 8. Table Component
**Design Requirements:**
- Clean, sortable headers
- Row hover highlight
- Pagination controls
- Responsive on mobile (card view)

**Implementation:**
```javascript
// components/ui/Table.jsx
import styled from 'styled-components';

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  thead {
    background-color: ${props => props.theme.colors.gray50};
    border-bottom: 2px solid ${props => props.theme.colors.borderColor};
  }
  
  th {
    padding: ${props => props.theme.spacing.md};
    text-align: left;
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    color: ${props => props.theme.colors.textPrimary};
    font-size: ${props => props.theme.typography.fontSize.small};
    text-transform: uppercase;
  }
  
  td {
    padding: ${props => props.theme.spacing.md};
    border-bottom: 1px solid ${props => props.theme.colors.borderColor};
    color: ${props => props.theme.colors.textSecondary};
  }
  
  tbody tr:hover {
    background-color: ${props => props.theme.colors.gray50};
  }
`;

export const Table = ({ columns, data, onSort }) => (
  <StyledTable>
    <thead>
      <tr>
        {columns.map(col => (
          <th
            key={col.key}
            onClick={() => onSort && onSort(col.key)}
            style={{ cursor: col.sortable ? 'pointer' : 'default' }}
          >
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {data.map((row, idx) => (
        <tr key={idx}>
          {columns.map(col => (
            <td key={col.key}>{row[col.key]}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </StyledTable>
);
```

**Usage Locations:**
- Order history tables
- Commission lists
- Payout history
- Referral click logs
- Admin user/product lists

### Specialized Components

#### Market Components

**1. ProductCard Component**
```javascript
// components/marketplace/ProductCard.jsx
export const ProductCard = ({ product, onAddToCart, onPromote }) => (
  <Card clickable>
    <ProductImage src={product.images[0]} alt={product.name} />
    <ProductName>{product.name}</ProductName>
    <ProductDescription>{product.description.slice(0, 80)}...</ProductDescription>
    
    <PriceSection>
      <Price>${product.price}</Price>
      <CommissionBadge>
        Earn {product.commission || 10}% commission
      </CommissionBadge>
    </PriceSection>
    
    <ButtonContainer>
      <Button variant="primary" onClick={onAddToCart}>
        Buy Now
      </Button>
      <Button variant="outline" onClick={onPromote}>
        <Share2 size={16} />
        Promote
      </Button>
    </ButtonContainer>
  </Card>
);
```

**2. AffiliateLinkGenerator Component**
```javascript
// components/affiliate/LinkGenerator.jsx
export const LinkGenerator = ({ affiliateCode }) => {
  const link = `https://spherekings.com/ref/${affiliateCode}`;
  
  return (
    <Card>
      <Title>Your Referral Link</Title>
      <LinkDisplay readOnly value={link} />
      <CopyButton onClick={() => copyToClipboard(link)}>
        <Copy size={16} />
        Copy Link
      </CopyButton>
    </Card>
  );
};
```

**3. EarningsChart Component**
```javascript
// components/affiliate/EarningsChart.jsx
import { LineChart, Line, XAxis, YAxis } from 'recharts';
import { motion } from 'framer-motion';

export const EarningsChart = ({ data, period = 'month' }) => (
  <Card>
    <ChartTitle>Earnings - {period}</ChartTitle>
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Line
          type="monotone"
          dataKey="earnings"
          stroke={theme.colors.primary}
          strokeWidth={2}
          dot={{ fill: theme.colors.primary }}
        />
      </LineChart>
    </motion.div>
  </Card>
);
```

---

## State Management Strategy

### Global State with Zustand

```javascript
// stores/useAuthStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,
      
      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setTokens: (token, refreshToken) => set({ token, refreshToken }),
      setLoading: (isLoading) => set({ isLoading }),
      
      logout: () => set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false
      }),
      
      // Async actions
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { email, password });
          set({
            user: response.data.data.user,
            token: response.data.data.accessToken,
            refreshToken: response.data.data.refreshToken,
            isAuthenticated: true,
            isLoading: false
          });
          return response.data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      }
    }),
    { name: 'auth-store' }
  )
);

// stores/useCartStore.js
export const useCartStore = create((set) => ({
  items: [],
  lastUpdated: null,
  
  addItem: (product, quantity = 1, variant = null) => set(state => {
    const existingItem = state.items.find(
      i => i.productId === product._id &&
      JSON.stringify(i.variant) === JSON.stringify(variant)
    );
    
    if (existingItem) {
      return {
        items: state.items.map(i =>
          i === existingItem
            ? { ...i, quantity: i.quantity + quantity }
            : i
        ),
        lastUpdated: new Date()
      };
    }
    
    return {
      items: [...state.items, {
        productId: product._id,
        productName: product.name,
        price: product.price,
        quantity,
        variant,
        image: product.images[0]
      }],
      lastUpdated: new Date()
    };
  }),
  
  removeItem: (productId, variant = null) => set(state => ({
    items: state.items.filter(
      i => !(i.productId === productId &&
        JSON.stringify(i.variant) === JSON.stringify(variant))
    )
  })),
  
  updateQuantity: (productId, quantity, variant = null) => set(state => ({
    items: state.items.map(i =>
      (i.productId === productId &&
        JSON.stringify(i.variant) === JSON.stringify(variant))
        ? { ...i, quantity: Math.max(0, quantity) }
        : i
    ).filter(i => i.quantity > 0)
  })),
  
  getTotalItems: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.quantity, 0);
  },
  
  getSubtotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },
  
  clearCart: () => set({ items: [], lastUpdated: new Date() })
}));

// stores/useAffiliateStore.js
export const useAffiliateStore = create((set) => ({
  affiliateData: null,
  stats: null,
  isLoading: false,
  
  setAffiliateData: (data) => set({ affiliateData: data }),
  setStats: (stats) => set({ stats }),
  setLoading: (isLoading) => set({ isLoading }),
  
  fetchAffiliateData: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/affiliate/dashboard');
      set({ affiliateData: response.data.data.affiliate, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  }
}));
```

### Server State with React Query

```javascript
// hooks/useProducts.js
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

export const useProducts = (page = 1, filters = {}) => {
  return useQuery({
    queryKey: ['products', page, filters],
    queryFn: async () => {
      const response = await api.get('/products', {
        params: { page, limit: 20, ...filters }
      });
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000  // 10 minutes
  });
};

// hooks/useOrders.js
export const useOrders = (page = 1) => {
  return useQuery({
    queryKey: ['orders', page],
    queryFn: async () => {
      const response = await api.get('/orders', {
        params: { page, limit: 10 }
      });
      return response.data.data;
    }
  });
};

// Mutations
import { useMutation } from '@tanstack/react-query';

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, quantity, variant }) => {
      const response = await api.post('/cart/add', {
        productId,
        quantity,
        variant
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['cart']);
    }
  });
};

export const useCheckout = () => {
  const { showToast } = useToast();
  
  return useMutation({
    mutationFn: async (checkoutData) => {
      const response = await api.post('/checkout/create-session', checkoutData);
      return response.data.data;
    },
    onSuccess: (data) => {
      // Redirect to Stripe
      window.location.href = data.url;
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Checkout failed', 'error');
    }
  });
};
```

---

## Page Structure

### Layout Hierarchy

```
App
├── Provider (Auth, React Query)
│   ├── ProtectedRoute
│   │   └── DashboardLayout
│   │       ├── Sidebar
│   │       ├── Header
│   │       └── MainContent
│   └── PublicLayout
│       ├── Navbar
│       ├── MainContent
│       └── Footer
```

### Public Pages

**1. Homepage** (`/`)
- Hero section with CTA
- Featured products grid
- Affiliate benefits section
- Trust indicators
- Footer

**2. Products** (`/products`)
- Search bar with autocomplete
- Filter sidebar (category, price, status)
- Product grid (6-12 per page)
- Pagination
- View toggle (grid/list)

**3. Product Details** (`/products/:id`)
- Image gallery with zoom
- Product info card
- Price & commission badge
- Variants selector
- Add to cart button
- Related products section
- Reviews section

**4. Cart** (`/cart`)
- Item list with remove/update
- Subtotal calculation
- Proceed to checkout button
- Continue shopping link

**5. Checkout** (`/checkout`)
- Step 1: Cart review + shipping
- Step 2: Payment (Stripe)
- Order confirmation

**6. Leaderboard** (`/leaderboard`)
- Top 10/50/100 affiliates by earnings
- Stats columns (earnings, clicks, conversions)
- Filter by period (week/month/quarter/year)

### Protected Pages (Authenticated Users)

**1. Orders Dashboard** (`/dashboard/orders`)
- Order list with status
- Sort/filter options
- Order detail modal
- Invoice download

**2. Order Details** (`/dashboard/orders/:id`)
- Full order information
- Item breakdown
- Shipping info
- Refund request button

**3. Profile Settings** (`/dashboard/settings/profile`)
- Edit personal info
- Upload avatar
- Change address
- Edit bio

**4. Account Settings** (`/dashboard/settings/account`)
- Change password
- Notification preferences
- Two-factor authentication
- Session management

### Affiliate Pages (Affiliate Users)

**1. Affiliate Dashboard** (`/affiliate/dashboard`)
- Welcome card
- Quick stats (clicks, conversions, earnings)
- Earnings chart (7-30 day view)
- Recent referrals table
- Recent sales table

**2. Affiliate Link Generator** (`/affiliate/share`)
- Display affiliate link
- Copy button with toast feedback
- QR code generator
- Social share buttons
- UTM parameter builder

**3. Affiliates / Commissions** (`/affiliate/commissions`)
- Commission list table
- Status filter
- Date range filter
- Bulk approval (admin)
- Detail modal for each commission

**4. Affiliate Payouts** (`/affiliate/payouts`)
- Current balance display
- Pending commissions
- Request payout form
- Payout history table
- Minimum threshold indicator

**5. Referral Analytics** (`/affiliate/analytics`)
- Clicks by source chart
- Clicks by device chart
- Clicks by country map
- Conversion funnel
- Earnings trend line chart

**6. Affiliate Settings** (`/affiliate/settings`)
- Payout method selector
- Bank account info
- Minimum threshold setting
- Copy affiliate link
- Download data

### Admin Pages

**1. Admin Dashboard** (`/admin/dashboard`)
- Revenue metrics
- Orders metric
- Affiliates metric
- Recent orders list
- Recent payouts list
- Affiliate stats

**2. Products Management** (`/admin/products`)
- Product table with inline edit
- Create product button
- Delete/archive functionality
- Import CSV option
- Stock management

**3. Orders Management** (`/admin/orders`)
- Complete order list
- Status update dropdown
- Payment status indicators
- Refund management
- Export to CSV

**4. Affiliates Management** (`/admin/affiliates`)
- Affiliate table
- Approve/reject pending affiliates
- Suspend/unsuspend accounts
- Commission rate override
- Communication history

**5. Commissions Management** (`/admin/commissions`)
- All commissions list
- Approve pending commissions
- Mark as paid
- Reverse commissions with reason
- Commission analytics

**6. Payouts Management** (`/admin/payouts`)
- Pending payout queue
- Approve payouts
- Process payouts (batch)
- View payout history
- Refund failed payouts

---

## Styling Implementation

### Global Styles
```javascript
// styles/GlobalStyle.js
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  html {
    font-size: 16px;
  }
  
  body {
    font-family: ${props => props.theme.typography.fontFamily.primary};
    background-color: ${props => props.theme.colors.bgPrimary};
    color: ${props => props.theme.colors.textPrimary};
    line-height: 1.5;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    line-height: 1.3;
  }
  
  h1 { font-size: ${props => props.theme.typography.fontSize.h1}; }
  h2 { font-size: ${props => props.theme.typography.fontSize.h2}; }
  h3 { font-size: ${props => props.theme.typography.fontSize.h3}; }
  
  button {
    font-family: inherit;
    font-size: inherit;
  }
  
  scrollbar-width: thin;
  scrollbar-color: ${props => props.theme.colors.borderColor} transparent;
  
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  
  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.borderColor};
    border-radius: 4px;
  }
`;

export default GlobalStyle;
```

### Responsive Design Pattern
```javascript
// Use media queries in styled components
import styled from 'styled-components';

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;
```

---

## Animation Strategy

### Micro-interactions using Framer Motion

**1. Page Transitions**
```javascript
// Effects: Fade + Slide Up
const pageVariants = {
  initial: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

<motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
  {/* Page content */}
</motion.div>
```

**2. Button Click Feedback**
```javascript
const Button = styled(motion.button)`...`;

<Button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
  Click me
</Button>
```

**3. Cart Icon Badge Animation**
```javascript
<motion.div
  animate={{ scale: [1, 1.2, 1] }}
  transition={{ type: 'spring', stiffness: 200 }}
>
  {cartCount}
</motion.div>
```

**4. Success Animations**
```javascript
// Checkmark animation after successful action
<motion.div
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  exit={{ scale: 0, opacity: 0 }}
>
  <Check color={'green'} size={32} />
</motion.div>
```

**5. Loading Skeleton Pulse**
```javascript
// Already implemented in Skeleton component
```

**6. Commission Earned Sparkle**
```javascript
// Celebratory animation when commission appears
const sparkleVariants = {
  animate: {
    scale: [1, 1.1, 0.8],
    opacity: [1, 0.7, 0],
    rotate: 360
  },
  transition: { duration: 1, delay: 0.2 }
};
```

---

## Project Structure

```
frontend/
├── app/
│   ├── layout.jsx                  # Root layout
│   ├── page.jsx                    # Homepage
│   ├── (public)/
│   │   ├── products/
│   │   │   ├── page.jsx           # Products listing
│   │   │   └── [id]/
│   │   │       └── page.jsx       # Product details
│   │   ├── cart/page.jsx
│   │   ├── checkout/page.jsx
│   │   ├── leaderboard/page.jsx
│   │   └── ref/[code]/page.jsx    # Referral redirect
│   │
│   ├── (protected)/
│   │   ├── layout.jsx             # Dashboard layout
│   │   ├── dashboard/
│   │   │   ├── orders/page.jsx
│   │   │   ├── orders/[id]/page.jsx
│   │   │   └── settings/
│   │   │       ├── profile/page.jsx
│   │   │       └── account/page.jsx
│   │   │
│   │   ├── affiliate/
│   │   │   ├── dashboard/page.jsx
│   │   │   ├── share/page.jsx
│   │   │   ├── commissions/page.jsx
│   │   │   ├── payouts/page.jsx
│   │   │   ├── analytics/page.jsx
│   │   │   └── settings/page.jsx
│   │   │
│   │   └── admin/
│   │       ├── dashboard/page.jsx
│   │       ├── products/page.jsx
│   │       ├── orders/page.jsx
│   │       ├── affiliates/page.jsx
│   │       ├── commissions/page.jsx
│   │       └── payouts/page.jsx
│   │
│   └── auth/
│       ├── login/page.jsx
│       ├── register/page.jsx
│       └── forgot-password/page.jsx
│
├── components/
│   ├── ui/                         # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Toast.jsx
│   │   ├── Badge.jsx
│   │   ├── Skeleton.jsx
│   │   ├── Table.jsx
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Footer.jsx
│   │   ├── DashboardLayout.jsx
│   │   └── PublicLayout.jsx
│   │
│   ├── marketplace/
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   ├── ProductGallery.jsx
│   │   ├── FilterPanel.jsx
│   │   └── SearchBar.jsx
│   │
│   ├── cart/
│   │   ├── CartItem.jsx
│   │   ├── CartSummary.jsx
│   │   └── CartEmpty.jsx
│   │
│   ├── checkout/
│   │   ├── CheckoutForm.jsx
│   │   ├── ShippingForm.jsx
│   │   ├── PaymentForm.jsx
│   │   └── OrderConfirmation.jsx
│   │
│   ├── affiliate/
│   │   ├── AffiliateCard.jsx
│   │   ├── LinkGenerator.jsx
│   │   ├── EarningsChart.jsx
│   │   ├── StatsCard.jsx
│   │   ├── ReferralTable.jsx
│   │   └── PayoutForm.jsx
│   │
│   ├── admin/
│   │   ├── ProductManager.jsx
│   │   ├── OrderManager.jsx
│   │   ├── AffiliateManager.jsx
│   │   ├── CommissionManager.jsx
│   │   └── PayoutManager.jsx
│   │
│   └── auth/
│       ├── LoginForm.jsx
│       ├── RegisterForm.jsx
│       ├── ProtectedRoute.jsx
│       └── AuthWrapper.jsx
│
├── hooks/
│   ├── useAuth.js
│   ├── useCart.js
│   ├── useProducts.js
│   ├── useOrders.js
│   ├── useAffiliate.js
│   ├── useToast.js
│   └── ...
│
├── stores/
│   ├── useAuthStore.js            # Zustand
│   ├── useCartStore.js
│   ├── useAffiliateStore.js
│   └── ...
│
├── services/
│   ├── api.js                     # Axios instance with interceptors
│   ├── authService.js
│   ├── productService.js
│   ├── cartService.js
│   ├── orderService.js
│   ├── affiliateService.js
│   └── ...
│
├── styles/
│   ├── GlobalStyle.js             # Global CSS-in-JS
│   ├── theme.js                   # Theme config
│   └── animations.js              # Reusable animation variants
│
├── utils/
│   ├── formatters.js              # Format currency, dates, etc.
│   ├── validators.js              # Input validation rules
│   ├── constants.js               # App constants
│   └── helpers.js                 # Utility functions
│
├── config/
│   ├── env.js                     # Environment variables
│   └── api.js                     # API configuration
│
├── middleware/
│   └── authMiddleware.js          # Auth checks
│
├── public/
│   ├── images/
│   └── icons/
│
├── .env.local
├── .eslintrc.json
├── next.config.js
├── package.json
└── tailwind.config.js (optional)
```

---

## Component Implementation Checklist

### Phase 1: Core UI Components (Week 1)
- [ ] Button components (all variants)
- [ ] Card components
- [ ] Input/Form components
- [ ] Modal component
- [ ] Toast/Notification system
- [ ] Badge component
- [ ] Skeleton loader
- [ ] Table component
- [ ] Global theme & styles

### Phase 2: Layout Components (Week 1-2)
- [ ] Navbar with logo, search, cart, user menu
- [ ] Sidebar navigation (for dashboard)
- [ ] Footer with links
- [ ] DashboardLayout wrapper
- [ ] PublicLayout wrapper
- [ ] Responsive breakpoints

### Phase 3: Marketplace Components (Week 2)
- [ ] ProductCard with hover effects
- [ ] ProductGrid with responsive layout
- [ ] ProductGallery with zoom
- [ ] FilterPanel (category, price)
- [ ] SearchBar with autocomplete
- [ ] Product details page layout

### Phase 4: Cart & Checkout (Week 2-3)
- [ ] CartItem component
- [ ] CartSummary with totals
- [ ] ShippingForm
- [ ] PaymentForm (Stripe integration)
- [ ] ConversionChart with Framer Motion

### Phase 5: Affiliate Components (Week 3-4)
- [ ] AffiliateCard with stats
- [ ] LinkGenerator with copy button
- [ ] EarningsChart (line chart)
- [ ] StatsCard with animation
- [ ] ReferralTable with sorting
- [ ] PayoutForm with validation

### Phase 6: Admin Components (Week 4)
- [ ] ProductManager table with CRUD
- [ ] OrderManager with status updates
- [ ] AffiliateManager with approval
- [ ] CommissionManager with bulk actions
- [ ] PayoutManager with processing

### Phase 7: Animations & Polish (Week 5)
- [ ] Page transitions (fade + slide)
- [ ] Button hover/click animations
- [ ] Skeleton to content transitions
- [ ] Success/error animations
- [ ] Affiliate earning sparkle effect
- [ ] Smooth chart animations

---

## Design System Export

### Styled Components Theme Provider Setup
```javascript
// app/layout.jsx
import { ThemeProvider } from 'styled-components';
import theme from '@/styles/theme';
import GlobalStyle from '@/styles/GlobalStyle';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}

// Providers component wraps React Query, Toast, etc.
function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Toast />
      {children}
    </QueryClientProvider>
  );
}
```

---

**Design System Status:** ✅ Complete  
**Component Architecture:** ✅ Defined  
**Implementation Ready:** ✅ Yes  
**Frontend Tech Stack Aligned:** ✅ Confirmed

Next Step: Begin implementation following the weekly timeline in Phase 1.
