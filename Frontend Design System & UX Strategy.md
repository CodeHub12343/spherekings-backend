Spherekings Marketplace & Affiliate System
Design System & UX Strategy
1. Design Philosophy

The interface should follow a Conversion-First Minimalism philosophy.

Core principles:

1. Clarity over decoration

Users should instantly understand:

what the product is

how to buy

how to promote it

how much money they are earning

2. Trust-driven design

Because this involves payments and affiliate earnings, the interface must feel:

secure

professional

reliable

3. Dashboard-centric UX

Affiliate users will spend most time inside dashboards, so:

data must be easy to read

charts must be clean

navigation must be predictable

4. Frictionless conversion

For buyers:

fast product discovery

simple checkout

minimal distractions

2. Design System Strategy

Since you are using Next.js + React, the best approach is:

Component-driven design system

Create reusable UI components such as:

Core Components

Button
Input
Select
Card
Badge
Modal
Dropdown
Tabs
Tooltip
Toast
Table
Chart container

Layout Components

Container
Section
Grid
Stack
Sidebar
Navbar
PageHeader
DashboardLayout

Marketplace Components

ProductCard
ProductGallery
PriceBox
AddToCartButton
AffiliateLinkGenerator
CommissionBadge

Affiliate Components

EarningsCard
ReferralStats
ConversionChart
AffiliateLinkCard
PayoutStatus

Admin Components

ProductManagerTable
OrderTable
PayoutManager
UserManager
Component consistency strategy

Each component should define:

variant
size
state

Example:

Button variants:

primary
secondary
ghost
outline
danger

Sizes:

sm
md
lg

States:

hover
active
disabled
loading

This keeps your design predictable and scalable.

3. Visual Style

Your brand should feel premium but modern.

Color Palette

Primary color (brand)

Royal Purple / Indigo
#5B4DFF

Why:

royalty feel

stands out in marketplace UI

strong brand identity

Secondary

Deep Navy
#0F172A

Used for:

dashboards

headers

sidebar

Accent

Gold Accent
#F59E0B

Used sparingly for:

affiliate earnings

premium tags

commission indicators

Neutral palette

Gray 50
Gray 100
Gray 200
Gray 400
Gray 700
Gray 900

Used for backgrounds and typography hierarchy.

Typography

Use a modern SaaS typography stack.

Primary font

Inter

Reasons:

excellent readability

perfect for dashboards

widely used in SaaS apps

Hierarchy

H1 36px
H2 28px
H3 22px
Body 16px
Caption 14px
Small 12px

Use font weight hierarchy:

600 headings
500 UI labels
400 body text
Spacing System

Use an 8-point grid system.

Spacing tokens:

4px
8px
12px
16px
24px
32px
48px
64px

Benefits:

consistent layout

predictable spacing

easier responsive design

Icon Strategy

You chose Lucide icons, which is perfect.

Use icons for:

Navigation

Home
Store
Affiliate
Analytics
Orders
Settings

Affiliate stats

TrendingUp
DollarSign
Users
Link
BarChart

Guideline:

Icons should always appear with labels unless obvious.

4. UI Patterns

Now let's talk about core product flows.

Navigation Structure

Main layout:

Top Navbar
+ Left Sidebar (dashboard areas)

Sidebar

Dashboard
Marketplace
My Orders
Affiliate Center
Earnings
Analytics
Settings

Admin sidebar

Dashboard
Products
Orders
Users
Affiliates
Payouts
Settings
Dashboard Layout Pattern

Standard dashboard pattern:

PageHeader
StatsCards
Charts
Tables

Example affiliate dashboard:

Total Earnings
Pending Commission
Clicks
Conversions

Conversion Chart

Recent Referrals Table
Product Card Pattern

A product card should contain:

Product Image
Product Title
Short description
Price
Commission badge
Add to Cart
Promote button

Example layout

[IMAGE]

Title
Short description

$49

Earn 30% commission

[Buy Now]  [Promote]

Very powerful for affiliate marketplaces.

Checkout Pattern

Checkout should be 2 steps maximum.

Step 1

Cart Review
Coupon
Total

Step 2

Payment
Email
Confirm

Important rule:

Avoid long checkout forms.

Affiliate Dashboard Pattern

Affiliate users need:

Unique referral links
Performance analytics
Payout tracking

Dashboard cards

Total earnings
Monthly earnings
Clicks
Conversions

Charts

Clicks vs Conversions
Revenue growth

Tables

Recent referrals
Recent payouts
5. Motion & Animation Strategy

Because you are using Framer Motion, you can create beautiful but subtle interactions.

Rule:

Animation should guide attention, not entertain.

Page Transitions

Use soft fade + slight upward motion.

Example idea:

opacity 0 → 1
y 10 → 0
duration 0.25s

This gives the app a polished feel.

Hover Interactions

Important for marketplace browsing.

Product card hover:

scale 1 → 1.03
shadow increase

Buttons

background slightly darker

Links

underline slide animation
Micro-interactions

Examples that dramatically improve UX.

Add to cart

button morphs into check icon

Copy affiliate link

click → toast "Link copied"

Commission earned

small coin sparkle animation
Loading Animations

Avoid spinners if possible.

Use skeleton loaders instead.

Example

product card skeleton
dashboard stat skeleton
table skeleton

This improves perceived performance.

Feedback Animations

Success

green check animation

Error

shake animation

Loading

progress bar or skeleton
UX Focus Areas

The most important parts of the product should feel extremely smooth.

Priority areas:

1. Product page

Must drive conversions.

2. Affiliate dashboard

Must clearly show earnings.

3. Link sharing

Affiliates should generate links in one click.

4. Checkout

Must feel fast and trustworthy.

Final UX Vision

Your product should feel like a hybrid of:

Shopify marketplace clarity

Stripe dashboard polish

Gumroad affiliate simplicity

If implemented correctly, Spherekings will feel like a premium SaaS marketplace, not a basic ecommerce site.