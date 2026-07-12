# TransitOps Transport ERP

TransitOps is a production-quality, enterprise-grade Transport Enterprise Resource Planning (ERP) application developed for Odoo Hackathon 2026. It enables complete operations management for fleets, including vehicles, drivers, trip dispatches, maintenance logging, fuel tracking, finance expenses, live analytics charts, and compliance AI fleet insights.

---

## Technical Stack

### Frontend
- **Framework**: React (Vite)
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod schema validations
- **Visuals**: Recharts (Interactive SVG Charts) and Lucide Icons
- **Design System**: Shadcn/ui & TailwindCSS (Dark ERP mockup theme)

### Backend
- **Platform**: Node.js & Express
- **Database**: PostgreSQL (Neon Cloud for dev, Render in production)
- **ORM**: Prisma ORM
- **Authentication**: JWT & Bcrypt password hashing
- **Input Validation**: Zod middleware

---

## Folder Structure

```
TransitOps/
├── backend/
│   ├── prisma/             # Schema, migrations & database seeds
│   └── src/
│       ├── config/         # Database and server configs
│       ├── controllers/    # Express controllers
│       ├── middlewares/    # Auth, error, and validation middlewares
│       ├── repositories/   # Prisma query layers (abstraction)
│       ├── routes/         # Express endpoint definitions
│       ├── services/       # Core business logic and rules
│       ├── utils/          # Standard success/error responses
│       └── validators/     # Zod input schemas
├── frontend/
│   ├── src/
│   │   ├── components/     # Topbar, Sidebar, Dialog modals, notifications dropdown
│   │   ├── hooks/          # Auth state and toast utilities
│   │   ├── pages/          # Dashboard, Vehicles, Drivers, Trips, Maintenance, Fuel, Expenses, Settings, Analytics, AIInsights
│   │   └── services/       # Axios API client functions
│   └── index.html
├── render.yaml             # Blueprint deployment definition
└── README.md
```

---

## Installation & Setup

### Prerequisites
1. **Node.js** (v18 or higher recommended)
2. **PostgreSQL** (either a local instance or cloud service like Neon.tech)

### Database Setup
1. Define the PostgreSQL connection string in the backend environment.
2. In the `backend` folder, run migrations to sync the schema:
   ```bash
   npx prisma migrate dev
   ```
3. Seed the initial ERP dataset (users, vehicles, drivers, maintenance, refuels, and notifications):
   ```bash
   npx prisma db seed
   ```

### Running Locally

#### 1. Backend Server
```bash
cd backend
npm install
npm run dev
```
The server will boot and run on `http://localhost:5000` (or the customized port configured in `.env`).

#### 2. Frontend Client
```bash
cd frontend
npm install
npm run dev
```
The application will run locally on `http://localhost:5173/`.

---

## Environment Variables

### Backend Configuration (`backend/.env`)
```ini
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
JWT_SECRET=transitops-super-secret-jwt-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=AIzaSy... (Optional, for Gemini insights)
```

---

## API Endpoint Overview

### 1. Operations CRUD Modules
- **Authentication**: `POST /api/auth/login`, `/api/auth/profile`
- **Vehicles**: `/api/vehicles` (GET, POST, PUT, DELETE)
- **Drivers**: `/api/drivers` (GET, POST, PUT, DELETE)
- **Trips**: `/api/trips` (GET, POST, PUT, DELETE)
- **Maintenance**: `/api/maintenances` (GET, POST, PUT, DELETE)
- **Fuel Logs**: `/api/fuel-logs` (GET, POST, PUT, DELETE)
- **Expenses**: `/api/expenses` (GET, POST, PUT, DELETE)

### 2. Operational Transitions
- **Dispatch Trip**: `POST /api/trips/:id/dispatch`
- **Complete Trip**: `POST /api/trips/:id/complete`
- **Cancel Trip**: `POST /api/trips/:id/cancel`
- **System Alerts**: `GET /api/notifications`, `POST /api/notifications/mark-all-read`, `PUT /api/notifications/:id/read`
- **AI Analytics**: `GET /api/ai/insights`
- **Dashboard Stats**: `GET /api/dashboard/stats`

---

## Production Deployment
The project is configured for one-click blueprint deployments on Render via [render.yaml](file:///c:/Users/naras/OneDrive/Desktop/transitops-transport-erp/render.yaml). Simply link the repository, configure variables, and deploy.
