# 👑 LUXURY.LK

*A modern, full-stack luxury fashion e-commerce platform featuring an immersive client storefront and a secure control panel for store administration.*

---

## 📐 System Architecture

A clean representation of request lifecycle and data flow through the architecture layers:

```
    [ Customer Client ]               [ Admin Portal ]
      (Next.js App)                     (Next.js App)
            │                                 │
            ├─────────── REST APIs ───────────┤
            ▼                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                 ASP.NET Core 9.0 Web Services               │
│                                                             │
│  • AuthController         • ProductsController              │
│  • OrdersController       • StockController                 │
│  • CategoriesController   • SettingsController              │
└──────────────────────────────┬──────────────────────────────┘
                               │
                    Entity Framework Core ORM
                               │
                               ▼
               ┌───────────────────────────────┐
               │    SQL Server Database Layer  │
               │   (Users, Products, Orders)   │
               └───────────────────────────────┘
```

---

## 🌟 Key Capabilities

### 🛍️ Client Storefront
* **Responsive Layout** — Fully optimized for desktop, tablet, and mobile displays.
* **Smart Cart Drawer** — Slide-in dynamic shopping cart and wishlist management.
* **Customer Dashboard** — Order status tracking, history, and profile updates.
* **Live Chat Bridge** — Float button to connect directly with WhatsApp support.

### 👑 Admin Control Panel
* **Live Dashboard** — Live system telemetry, stats tracking, and logs.
* **Product Manager** — Tab-based CRUD forms for details, prices, and categories.
* **Real-time Stock Control** — Detailed inventory tracking:
  * *Total Stock* (On-Hand)
  * *Reserved Stock* (Pending Checkout)
  * *Available Stock* (Total minus Reserved)
* **Digital Invoices** — Dynamic invoices ready for web printing.

---

## 🛠️ Technology Stack

| Layer | Component | Description |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15 (React 19) | Modern client-side app with App Router |
| **Styling** | Vanilla CSS | Custom, premium design patterns |
| **Backend** | ASP.NET Core 9.0 | Scalable C# REST API Gateway |
| **Database** | SQL Server (LocalDB) | Entity Framework Core (Code-First) |
| **Auth** | JWT & NextAuth.js | Secured user sessions & Google OAuth |
| **Mail** | SMTP Server Integration | Transactional OTP and receipt notifications |

---

## 📁 Repository Directory Layout

```
Luxury-Cloths-Project/
├── backend/                       # ASP.NET Core Web API Server
│   ├── Controllers/               # REST API Gateways (Auth, Products, Orders, Stock)
│   ├── Data/                      # DbContext configuration & DB migrations
│   ├── Models/                    # Database schema representations
│   └── Program.cs                 # Services configuration & HTTP pipeline
│
└── frontend/                      # Next.js Frontend Application
    └── src/
        ├── app/                   # App Router Pages
        │   ├── admin/             # Dashboard, Stock, and Inventory management
        │   ├── storefront/        # Product displays, Cart, and Checkout pages
        │   └── auth/              # Registration, Login, and Password recovery
        ├── components/            # Reusable UI controls (Navbar, Sidebar, Drawers)
        ├── context/               # Global state providers (Auth, Cart, Wishlist)
        └── lib/                   # Network services (Axios instances & client actions)
```

---

## 🚀 Quick Setup Instructions

### 1. Requirements
* .NET 9.0 SDK
* Node.js (v18 or higher)
* SQL Server LocalDB

### 2. Startup Guide

#### Step A: Initialize Backend Database & Server
```bash
# Navigate to the backend folder
cd backend

# Execute database migrations
dotnet ef database update

# Boot up the backend API
dotnet run
```
*API runs at:* `http://localhost:5165`

#### Step B: Start Frontend Development Server
```bash
# Navigate to the frontend folder
cd frontend

# Install package dependencies
npm install

# Launch Next.js dev server
npm run dev
```
*Application runs at:* `http://localhost:3000`
