<div align="center">

# 👑 LUXURY.LK

### Premium Fashion E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-9.0-512BD4?style=flat-square&logo=dotnet)](https://dotnet.microsoft.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![SQL Server](https://img.shields.io/badge/SQL_Server-LocalDB-CC2927?style=flat-square&logo=microsoftsqlserver)](https://www.microsoft.com/sql-server)

*A full-stack luxury clothing e-commerce web application built for Sri Lanka's premium fashion market.*

</div>

---

## 📌 Overview

**LUXURY.LK** is a premium, full-stack fashion e-commerce ecosystem designed to deliver a seamless shopping experience for customers and a high-efficiency dashboard for store administrators. Built with a modern, responsive interface, the application bridges a luxury customer storefront with a robust, enterprise-grade inventory management backend.

### 🌟 Key Features

* **✨ Immersive Customer Storefront**: A fluid customer interface featuring mega-menus, animated product displays, interactive catalogs, instant cart drawer drawers, wishlists, and direct floating WhatsApp chat support.
* **👑 Advanced Control Center**: A dedicated workspace for administrators that manages products (tabbed CRUD forms), category lists, printable invoice views, real-time settings live mockup previews, and dedicated system diagnostics with live refresh alerts.
* **📋 Smart Stock & Reservation Management**: Tracks inventory dynamically across **Total Stock (On-Hand)**, **Reserved Stock (Pending Orders)**, and **Available Stock (Net Sellable)**. Includes configurable low-stock threshold triggers.
* **🔐 Enterprise-Grade Architecture**: Secured by JWT authorization, NextAuth (Google OAuth integration), automated transactional email workflows, and transactional SQL databases.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), React, TypeScript |
| **Backend** | ASP.NET Core 9 (C#), REST API |
| **Database** | Microsoft SQL Server (LocalDB) via Entity Framework Core |
| **Auth** | JWT Tokens + Google OAuth (NextAuth.js) |
| **Email** | Gmail SMTP — Order confirmations & Email verification |
| **Styling** | Vanilla CSS + Inline Styles (Premium custom design) |
| **Fonts** | Playfair Display, Montserrat (Google Fonts) |
| **File Upload** | ASP.NET Core Static File Serving (`/uploads`) |

---

## 📁 Project Structure

```
Luxury-Cloths-Project/
│
├── frontend/                         # Next.js 15 Frontend
│   └── src/
│       ├── app/
│       │   ├── page.tsx              # Home Page (Hero, Collections, Featured)
│       │   ├── layout.tsx            # Root Layout (Navbar + Footer + Providers)
│       │   │
│       │   ├── admin/                # Admin Panel (Protected)
│       │   │   ├── dashboard/        # Analytics, Stats, Report Center
│       │   │   ├── products/         # Product Management (CRUD)
│       │   │   ├── orders/           # Order Management
│       │   │   ├── users/            # User Account Management
│       │   │   ├── stock/            # Inventory & Stock Control
│       │   │   ├── categories/       # Category Management
│       │   │   └── settings/         # Site Settings
│       │   │
│       │   ├── storefront/           # Customer-Facing Pages
│       │   │   ├── shop/             # Product Listing + Category Filter
│       │   │   ├── product/          # Product Detail (Gallery, Variants)
│       │   │   ├── cart/             # Shopping Cart Page
│       │   │   ├── checkout/         # Checkout + Billing + Payment
│       │   │   ├── collections/      # Collections Browser
│       │   │   ├── about/            # About Us
│       │   │   ├── contact/          # Contact Form
│       │   │   ├── blog/             # Blog
│       │   │   ├── faq/              # FAQ
│       │   │   ├── shipping/         # Shipping Policy
│       │   │   ├── returns/          # Return Policy
│       │   │   ├── size-guide/       # Size Guide
│       │   │   └── testimonials/     # Customer Reviews
│       │   │
│       │   ├── auth/                 # Login & Register Pages
│       │   ├── profile/              # User Profile (Edit + Avatar)
│       │   ├── account/              # Account Settings
│       │   └── orders/               # My Orders (Track Status)
│       │
│       └── components/
│           ├── Navbar.tsx            # Navigation Bar (Mega Menu, Search)
│           ├── Footer.tsx            # Footer
│           ├── CartDrawer.tsx        # Slide-in Shopping Cart
│           ├── WishlistDrawer.tsx    # Slide-in Wishlist
│           ├── ProductCard.tsx       # Reusable Product Card
│           ├── AdminSidebar.tsx      # Admin Navigation Sidebar
│           └── ChatButtons.tsx       # WhatsApp & Messenger Floating Buttons
│
└── backend/                          # ASP.NET Core 9 REST API
    ├── Controllers/
    │   ├── AuthController.cs         # Register, Login, OAuth, Reset
    │   ├── ProductsController.cs     # Products CRUD API
    │   ├── OrdersController.cs       # Orders API
    │   ├── CategoriesController.cs   # Categories API
    │   ├── StockController.cs        # Inventory Management API
    │   ├── SettingsController.cs     # Site Settings API
    │   └── UploadsController.cs      # File Upload API
    │
    ├── Models/
    │   ├── User.cs                   # User Entity
    │   ├── Product.cs                # Product Entity
    │   ├── Order.cs                  # Order Entity
    │   ├── OrderItem.cs              # Order Line Items
    │   ├── Category.cs               # Category Entity
    │   ├── ProductImage.cs           # Product Image URLs
    │   ├── ProductVariant.cs         # Size/Color Variants + Stock
    │   └── StockMovement.cs          # Stock History Log
    │
    ├── Services/
    │   ├── TokenService.cs           # JWT Token Generation
    │   └── EmailService.cs           # Gmail SMTP Email Service
    │
    └── Program.cs                    # App Startup & Middleware
```

---

## ✅ Features

### 🛍️ Customer Storefront

| Feature | Status |
|---------|--------|
| Home Page — Hero Banner, Collections, Featured Products | ✅ Live |
| Product Listing — Category Filter | ✅ Live |
| Product Detail — Image Gallery, Size & Color Variants | ✅ Live |
| Real-time Search Bar with Dropdown Results | ✅ Live |
| Shopping Cart (Slide-in Drawer) | ✅ Live |
| Wishlist (Slide-in Drawer) | ✅ Live |
| Checkout — Billing & Shipping Form | ✅ Live |
| Payment — Bank Transfer (Slip Upload) + Cash on Delivery | ✅ Live |
| Order Confirmation Email (Gmail SMTP) | ✅ Live |
| My Orders Page — Track Order Status | ✅ Live |
| User Profile — Edit Name, Phone, Upload Avatar | ✅ Live |
| Collections Page | ✅ Live |
| About, Contact, Blog, FAQ, Shipping, Returns | ✅ Live |
| WhatsApp & Messenger Chat Buttons | ✅ Live |
| Mega Menu Navigation (Women, Men dropdowns) | ✅ Live |
| Rotating Promo Announcement Strip | ✅ Live |

### 🔐 Authentication

| Feature | Status |
|---------|--------|
| Register with Email & Password | ✅ Live |
| Login with JWT Token | ✅ Live |
| Email Verification on Register | ✅ Live |
| Google OAuth Login | ✅ Live |
| Forgot Password — Email Reset Link | ✅ Live |
| Password Reset Flow | ✅ Live |
| Profile Picture Upload & Persist | ✅ Live |

### 👑 Admin Panel

| Feature | Status |
|---------|--------|
| Dashboard — Revenue, Orders, Users, Stock Stats | ✅ Live |
| Sales Chart (Last 7 Days) | ✅ Live |
| Products — Create, Edit, Delete | ✅ Live |
| Product Image Upload (Multiple Images) | ✅ Live |
| Product Variants — Size, Color, Stock Qty | ✅ Live |
| Orders — View All, Update Status, View Payment Slip | ✅ Live |
| Users — View All Accounts, Manage Roles | ✅ Live |
| Stock & Inventory Management | ✅ Live |
| Stock Movement History Log | ✅ Live |
| Categories — Add, Edit, Delete | ✅ Live |
| Report Center — Sales, Products, Stocks, Users | ✅ Live |
| PDF Report Generation (Print-Ready Layout) | ✅ Live |
| CSV Report Download | ✅ Live |
| Site Settings | ✅ Live |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [.NET SDK 9.0](https://dotnet.microsoft.com/download)
- [SQL Server LocalDB](https://learn.microsoft.com/sql/database-engine/configure-windows/sql-server-express-localdb)

---

### 1. Clone the Repository

```bash
git clone https://github.com/rasikaprabath12345/Luxury-Cloths-Project.git
cd Luxury-Cloths-Project
```

---

### 2. Run the Backend

```bash
cd backend

# Apply database migrations (first time only)
dotnet ef database update

# Start the API server
dotnet run
```

> API running at: **http://localhost:5226**  
> Interactive API docs: **http://localhost:5226/scalar**

---

### 3. Run the Frontend

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

> App running at: **http://localhost:3000**

---

### 4. Admin Login

```
URL:       http://localhost:3000/auth/login
Email:     admin@luxury.lk
Password:  AdminPassword123
```

---

## ⚙️ Configuration

### Backend — `backend/appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=LuxuryStoreLocalDb;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Jwt": {
    "Key": "your_64_character_secret_key_here"
  },
  "Smtp": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "Username": "your_email@gmail.com",
    "Password": "your_gmail_app_password"
  }
}
```

### Frontend — `frontend/.env.local` (create this file)

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

NEXT_PUBLIC_API_URL=http://localhost:5226
```

---

## 🗄️ Database Models

### User
| Field | Type | Description |
|-------|------|-------------|
| Id | int | Primary Key |
| FullName | string | Full name |
| Email | string | Email address |
| PasswordHash | string | BCrypt hashed password |
| Phone | string | Phone number |
| Avatar | string | Profile picture URL |
| Role | string | `Admin` or `Customer` |
| GoogleId | string? | Google OAuth ID |
| IsVerified | bool | Email verified status |
| CreatedAt | DateTime | Registration date |

### Product
| Field | Type | Description |
|-------|------|-------------|
| Id | int | Primary Key |
| Name | string | Product name |
| Slug | string | SEO-friendly URL (e.g. `black-silk-dress`) |
| Description | string | Product description |
| Price | decimal | Price (LKR) |
| Discount | int | Discount percentage |
| CategoryId | int | Category foreign key |
| Images | List | Multiple product images |
| Variants | List | Size/color/stock variants |
| IsChoice | bool | Choice Collection flag |
| IsSale | bool | On Sale flag |
| Rating | double | Product rating (default 4.5) |

### Order
| Field | Type | Description |
|-------|------|-------------|
| Id | int | Primary Key |
| UserId | int | User foreign key |
| TotalAmount | decimal | Total order value |
| PaymentMethod | string | `BankTransfer` or `COD` |
| PaymentSlipUrl | string? | Uploaded bank slip image |
| Status | string | `Pending` → `Approved` → `Shipped` |
| Address | string | Shipping address |
| OrderItems | List | Line items list |
| CreatedAt | DateTime | Order date |

---

## 🌐 API Reference

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Login + receive JWT |
| POST | `/api/auth/google-login` | Public | Google OAuth |
| GET | `/api/auth/verify-email?token=` | Public | Verify email |
| POST | `/api/auth/forgot-password` | Public | Send reset email |
| POST | `/api/auth/reset-password` | Public | Reset password |
| GET | `/api/auth/me` | Auth | Get current user |
| PUT | `/api/auth/update-profile` | Auth | Update profile |

### Products
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/products` | Public | Get all products |
| GET | `/api/products/{id}` | Public | Get single product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/{id}` | Admin | Update product |
| DELETE | `/api/products/{id}` | Admin | Delete product |

### Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/orders` | Admin | Get all orders |
| GET | `/api/orders/my` | Auth | Get my orders |
| POST | `/api/orders` | Auth | Place an order |
| PUT | `/api/orders/{id}/status` | Admin | Update order status |

### Stock
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/stock` | Admin | Get all stock info |
| POST | `/api/stock/add` | Admin | Add stock |
| POST | `/api/stock/remove` | Admin | Remove stock |
| GET | `/api/stock/movements` | Admin | Stock history log |

---

## 🔄 Application Flows

### Customer Shopping Flow
```
Home Page
  → Browse Products (Shop with Filters)
    → Product Detail (Select Size & Color)
      → Add to Cart (Slide-in Drawer)
        → Checkout (Fill Billing & Shipping)
          → Payment:
              ├── Bank Transfer → Upload Payment Slip
              └── Cash on Delivery
                → Order Confirmed → Email Sent
                  → My Orders (Track: Pending → Approved → Shipped)
```

### Authentication Flow
```
Register → Email Verification Link → Account Active
                      OR
Login → JWT Token Issued → Access Protected Routes

Google Login → OAuth → Auto Register/Login → Logged In
```

### Admin Flow
```
Admin Login
  → Dashboard (Revenue Charts, Recent Orders, Quick Stats)
    ├── Products → Add/Edit/Delete + Image Upload + Variants
    ├── Orders → View, Update Status, Check Payment Slip
    ├── Users → View All, Change Roles
    ├── Stock → Add/Remove Stock, View Movement History
    ├── Report Center → Generate PDF or CSV Reports
    └── Settings → Configure Site Options
```

---

## 📊 Reports Available

| Report Type | Formats |
|-------------|---------|
| Sales & Revenue Report | PDF (Print) + CSV |
| Product Catalog Report | PDF (Print) + CSV |
| Stocks & Inventory Report | PDF (Print) + CSV |
| User Accounts Report | PDF (Print) + CSV |

PDF reports include: company header, data table, signature area, and branded footer.

---

## 🔮 Roadmap / Upcoming Features

### 🚨 High Priority
- [ ] **Online Payment Gateway** — PayHere.lk / Stripe integration
- [ ] **Product Reviews & Ratings** — Customer review system
- [ ] **Real-time Notifications** — Order status updates via email/SMS
- [ ] **Mobile Application** — React Native or Flutter
- [ ] **Advanced Filters** — Price range, color, brand filtering

### 🎯 Medium Priority
- [ ] **Discount Coupon Codes** — Promo code at checkout
- [ ] **Loyalty Points System** — Earn points on purchases
- [ ] **Product Comparison** — Side-by-side product view
- [ ] **Multi-language Support** — English, Sinhala, Tamil
- [ ] **Product Bundles** — Combo / bundle offers
- [ ] **Size Recommendation** — AI-assisted size suggestion

### 📈 Admin Enhancements
- [ ] **Inventory Low Stock Alerts** — Auto email when stock drops
- [ ] **Bulk Product Import** — CSV upload for many products
- [ ] **Live Analytics** — Google Analytics integration
- [ ] **WhatsApp Notifications** — Admin alert on new orders
- [ ] **Abandoned Cart Recovery** — Reminder emails
- [ ] **Advanced Charts** — Monthly/yearly trend analysis

### 🌐 Infrastructure
- [ ] **Cloud Deployment** — Azure App Service / Vercel
- [ ] **CDN Image Storage** — Cloudinary integration
- [ ] **Full SEO** — sitemap.xml, Open Graph, structured data
- [ ] **Security Hardening** — Rate limiting, CSRF protection
- [ ] **Automated Database Backup** — Scheduled SQL backups

---

## 🎨 Design System

### Color Palette
| Name | Hex | Usage |
|------|-----|-------|
| Gold Primary | `#aa841c` | Buttons, active states, underlines |
| Gold Bright | `#d4af37` | Hover states, highlights |
| Dark Navy | `#0f172a` | Headings, body text |
| Warm Cream | `#fdf8f0` | Page backgrounds |
| Dark Luxury | `#1a1208` | Promo announcement strip |

### Typography
| Font | Style | Usage |
|------|-------|-------|
| **Playfair Display** | Serif | Headings, Logo, Hero text |
| **Montserrat** | Sans-serif | Navigation, Labels, Buttons |
| **Geist Sans** | Modern Sans | Body text |

---

## 👥 Role Permissions

| Feature | Customer | Admin |
|---------|:--------:|:-----:|
| Browse & Search Products | ✅ | ✅ |
| Add to Cart & Wishlist | ✅ | ✅ |
| Place Orders | ✅ | ✅ |
| View Own Orders | ✅ | ✅ |
| Edit Own Profile | ✅ | ✅ |
| View All Orders | ❌ | ✅ |
| Manage Products | ❌ | ✅ |
| Manage Users | ❌ | ✅ |
| Manage Stock | ❌ | ✅ |
| Generate Reports | ❌ | ✅ |
| Site Settings | ❌ | ✅ |

---

## 🐛 Known Issues

| Issue | Status |
|-------|--------|
| Profile avatar disappears after page reload (localStorage cache issue) | 🔧 Investigating |
| PDF report generation blocked by browser popup blocker | 🔧 Workaround needed |
| Navbar not fully responsive on small mobile screens | 📋 Planned |
| Google OAuth token refresh handling | 📋 Planned |

---

## 🛠️ Development Notes

- Backend uses **BCrypt** for password hashing
- Images are served as static files from `/uploads` directory
- JWT tokens are stored in `localStorage` on the client
- Admin routes are protected by role-based middleware
- Database is auto-migrated and seeded on startup (default admin + categories)
- CORS is configured for `http://localhost:3000`

---

## 📞 Contact

| | |
|--|--|
| **Developer** | Rasika Prabath |
| **Email** | rasikaprabath8694@gmail.com |
| **GitHub** | [@rasikaprabath12345](https://github.com/rasikaprabath12345) |
| **Repository** | [Luxury-Cloths-Project](https://github.com/rasikaprabath12345/Luxury-Cloths-Project) |

---

## 📄 License

This project is developed for **educational and personal portfolio purposes**.

---

<div align="center">

**LUXURY.LK** — *Elegance Delivered, Excellence Defined* ✨

Made with ❤️ in Sri Lanka by Rasika Prabath

</div>
