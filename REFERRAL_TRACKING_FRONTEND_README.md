# Referral Tracking System - Frontend Implementation Guide

## Overview

Complete production-ready frontend implementation for the Referral Tracking & Attribution System. This system tracks affiliate referral clicks, manages cookie-based attribution, and provides comprehensive analytics for affiliate performance measurement.

**Framework**: Next.js 16.1.6 (App Router)  
**State Management**: React Query + Zustand  
**Styling**: Styled-components  
**Authentication**: JWT Bearer Token  

---

## Architecture & Structure

```
src/
├── api/
│   ├── services/
│   │   └── referralService.js          # API endpoints (13+ methods)
│   └── hooks/
│       └── useReferrals.js              # React Query hooks (8+ hooks)
│
├── components/
│   └── referrals/
│       ├── DateRangeFilter.jsx          # Date range picker
│       ├── DeviceAnalyticsChart.jsx     # Pie chart - device breakdown
│       ├── ReferralClicksTable.jsx      # Paginated clicks table
│       ├── ReferralSalesTable.jsx       # Sales attribution table
│       ├── ReferralSourceChart.jsx      # Bar chart - traffic by source
│       ├── ReferralStatsCards.jsx       # Summary statistics cards
│       ├── ReferralTrendChart.jsx       # Line chart - trends
│       └── VisitorJourneyStats.jsx      # Multi-metric overview
│
├── stores/
│   └── referralStore.js                 # Zustand state (filters, pagination, modals)
│
├── utils/
│   └── referralUtils.js                 # 25+ utility functions
│
└── app/
    └── affiliate/
        └── referrals/
            ├── dashboard/
            │   └── page.jsx              # /affiliate/referrals/dashboard
            ├── clicks/
            │   └── page.jsx              # /affiliate/referrals/clicks
            ├── sales/
            │   └── page.jsx              # /affiliate/referrals/sales
            └── analytics/
                └── page.jsx              # /affiliate/referrals/analytics
```

---

## Key Features

### 1. **Referral Click Tracking Dashboard**
**Route**: `/affiliate/referrals/dashboard`

The main entry point displaying overall referral performance with:
- Total clicks counter
- Conversion rate indicator
- Commission summary
- Unique visitors tracking
- Quick stats overview
- Recent activity feed

**Components Used**:
- `ReferralStatsCards` - Summary statistics
- `ReferralTrendChart` - Traffic trends
- Tables for recent activity

### 2. **Detailed Clicks View**
**Route**: `/affiliate/referrals/clicks`

Browse all referral clicks with advanced filtering:
- Paginated table (20 items per page, customizable)
- Filters: Converted status, date range, source, device
- Columns: Date, source, device, IP (masked), conversion status, commission
- Export functionality (CSV, JSON)
- Sort by any column

**Components Used**:
- `ReferralClicksTable` - Main table
- `DateRangeFilter` - Date selection
- Filter controls

### 3. **Sales Attribution Page**
**Route**: `/affiliate/referrals/sales`

View orders attributed to referrals:
- Order details (ID, total, status)
- Commission earned per order
- Customer information link
- Payout status tracking
- Paginated results
- Date range filtering

**Components Used**:
- `ReferralSalesTable` - Sales data
- `DateRangeFilter` - Date selection
- Stats summary cards

### 4. **Analytics Dashboard**
**Route**: `/affiliate/referrals/analytics`

Comprehensive analytics suite with:
- **Traffic by Source** (Bar Chart)
  - Direct, Email, Facebook, Twitter, Instagram, TikTok, Reddit, Blog
  - Shows clicks and conversions per source
  
- **Device Breakdown** (Pie Chart)
  - Mobile, Tablet, Desktop distribution
  - Conversion rates by device
  
- **Traffic Trends** (Line Chart)
  - Time-series data (daily, weekly, monthly granularity)
  - Overlay of clicks vs. conversions
  
- **Visitor Journey** (Multi-metric Card)
  - Total clicks
  - Unique visitors
  - Conversion count
  - Total commission earned
  - Average order value
  - Revenue per click

**Components Used**:
- `ReferralSourceChart` - Source analytics
- `DeviceAnalyticsChart` - Device breakdown
- `ReferralTrendChart` - Trend visualization
- `VisitorJourneyStats` - Journey metrics

---

## API Integration

### Service Layer: `referralService.js`

**Authentication**: All endpoints use Bearer Token (JWT)

#### Public Endpoints (No Auth)
```javascript
// Track referral click
await referralService.trackReferral(affiliateCode, redirectUrl, utmParams)

// Health check
await referralService.getHealthStatus()
```

#### Authenticated Endpoints
```javascript
// Get statistics for affiliate
await referralService.getReferralStats(affiliateId, dateFrom, dateTo)

// Get paginated referral clicks
await referralService.getReferrals(affiliateId, { 
  page, 
  limit, 
  convertedOnly, 
  dateFrom, 
  dateTo 
})

// Get attributed sales
await referralService.getSales(affiliateId, {
  page,
  limit,
  dateFrom,
  dateTo
})

// Get analytics data
await referralService.getAnalytics(affiliateId, {
  dateFrom,
  dateTo,
  groupBy // 'source', 'device', 'country'
})
```

### React Query Hooks: `useReferrals.js`

**Data Fetching Hooks**
```javascript
// Get referral statistics
const { stats, isLoading, error } = useReferralStats(affiliateId, dateRange)

// Get all clicks with pagination
const { clicks, pagination, isLoading, error } = useReferralClicks(affiliateId, filters)

// Get sales data
const { sales, pagination, isLoading, error } = useReferralSales(affiliateId, filters)

// Get analytics data
const { analytics, isLoading, error } = useReferralAnalytics(affiliateId, dateRange)

// Get breakdown by source
const { sourceData, isLoading } = useReferralsBySource(affiliateId)

// Get breakdown by device
const { deviceData, isLoading } = useReferralsByDevice(affiliateId)

// Get time-series trend data
const { trendData, isLoading } = useReferralTrends(affiliateId, dateRange, granularity)

// Get fraud patterns
const { suspicious, isLoading } = useSuspiciousPatterns(affiliateId)
```

---

## State Management

### Zustand Store: `referralStore.js`

**Filter State**
```javascript
// Date range
dateRange: { dateFrom, dateTo }

// Referral filters
referralsFilter: { convertedOnly, source, device }

// Pagination
clicksPagination: { page, limit }
salesPagination: { page, limit }

// Analytics view
analyticsView: { activeTab, chartType, timeGranularity }

// Modal state
referralModal: { isOpen, selectedReferral }
exportModal: { isOpen, exportFormat }

// Sorting
sorting: { clicksSort, salesSort }
```

**Available Actions**
```javascript
// Date range
store.setDateRange(dateFrom, dateTo)

// Filters
store.setReferralsFilter(key, value)
store.resetReferralsFilter()

// Pagination
store.setClicksPage(page)
store.setClicksLimit(limit)
store.setSalesPage(page)
store.setSalesLimit(limit)

// Analytics
store.setActiveTab(tab)
store.setChartType(type)
store.setTimeGranularity(granularity)

// Modals
store.openReferralModal(referral)
store.closeReferralModal()
store.openExportModal()
store.closeExportModal()

// Sorting
store.setClicksSort(field, direction)
store.toggleClicksSort(field)

// Reset
store.resetAllFilters()
```

**Persistence**
- Filters persist to localStorage for 24 hours
- Users' preferences (chart types, view settings) are remembered
- Pagination resets on filter changes

---

## UI Components

### Statistics Components

#### `ReferralStatsCards.jsx`
Displays key metrics in card format:
- Total Clicks
- Conversions
- Conversion Rate (%)
- Commission Earned
- Average Commission per Click
- Unique Visitors

**Props**:
```javascript
<ReferralStatsCards
  stats={{
    clicks: 1250,
    conversions: 45,
    conversionRate: 3.6,
    commission: 450.00,
    avgCommission: 10.00,
    uniqueVisitors: 890
  }}
/>
```

### Table Components

#### `ReferralClicksTable.jsx`
Paginated table of referral clicks.

**Features**:
- Sortable columns
- Inline conversion badge
- Commission display
- Source/device icons
- Export button
- Responsive design

**Props**:
```javascript
<ReferralClicksTable
  clicks={clickArray}
  onRowClick={handleRowClick}
  isLoading={false}
/>
```

#### `ReferralSalesTable.jsx`
Paginated table of attributed sales.

**Features**:
- Order details
- Commission tracking
- Customer link
- Payout status
- Date filtering
- Export functionality

**Props**:
```javascript
<ReferralSalesTable
  sales={salesArray}
  onViewOrder={handleViewOrder}
  isLoading={false}
/>
```

### Chart Components

#### `ReferralSourceChart.jsx`
Bar chart showing traffic by referral source.

**Features**:
- Groups by: email, facebook, twitter, instagram, tiktok, reddit, blog, direct
- Shows clicks and conversions
- Click percentage labels
- Responsive sizing

**Props**:
```javascript
<ReferralSourceChart
  data={[
    { source: 'email', clicks: 450, conversions: 18 },
    { source: 'facebook', clicks: 320, conversions: 12 }
  ]}
/>
```

#### `DeviceAnalyticsChart.jsx`
Pie chart of device type breakdown.

**Features**:
- Mobile/Tablet/Desktop split
- Conversion rate per device
- Percentage labels
- Color-coded segments

**Props**:
```javascript
<DeviceAnalyticsChart
  data={[
    { device: 'mobile', clicks: 450, conversions: 18 },
    { device: 'desktop', clicks: 600, conversions: 25 }
  ]}
/>
```

#### `ReferralTrendChart.jsx`
Line chart showing traffic trends over time.

**Features**:
- Dual-axis (clicks and conversions)
- Customizable time granularity (day/week/month)
- Hover tooltips
- Responsive sizing
- Legend

**Props**:
```javascript
<ReferralTrendChart
  data={[
    { date: '2024-03-01', clicks: 125, conversions: 5 },
    { date: '2024-03-02', clicks: 145, conversions: 6 }
  ]}
  granularity="day"
/>
```

### Analytics Components

#### `VisitorJourneyStats.jsx`
Multi-metric overview card showing visitor journey.

**Metrics**:
- Total Clicks → Unique Visitors → Conversions → Revenue
- Average Order Value
- Revenue per Click

**Props**:
```javascript
<VisitorJourneyStats
  data={{
    totalClicks: 1250,
    uniqueVisitors: 890,
    conversions: 45,
    totalCommission: 450.00,
    avgOrderValue: 85.50,
    avgClickValue: 0.36
  }}
/>
```

#### `DateRangeFilter.jsx`
Date picker for filtering data.

**Features**:
- Calendar picker
- Quick presets (Last 7 days, 30 days, 90 days)
- Custom date selection
- Format validation

**Props**:
```javascript
<DateRangeFilter
  dateFrom={dateFrom}
  dateTo={dateTo}
  onDateFromChange={setDateFrom}
  onDateToChange={setDateTo}
/>
```

---

## Utility Functions

### Formatting Functions
```javascript
formatCurrency(value, currency = 'USD')      // $1,234.56
formatDate(date, format = 'short')           // Mar 15, 24
formatDateTime(date)                          // Mar 15, 24, 02:30 PM
formatPercentage(value, decimals = 1)        // 3.6%
formatNumber(value, decimals = 0)            // 1,250
```

### Display Functions
```javascript
getDeviceName(device)        // 📱 Mobile, 💻 Desktop
getDeviceIcon(device)        // 📱, 💻
getSourceName(source)        // 📧 Email, 👍 Facebook
getSourceIcon(source)        // 📧, 👍
getConversionStatusColor(isSale)   // Color class
getConversionStatusLabel(isSale)   // ✅ Converted, ⏳ Pending
```

### Calculation Functions
```javascript
calculateConversionRate(conversions, clicks)    // 0.036 (3.6%)
calculateAvgCommission(totalCommission, conversions)  // 10.00
```

### Aggregation Functions
```javascript
aggregateBySource(referrals)    // { source, clicks, conversions, commission }[]
aggregateByDevice(referrals)    // { device, clicks, conversions, commission }[]
createTimeSeries(referrals, granularity)  // Time-series array
```

### Data Export Functions
```javascript
generateCSV(referrals, columns)        // CSV string
downloadCSV(csvContent, filename)      // Download CSV file
generateJSON(referrals, decimals)      // JSON string
downloadJSON(jsonContent, filename)    // Download JSON file
generatePDFFilename(prefix)            // timestamped-filename.pdf
```

### Fraud Detection Functions
```javascript
isSuspiciousIP(ipAddress)              // boolean
formatIPAddress(ipAddress, mask)       // IP with optional last-octet mask
```

### URL/Filter Functions
```javascript
parseFilterFromURL(queryString)        // Parse URL params to filter object
filterToURLParams(filters)             // Convert filter object to URL params
```

---

## Page Routes & Usage

### Dashboard Page
**Path**: `/affiliate/referrals/dashboard`

```javascript
// Displays overview with stats cards and trends
- Summary statistics cards (6 metrics)
- Trend chart (last 30 days)
- Recent sales feed
- Quick action links to detailed views
```

### Clicks Page
**Path**: `/affiliate/referrals/clicks`

```javascript
// Browse all referral clicks
- Stats summary (total, converted, rate, devices)
- Date range filter + converted-only checkbox
- Sortable table with pagination
- Export options
```

### Sales Page
**Path**: `/affiliate/referrals/sales`

```javascript
// View attributed orders
- Commission stats (total sales, total commission, avg order value, rate)
- Date range filter
- Sales table with order details
- Link to order details
- Payout status column
```

### Analytics Page
**Path**: `/affiliate/referrals/analytics`

```javascript
// Comprehensive analytics suite
- Overall metrics (clicks, visitors, conversion rate, avg commission)
- Visitor journey multi-metric card
- Traffic by source (bar chart)
- Device breakdown (pie chart)
- Traffic trends (line chart)
- Date range filter applies to all charts
```

---

## Authentication & Security

### Bearer Token
All authenticated requests include JWT Bearer token in Authorization header:
```javascript
Authorization: Bearer <jwt_token>
```

### Error Handling
- **401 Unauthorized**: User logged out or token expired → Redirect to login
- **403 Forbidden**: User doesn't belong to affiliate → Show error message
- **404 Not Found**: Affiliate or data not found → Show empty state
- **500 Server Error**: Backend error → Show error message with retry

### Data Privacy
- IP addresses masked for display (last octet shows as ***)
- Sensitive affiliate data only visible to affiliate account owner
- Admin can view only when authorized

---

## Development Setup

### Installation
```bash
# Install dependencies
npm install

# Environment variables required
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development Server
```bash
npm run dev
# Opens http://localhost:3000
```

### Build
```bash
npm run build
npm start
```

---

## Performance Optimization

### React Query Caching
- **Query Keys**: `['referrals', 'stats', affiliateId, dateRange]`
- **Cache Time**: 5 minutes default
- **Stale Time**: 2 minutes default
- **Focused Invalidation**: Only invalidate affected queries on mutations

### Component Optimization
- Lazy load charts on scroll
- Memoize expensive calculations
- Use React.memo for pure components
- Debounce date range filters

### Pagination
- Default 20 items per page
- Max 100 items per page
- Lazy load table rows

---

## Testing

### Unit Tests
```bash
npm test -- useReferrals
npm test -- referralService
npm test -- referralUtils
```

### Component Tests
```bash
npm test -- ReferralClicksTable
npm test -- ReferralSourceChart
npm test -- DateRangeFilter
```

### Integration Tests
```bash
npm test -- dashboard page
npm test -- analytics page
```

---

## Troubleshooting

### No data showing in tables
- Check date range filter (default: last 30 days)
- Verify affiliate has clicks/sales in selected date range
- Check browser console for API errors
- Verify JWT token is valid

### Charts not rendering
- Check browser console for errors
- Verify chart library is installed (recharts)
- Check data format matches component expectations
- Try clearing browser cache

### Pagination not working
- Check page parameter is being passed to API
- Verify limit parameter is correct
- Check total count from API response
- Verify onClick handlers are wired correctly

### Filters not applying
- Check filters are passed to API endpoint
- Verify filter state is being set in Zustand
- Check Redux DevTools for state changes
- Verify date format is ISO (YYYY-MM-DD)

---

## Browser Support

- Chrome 95+
- Firefox 94+
- Safari 15+
- Edge 95+
- Mobile browsers (iOS Safari 15+, Chrome Android 95+)

---

## Analytics Events (Optional)

```javascript
// Track page views
analytics.pageview({
  page: '/affiliate/referrals/clicks',
  title: 'Referral Clicks'
})

// Track filter usage
analytics.event('filter_applied', {
  filterKey: 'convertedOnly',
  value: true
})

// Track exports
analytics.event('export_started', {
  format: 'csv',
  count: 1250
})
```

---

## Future Enhancements

- [ ] Fraud detection alerts & manual review workflow
- [ ] Affiliate comparison benchmarking
- [ ] Advanced segmentation (by country, browser, OS)
- [ ] Custom date range presets
- [ ] Email report scheduling
- [ ] Integration with commission payout system
- [ ] Real-time websocket updates
- [ ] Advanced fraud pattern detection
- [ ] Geographic heat maps
- [ ] Competitor affiliate tracking

---

## Support & Documentation

- **API Documentation**: See `REFERRAL_TRACKING_API_DOCUMENTATION.md`
- **Backend Docs**: See backend `/REFERRAL_TRACKING_SYSTEM.md`
- **Model Schema**: See `ReferralTracking.js` in backend models

