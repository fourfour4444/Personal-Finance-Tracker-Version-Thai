# Personal Finance Tracker Version Thai

Personal Finance Tracker is a full-stack personal finance management application built to demonstrate practical product engineering across the frontend, backend, and database layers. The project covers authenticated user flows, transaction and category management, dashboard reporting, and data visualization in a portfolio-ready format.

## Highlights

- Full-stack architecture with a React frontend and Express API
- JWT-based authentication flow
- CRUD operations for financial transactions
- Category-based organization for income and expenses
- Dashboard experience with summary cards and charts
- PostgreSQL data model managed through Prisma ORM

## Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Transactions
![Transactions](docs/screenshots/transactions.png)

### Add Transaction Modal
![Add Transaction Modal](docs/screenshots/add-transaction-modal.png)

### Login
![Login](docs/screenshots/login.png)

### Register
![Register](docs/screenshots/register.png)

## Business Context

This project is intended to showcase the ability to build and connect core application layers in a realistic workflow:

- user authentication and protected access
- relational data modeling
- API-driven frontend integration
- dashboard-oriented reporting UX
- local development workflow across frontend, backend, and PostgreSQL

## Core Features

- User registration and login with JWT authentication
- Protected routes and authenticated API access
- Create, edit, list, and delete transactions
- Support for default and custom categories
- Filtering, sorting, and pagination for transaction records
- Dashboard widgets and charts for:
  - total income
  - total expenses
  - current balance
  - expenses by category
  - monthly income versus expense comparison
  - recent transactions

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Axios
- Zustand
- Recharts

### Backend

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- JWT
- bcryptjs

## Project Structure

```text
finance-tracker/
|- client/
|  |- src/
|  |  |- assets/
|  |  |- components/
|  |  |- pages/
|  |  |- services/
|  |  |- store/
|  |  `- types/
|  |- package.json
|  `- vercel.json
|- docs/
|  `- screenshots/
|- server/
|  |- prisma/
|  |  |- migrations/
|  |  |- schema.prisma
|  |  `- seed.ts
|  |- src/
|  |  |- controllers/
|  |  |- middleware/
|  |  `- routes/
|  |- package.json
|  `- railway.toml
|- .env.example
|- package.json
`- README.md
```

## Local Setup

### Prerequisites

- Node.js 20+ recommended
- PostgreSQL
- npm

### Install dependencies

From the project root:

```bash
npm run install:all
```

Or install each application separately:

```bash
cd server && npm install
cd ../client && npm install
```

### Environment variables

The repository includes a root `.env.example` as a reference template. For local development, create `server/.env`.

PowerShell:

```powershell
cd server
Copy-Item ..\.env.example .env
```

Required values in `server/.env`:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/finance_tracker
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173
```

Recommended local setup:

- keep the environment file at `server/.env`
- keep `CLIENT_URL` set to `http://localhost:5173`
- open the frontend through `http://localhost:5173`

### Database setup

Run Prisma migration:

```bash
cd server
npm run prisma:migrate
```

Seed default categories:

```bash
npm run prisma:seed
```

Generate Prisma client if needed:

```bash
npm run prisma:generate
```

## Running the Application

### Recommended approach

Terminal 1:

```bash
cd server
npm run dev
```

Terminal 2:

```bash
cd client
npm run dev
```

Open:

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:3000/api/health`

### Root shortcut

```bash
npm run dev
```

This root script opens separate Windows `cmd` windows for the frontend and backend.

## Available Scripts

### Root

- `npm run install:all` - install dependencies for both apps
- `npm run dev` - start server and client in separate windows
- `npm run dev:server` - start only the backend
- `npm run dev:client` - start only the frontend

### Server

- `npm run dev` - start the API in development mode
- `npm run build` - compile TypeScript
- `npm run start` - run the compiled server from `dist`
- `npm run prisma:generate` - generate Prisma client
- `npm run prisma:migrate` - run development migrations
- `npm run prisma:seed` - seed default categories

### Client

- `npm run dev` - start the Vite development server
- `npm run build` - build production assets
- `npm run preview` - preview the production build locally

## API Summary

Base URL:

```text
http://localhost:3000/api
```

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /auth/me`

### Categories

- `GET /categories`
- `POST /categories`
- `DELETE /categories/:id`

### Transactions

- `GET /transactions`
- `GET /transactions/summary`
- `POST /transactions`
- `PUT /transactions/:id`
- `DELETE /transactions/:id`

### Health Check

- `GET /health`

## Deployment

### Frontend

- configured for Vercel via `client/vercel.json`
- build command: `npm run build`
- output directory: `dist`

### Backend

- configured for Railway via `server/railway.toml`
- start command: `npm run start`

### Production notes

- set `CLIENT_URL` on the backend to the deployed frontend origin
- set `VITE_API_URL` on the frontend to the deployed backend API URL if frontend hosting environment variables are used
- run Prisma migrations in the production environment before first use

## Portfolio Positioning

This project is suitable for presenting:

- full-stack application architecture
- authenticated product flow design
- CRUD operations on relational business data
- dashboard-driven reporting UX
- practical local development setup across frontend, backend, and database layers

## Current Gaps

- no automated test suite is configured yet
- no lint script is configured yet
- local development currently assumes a stable frontend origin at `http://localhost:5173`

## License

This project currently does not declare a license. Add a `LICENSE` file before publishing or distributing it externally.
