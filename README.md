# LUXURY.LK — Premium Fashion E-Commerce Platform

A professional, full-stack luxury fashion e-commerce platform designed to offer an immersive shopping experience for customers and a high-performance administrative panel for store management. 

Developed with a client-side architecture using Next.js 15 (App Router) and a secure, scalable backend built on ASP.NET Core 9 (Web API).

---

## 🏗️ Architectural Overview

```
 [ Customer Storefront ]          [ Admin Control Panel ]
        (Next.js)                         (Next.js)
            │                                 │
            ├─────── HTTP REST Requests ──────┤
            ▼                                 ▼
┌─────────────────────────────────────────────────────────┐
│                    ASP.NET Core Web API                 │
│                                                         │
│   [ AuthController ]           [ ProductsController ]   │
│   [ OrdersController ]         [ StockController ]      │
│   [ CategoriesController ]     [ SettingsController ]   │
└────────────────────────────┬────────────────────────────┘
                             │
                  Entity Framework Core ORM
                             │
                             ▼
               ┌───────────────────────────┐
               │    SQL Server Database    │
               │   (Users, Products, etc.) │
               └───────────────────────────┘
```

---

## 🌟 Core Capabilities

### Client Storefront
* **Responsive Presentation**: Adaptable layout optimized for desktop, tablet, and mobile viewing.
* **Shopping Cart & Wishlist**: Real-time sliding cart drawer, wishlist drawer, and streamlined order checkout forms.
* **Customer Accounts**: Secure registration, login, profile editing (avatar uploads), and purchase history tracking.
* **Support Integration**: Direct float button connection to WhatsApp support line.

### Admin Control Panel
* **Live Dashboard**: Core business telemetry, system health stats, and detailed logs.
* **Product Manager**: CRUD operations with a tabbed interface for descriptions, pricing, and variants.
* **Stock & Reservation Management**: Handles inventory status:
  * **Total Stock**: Physical stock on hand.
  * **Reserved Stock**: Items tied to pending orders.
  * **Available Stock**: Net sellable items (Total minus Reserved).
* **Printable Invoices**: On-demand invoice formatting and rendering for instant browser printing.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Vanilla CSS
* **Backend**: ASP.NET Core 9, C#, Web API, Entity Framework Core
* **Database**: Microsoft SQL Server (LocalDB)
* **Authentication**: JWT (JSON Web Tokens) & NextAuth.js (Google OAuth Integration)
* **Notifications**: SMTP Email Integration (OTP verification & customer order receipts)

---

## 📁 Project Directory Layout

```
Luxury-Cloths-Project/
├── backend/                       # ASP.NET Core 9 Web API
│   ├── Controllers/               # Auth, Products, Orders, Categories, Stock Controllers
│   ├── Data/                      # ApplicationDbContext & Migrations
│   ├── Models/                    # Database entities (User, Product, Order, Stock)
│   └── Program.cs                 # API Configuration & Middleware Routing
│
└── frontend/                      # Next.js 15 App
    ├── src/
    │   ├── app/                   # App Router Pages
    │   │   ├── admin/             # Dashboard, Stock, Products, Orders (Admin Protected)
    │   │   ├── storefront/        # Shop, Checkout, Cart, Profile (Customer facing)
    │   │   └── auth/              # Login, Registration, Password Reset Pages
    │   ├── components/            # Shared UI components (Navbar, Sidebar, Drawers)
    │   ├── context/               # AuthContext, CartContext, WishlistContext Providers
    │   └── lib/                   # API utilities & Axios client definitions
    └── package.json               # Node dependencies
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
* .NET 9.0 SDK
* Node.js (v18 or higher)
* SQL Server LocalDB

### 2. Backend Setup
1. Navigate to the `backend` folder.
2. Run database updates and start the service:
   ```bash
   dotnet ef database update
   dotnet run
   ```
   *The server runs on http://localhost:5165.*

### 3. Frontend Setup
1. Navigate to the `frontend` folder.
2. Install the package dependencies:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
   *The app will be accessible at http://localhost:3000.*
