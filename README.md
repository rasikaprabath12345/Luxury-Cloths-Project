# 👑 LUXURY.LK — Premium Fashion E-Commerce Platform

A professional, full-stack luxury fashion e-commerce platform designed to offer an immersive shopping experience for customers and a high-performance administrative panel for store management. 

Developed with a modern, fast client-side architecture using **Next.js 15 (App Router)** and a secure, scalable backend built on **ASP.NET Core 9 (Web API)**.

---

## 🌟 Key Features

### 🛍️ Client Storefront
* **Premium UX/UI**: Sleek, responsive layout featuring champagne gold highlights and smooth micro-animations.
* **Smart Shopping Cart**: Real-time sliding cart drawer, interactive wishlists, and smooth order checkout flow.
* **Customer Accounts**: Secure user profiles, dynamic profile editing, interactive order history tracking, and Google Login integration.
* **Direct Assistance**: Integrated float button for direct WhatsApp chat support.

### 👑 Admin Control Panel
* **Live Dashboard**: Instant business telemetry, system health stats, and detailed logs.
* **Advanced Product Manager**: Full CRUD capability with a tabbed interface for descriptions, pricing, and variants.
* **Real-time Stock Management**: Tracks inventory across three categories: **Total Stock** (on hand), **Reserved Stock** (pending checkout), and **Available Stock** (net sellable).
* **Printable Invoices**: Generates elegant invoice receipts directly in the browser.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Vanilla CSS |
| **Backend** | ASP.NET Core 9, C#, Web API, Entity Framework Core |
| **Database** | Microsoft SQL Server (LocalDB) |
| **Authentication** | JWT (JSON Web Tokens) & NextAuth.js (Google OAuth) |
| **Notifications** | SMTP Email Integration (Gmail client notifications & OTP Verification) |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
* [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
* [Node.js](https://nodejs.org/) (v18 or higher)
* [SQL Server LocalDB](https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/sql-server-express-localdb)

### 2. Backend Setup
1. Navigate to the `backend/` directory.
2. Update database connection settings in `appsettings.json` if necessary.
3. Run migrations and start the server:
   ```bash
   dotnet ef database update
   dotnet run
   ```
   *The server runs by default on `http://localhost:5165`.*

### 3. Frontend Setup
1. Navigate to the `frontend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The storefront will be live at `http://localhost:3000`.*
