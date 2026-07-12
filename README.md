# 🚛 TransitOps – Smart Transport Operations Platform

## Odoo Hackathon 2026 Submission

TransitOps is a full-stack Transport Operations Platform developed for the **Odoo Hackathon 2026**.

The application digitizes transport operations by providing a centralized platform to manage vehicles, drivers, trip dispatches, maintenance logging, fuel tracking, operational expenses, authentication with role-based access control, and live operational analytics.

The system follows the official hackathon problem statement and enforces real-world business rules to improve fleet efficiency, operational visibility, and compliance.

---

# Problem Statement

Many logistics companies still rely on spreadsheets and manual records to manage transport operations, leading to:

- Scheduling conflicts
- Vehicle underutilization
- Missed maintenance
- Expired driver licenses
- Inaccurate fuel and expense tracking
- Limited operational visibility

TransitOps addresses these challenges by providing a centralized web application that manages the complete transport lifecycle.

---

# Team

**Odoo Hackathon 2026**

Team Members & Core Contributions:

- **Narasimha** (Role: Full-Stack Developer - Frontend Integration & Backend Security Architecture)
- **Pravallika** (Role: Backend & DB Developer - Prisma ORM, Database Migrations, and Business Logic Rules)
- **Mani** (Role: Frontend Developer - Interactive Dashboards, Charts, Forms & State Management)
- **Akhila** (Role: Quality Assurance & Testing - Deployment Configurations, Automated Validation & Manual Checks)

---

# Key Features

## Authentication & Security

- **Secure JWT Authentication**: Stateless session management with tokens.
- **Password Encryption**: Password hashing using Bcrypt.
- **Role-Based Access Control (RBAC)**: Strict permission matrix applied at the UI level and enforced via middleware at the API level (Fleet Manager, Driver/Dispatcher, Safety Officer, Financial Analyst).
- **Account Lockout Policy**: Auto-locks accounts for 15 minutes after 5 consecutive incorrect password entries.
- **Protected Routes**: Navigation guards restricting unauthorized access.

---

## Fleet Management

- Vehicle Registration
- Vehicle Status Management (AVAILABLE, ON_TRIP, IN_SHOP, RETIRED)
- Vehicle Lifecycle Tracking
- Vehicle Availability
- Vehicle Capacity Validation

---

## Driver Management

- Driver Profiles
- License Tracking & Expiry Monitoring
- Safety Score Management
- Driver Availability

---

## Trip Management

- Create Trips
- Vehicle & Driver Assignment
- Dispatch Trips
- Complete Trips (auto-restores driver/vehicle availability)
- Cancel Trips
- Automatic Status Updates

---

## Maintenance

- Create Maintenance Logs
- Automatic Vehicle Status Updates (moves to "In Shop")
- Maintenance History
- Vehicle Availability Control on completion

---

## Fuel & Expense Management

- **Fuel Logbook**: Track refuel dates, liters, price per liter, and odometer readings.
- **Trip Expense Integration**: Automatically logs corresponding trip expenses whenever a fuel entry is added with an associated trip.
- **Operational Cost Monitoring**: Track operational expenses (Toll, Food, Repair, Parking, Miscellaneous) against active trips.

---

## Dashboard

- Live KPIs
- Fleet Utilization
- Active & Pending Trips
- Vehicle Availability
- Drivers on Duty
- Operational Statistics

---

## Reports & Analytics

- Fuel Efficiency
- Fleet Utilization
- Operational Cost
- Vehicle ROI
- Interactive Charts
- CSV Export
- AI Fleet Insights

---

# Business Rules Implemented

✔ Vehicle Registration Number must be unique

✔ Retired or In-Shop vehicles cannot be dispatched

✔ Drivers with expired licenses cannot be assigned

✔ Suspended drivers cannot be assigned

✔ Vehicles already on a trip cannot be reassigned

✔ Drivers already on a trip cannot be reassigned

✔ Cargo weight validation against vehicle capacity

✔ Dispatch automatically updates Vehicle and Driver status

✔ Trip completion restores Vehicle and Driver availability

✔ Trip cancellation restores availability

✔ Maintenance automatically moves vehicle to "In Shop"

✔ Closing maintenance restores vehicle availability

---

# User Roles

## Fleet Manager
- Full management over **Vehicles**, **Drivers**, and **Maintenance**.
- Access to Operational Dashboard and settings.

## Driver (Dispatcher)
- Exclusively manages **Trips** operations (Create, Dispatch, Complete, Cancel).
- Holds read-only API access to vehicles/drivers solely for assignment dropdowns.

## Safety Officer
- Exclusively manages **Driver Compliance** (License monitoring, Safety Score updates, and Safety Dashboard).

## Financial Analyst
- Manages **Fuel Logs**, **Expenses**, **Analytics (Profitability)**, and holds read-only API access to **Maintenance** costs.
- Completely hidden from vehicles, drivers, and trips.

---

# Technology Stack

## Frontend

- React (Vite)
- React Router
- TanStack Query
- React Hook Form
- Zod
- Tailwind CSS
- shadcn/ui
- Recharts
- Lucide Icons

---

## Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL (Neon)
- JWT Authentication
- Bcrypt
- Zod Validation

---

# Project Structure

```
TransitOps
│
├── backend
│   ├── prisma
│   └── src
│       ├── controllers
│       ├── repositories
│       ├── services
│       ├── routes
│       ├── middlewares
│       ├── validators
│       └── config
│
├── frontend
│   └── src
│       ├── components
│       ├── pages
│       ├── hooks
│       ├── services
│       └── layouts
│
└── render.yaml
```

---

# Installation

## Clone Repository

```bash
git clone <repository-url>
cd TransitOps
```

---

## Backend Setup

Create `backend/.env` file with the environment variables listed below, then run:

```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

# Environment Variables

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
```

---

# Main API Modules

- **Authentication**: Login, Register, Profile (`GET /api/auth/me`), Change/Reset password
- **Vehicles**: `/api/vehicles` (GET, POST, PUT, DELETE)
- **Drivers**: `/api/drivers` (GET, POST, PUT, DELETE)
- **Trips**: `/api/trips` (GET, POST, PUT, DELETE, plus `/dispatch`, `/complete`, `/cancel` transition endpoints)
- **Maintenance**: `/api/maintenances` (GET, POST, PUT, DELETE)
- **Fuel Logs**: `/api/fuel-logs` (GET, POST, PUT, DELETE)
- **Expenses**: `/api/expenses` (GET, POST, PUT, DELETE)
- **Dashboard**: `/api/dashboard/stats`
- **Notifications**: System Alerts & unread counts
- **AI Insights**: Gemini-powered AI analytics

---

# Deployment

The project is configured for deployment on **Render** using **Blueprint Deployments** (`render.yaml`).

Deployment includes:
- Frontend (Static site)
- Backend (Web service)
- PostgreSQL Database
- Automatic database migrations execution (`npx prisma migrate deploy`)

---

# Acknowledgement

This project was developed as part of the **Odoo Hackathon 2026**, following the official Smart Transport Operations Platform problem statement. The solution demonstrates transport lifecycle management, business rule enforcement, role-based access control, and operational analytics in a modern full-stack web application.
