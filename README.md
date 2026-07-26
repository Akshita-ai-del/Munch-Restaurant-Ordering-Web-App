# Munch — Restaurant Ordering PWA

A Progressive Web App (PWA) for The Yard Milkshake Bar, built with Next.js 14 frontend + Node.js/Express backend.

## Project Structure

```
web app/
├── frontend/   ← Next.js 14 App Router PWA
└── backend/    ← Node.js + Express + Prisma + Socket.io
```

## 🚀 Quick Start

### 1. Start the Backend
```bash
cd backend
npm install
npm run setup         # generates Prisma client, runs migrations, seeds DB
npm run dev           # starts on http://localhost:5000
```

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev           # starts on http://localhost:3000
```

Open **http://localhost:3000** in your browser.

## 🔑 Demo Login

| Email                | Password    | Role     |
|----------------------|-------------|----------|
| customer@demo.com    | password123 | Customer |
| staff@demo.com       | password123 | Staff    |
| rider@demo.com       | password123 | Rider    |
| admin@demo.com       | password123 | Admin    |

## 🎟 Promo Codes

| Code     | Discount  | Min Order |
|----------|-----------|-----------|
| MUNCH10  | 10% off   | $15       |
| YARD5    | $5 off    | $20       |

## Priority Tiers

| Priority | Feature          | Status   |
|----------|------------------|----------|
| P1       | Customer App     | ✅ Built  |
| P2       | QR Dine-In       | 🔧 Scaffold |
| P3       | Payments         | 🔧 Scaffold |
| P4       | Delivery & Map   | 🔧 Scaffold |
| P5       | POS              | 🔧 Scaffold |
| P6       | Admin            | 🔧 Scaffold |

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Vanilla CSS, next-pwa
- **Backend**: Node.js, Express, Socket.io, Prisma (SQLite→PostgreSQL)
- **Real-time**: Socket.io (order tracking, chat)
- **Auth**: JWT (email/password)
- **Payments**: Stripe test mode + Cash on Delivery

## Brand

Colors, typography, and visual identity based on [The Yard Milkshake Bar](https://theyardmilkshakebar.com).
- Primary: `#FF1F8E` (hot pink)
- Secondary: `#0A0A0A` (black)
- Background: `#FFF8F5` (cream)
- Font: Raleway
