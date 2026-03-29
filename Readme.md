# Spherekings Marketplace & Affiliate System Backend

## Project Overview

**Spherekings Marketplace & Affiliate System** is a backend platform designed to power an **online marketplace and affiliate marketing system** for the *Sphere of Kings* board game.

The platform enables people to:

- Purchase Sphere of Kings products directly through an online marketplace.
- Promote the product through **affiliate referral links**.
- Earn **commissions for successful sales generated through their referrals**.

The backend system provides all core infrastructure required to support:

- Product catalog management
- Secure checkout and order processing
- Affiliate tracking and commission attribution
- Affiliate dashboards
- Administrative management tools

This backend is being developed using **AI-assisted development (vibe coding)** with **GitHub Copilot (Claude 4.5)** to accelerate development while maintaining architectural consistency.

---

# Business Objective

The primary goal of the platform is to **enable early sales of the Sphere of Kings board game through affiliate marketing**.

Rather than waiting for retail distribution, the system allows:

1. Individuals to register as affiliates.
2. Affiliates to promote the game using unique referral links.
3. Customers to purchase the product through those links.
4. Affiliates to receive commissions for successful purchases.

This strategy allows the platform to **generate revenue quickly while building a community-driven marketing network.**

---

# Core Features

### Marketplace

- Product catalog
- Product detail pages
- Product customization (color combinations)
- Shopping cart
- Secure checkout
- Order confirmation

### Affiliate System

- Affiliate registration
- Unique referral link generation
- Referral click tracking
- Referral cookie storage
- Affiliate sales attribution
- Commission calculation

### Affiliate Dashboard

Affiliates can view:

- Referral links
- Click statistics
- Sales generated
- Commission earnings
- Payout history

### Admin Dashboard

Administrators can manage:

- Products
- Orders
- Affiliates
- Commissions
- Payouts
- Customers

### Commission Engine

The backend automatically:

- Detects affiliate referrals
- Calculates commission amounts
- Stores commission records
- Tracks pending and paid commissions

---

# System Architecture

The backend follows a **modular monolithic architecture** built using the **MERN stack**.

## Technology Stack

Backend:

- Node.js
- Express.js

Database:

- MongoDB (MongoDB Atlas)

Authentication:

- JWT

Payment Processing:

- Stripe (recommended)

Optional Infrastructure:

- Redis (caching)
- BullMQ (background jobs)
- Cloudinary (image storage)

---

### High-Level Architecture


Client (React Frontend)
│
▼
Express REST API
│
├── Authentication Module
├── Marketplace Module
├── Cart & Checkout Module
├── Order Management Module
├── Affiliate System
├── Commission Engine
├── Admin System
│
▼
MongoDB Database
│
▼
External Services
(Stripe, Email Provider)


---

# Backend Modules

## 1. Authentication Module

Handles:

- User registration
- Login
- Password hashing
- JWT authentication
- Role-based access control

User roles:

- `customer`
- `affiliate`
- `admin`

---

## 2. User Management Module

Manages:

- User profiles
- Account settings
- Address data
- Role assignments

---

## 3. Marketplace Module

Handles product data and catalog functionality.

Responsibilities:

- Product listing
- Product details
- Product variants
- Inventory tracking

---

## 4. Cart Module

Stores temporary shopping cart data.

Capabilities:

- Add items to cart
- Remove items
- Update quantities
- Clear cart

---

## 5. Checkout & Payment Module

Handles payment processing using a payment gateway.

Responsibilities:

- Create checkout sessions
- Redirect to payment gateway
- Verify payments via webhook
- Trigger order creation

---

## 6. Order Management Module

Stores and manages orders.

Order statuses:

- pending
- paid
- processing
- shipped
- delivered
- cancelled
- refunded

---

## 7. Affiliate System Module

Allows users to become affiliates and promote products.

Responsibilities:

- Affiliate registration
- Unique affiliate code generation
- Referral link creation
- Affiliate statistics tracking

Example referral link:


https://spherekings.com/?ref=AFF12345


---

## 8. Referral Tracking Module

Tracks affiliate traffic.

Responsibilities:

- Record referral clicks
- Store affiliate cookies
- Associate orders with affiliates

---

## 9. Commission Engine

Handles affiliate earnings.

Responsibilities:

- Commission calculation
- Commission record storage
- Affiliate balance tracking
- Commission status management

Commission statuses:

- pending
- approved
- paid
- reversed

---

## 10. Payout Module

Handles payments to affiliates.

Responsibilities:

- Payout requests
- Payout tracking
- Admin payout approvals

---

## 11. Admin Module

Administrative tools for managing the platform.

Capabilities:

- Manage products
- Manage affiliates
- View sales analytics
- Process payouts
- Monitor orders

---

# Database Entities

### Users


User

id

name

email

password

role

affiliateCode

createdAt


---

### Products


Product

id

name

description

price

images

variants

stock

createdAt


---

### Cart


Cart

id

userId

items[]

updatedAt


---

### Orders


Order

id

userId

items[]

totalAmount

paymentStatus

orderStatus

affiliateId

createdAt


---

### Referral Clicks


ReferralClick

id

affiliateId

ipAddress

userAgent

timestamp


---

### Commissions


Commission

id

affiliateId

orderId

amount

status

createdAt


---

### Payouts


Payout

id

affiliateId

amount

status

method

createdAt


---

# API Structure

All backend routes are prefixed with:


/api


### Authentication


POST /api/auth/register
POST /api/auth/login
GET /api/auth/me


### Products


GET /api/products
GET /api/products/:id

POST /api/admin/products
PUT /api/admin/products/:id
DELETE /api/admin/products/:id


### Cart


GET /api/cart
POST /api/cart/add
POST /api/cart/update
POST /api/cart/remove


### Checkout


POST /api/checkout/create-session
POST /api/checkout/webhook


### Orders


GET /api/orders
GET /api/orders/:id


### Affiliate


POST /api/affiliate/register
GET /api/affiliate/dashboard
GET /api/affiliate/referrals
GET /api/affiliate/commissions


### Admin


GET /api/admin/orders
GET /api/admin/affiliates
GET /api/admin/commissions
POST /api/admin/payouts


---

# Affiliate System Flow

1. User registers as an affiliate.
2. System generates a unique affiliate code.
3. Affiliate receives referral link.

Example:


https://spherekings.com/?ref=AFF12345


4. Customer clicks the referral link.
5. Backend records the click and stores affiliate ID in a cookie.
6. Customer purchases product.
7. Backend detects the affiliate ID.
8. Commission is calculated and recorded.
9. Affiliate balance is updated.
10. Admin processes payouts.

---

# Customer Purchase Flow

1. Customer visits marketplace.
2. Customer browses products.
3. Customer selects product options.
4. Customer adds product to cart.
5. Customer completes checkout.
6. Payment is processed.
7. Order is created.
8. Affiliate commission is calculated if referral exists.

---

# Admin Management Flow

Administrators manage the platform through backend APIs.

Admin capabilities include:

- Create and update products
- Monitor orders
- Manage affiliates
- Review commissions
- Process affiliate payouts

---

# Security Considerations

Authentication

- JWT authentication
- Password hashing using bcrypt

Payment Security

- All payments verified through Stripe webhooks
- Never trust client-side payment confirmation

Affiliate Fraud Prevention

- Prevent self-referrals
- Monitor suspicious click patterns
- Track IP addresses
- Prevent duplicate commission abuse

Rate Limiting

- Protect APIs from abuse using request rate limiting

---

# Scalability Considerations

Affiliate campaigns may generate large traffic spikes.

Recommended solutions:

### Redis

Use for:

- session storage
- referral caching
- rate limiting

### Job Queue

Use background job processing for:

- sending emails
- commission processing
- payout handling

Recommended tool:


BullMQ


### CDN

Serve assets through CDN:


Cloudflare


---

# Development Guidelines (AI-Assisted Development)

This project is designed to support **AI-assisted coding with GitHub Copilot**.

Best practices:

- Maintain consistent folder structure
- Write modular services
- Separate controllers and business logic
- Use descriptive naming conventions
- Document models clearly for AI context

When generating code with AI tools:

- Provide context through comments
- Generate small modules incrementally
- Test each module before moving to the next stage

---

# Recommended Project Structure


backend
│
├── src
│
├── config
│ └── database.js
│
├── models
│ ├── User.js
│ ├── Product.js
│ ├── Order.js
│ ├── Commission.js
│ ├── ReferralClick.js
│ └── Payout.js
│
├── controllers
│
├── services
│
├── routes
│
├── middlewares
│
├── utils
│
└── server.js


---

# Future Expansion

Possible future improvements:

### Multi-Level Affiliate System

Allow affiliates to recruit sub-affiliates.

### Affiliate Leaderboards

Display top performing affiliates.

### Discount Codes for Affiliates

Each affiliate receives a unique discount code.

### Email Marketing Integration

Automated campaigns for customers and affiliates.

### Advanced Analytics

Track:

- conversion rates
- affiliate performance
- campaign ROI

---

# Summary

The Spherekings Marketplace backend provides the core infrastructure required to power:

- an e-commerce marketplace
- a scalable affiliate marketing platform

By combining **secure order processing**, **referral tracking**, and **automated commission management**, the platform enables a community-driven sales system that can scale rapidly through affiliate marketing.

This README serves as the **primary architectural context** for both developers and AI coding assistants throughout the development lifecycle.