# Hardhat Workforce

A full-stack workforce and project management platform for construction and maintenance companies.

## Features

- **Multi-role authentication** — Separate login/registration for Administrators, Customers, Workers, and Suppliers
- **Role-based access control** — Each role sees only their authorized dashboard and features
- **Project workflow** — Complete lifecycle from service request to project completion
- **Admin dashboard** — Project, survey, workforce, supplier, and customer management with analytics
- **Customer portal** — Submit requests, upload site photos, review quotations, track progress
- **Worker portal** — Profile management, job browsing, assignment acceptance, progress updates
- **Supplier portal** — Purchase order management, stock confirmation, delivery tracking
- **Notifications** — Real-time alerts for all platform events
- **Messaging** — Direct communication between customers and administrators

## Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS 4, Recharts
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** SQLite (development) — easily switchable to PostgreSQL
- **Auth:** JWT sessions with HTTP-only cookies

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate Prisma client and push schema
npm run db:push

# Seed demo data
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Accounts

| Role     | Email                          | Password     |
|----------|--------------------------------|--------------|
| Admin    | admin@hardhatworkforce.com     | admin123     |
| Customer | customer@example.com           | customer123  |
| Worker   | worker@example.com             | worker123    |
| Supplier | supplier@example.com           | supplier123  |

## Project Structure

```
src/
├── app/
│   ├── api/              # REST API endpoints
│   ├── dashboard/        # Role-based dashboards
│   ├── login/            # Login pages per role
│   ├── register/         # Registration pages per role
│   └── page.tsx          # Landing page
├── components/
│   ├── auth/             # Authentication forms
│   ├── charts/           # Analytics charts
│   ├── layout/           # Dashboard layout
│   └── ui/               # Reusable UI components
├── lib/
│   ├── auth.ts           # JWT auth utilities
│   ├── db.ts             # Prisma client
│   └── utils.ts          # Helpers and constants
└── middleware.ts          # Route protection & RBAC
prisma/
├── schema.prisma         # Database schema
└── seed.ts               # Demo data seeder
```

## Database Schema

Tables: Users, Customers, Workers, Suppliers, Projects, Surveys, Quotations, Materials, Purchase Orders, Project Assignments, Notifications, Messages

## API Endpoints

| Method | Endpoint              | Description                    |
|--------|-----------------------|--------------------------------|
| POST   | /api/auth/login       | User login                     |
| POST   | /api/auth/register    | User registration              |
| POST   | /api/auth/logout      | User logout                    |
| GET    | /api/projects         | List projects                  |
| POST   | /api/projects         | Create project                 |
| GET    | /api/projects/[id]    | Get project details            |
| PATCH  | /api/projects/[id]    | Update project                 |
| GET    | /api/surveys          | List surveys                   |
| POST   | /api/surveys          | Create survey                  |
| GET    | /api/quotations       | List quotations                |
| POST   | /api/quotations       | Create quotation               |
| PATCH  | /api/quotations       | Update quotation status        |
| GET    | /api/workers          | List workers                   |
| PATCH  | /api/workers          | Update worker status/profile   |
| GET    | /api/customers        | List customers                 |
| GET    | /api/suppliers        | List suppliers                 |
| GET    | /api/purchase-orders  | List purchase orders           |
| POST   | /api/purchase-orders  | Create purchase order          |
| PATCH  | /api/purchase-orders  | Update order status            |
| GET    | /api/assignments      | List assignments               |
| POST   | /api/assignments      | Create assignment              |
| PATCH  | /api/assignments      | Update assignment              |
| GET    | /api/notifications    | List notifications             |
| GET    | /api/messages         | List messages                  |
| POST   | /api/messages         | Send message                   |
| POST   | /api/upload           | Upload images                  |
| GET    | /api/analytics        | Dashboard analytics            |

## Production Deployment

1. Set `DATABASE_URL` to a PostgreSQL connection string
2. Change `JWT_SECRET` to a secure random string
3. Set `NEXT_PUBLIC_APP_URL` to your production URL
4. Run `npm run build && npm start`

## License

Private — All rights reserved.
