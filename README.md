# Customer Order Management System (COMS)

<p align="center">
  <img src="https://img.shields.io/github/license/Hakorimanasharif/coms?style=flat-square" alt="License">
  <img src="https://img.shields.io/github/repo-size/Hakorimanasharif/coms?style=flat-square" alt="Repo Size">
  <img src="https://img.shields.io/github/languages/top/Hakorimanasharif/coms?style=flat-square" alt="Top Language">
  <img src="https://img.shields.io/github/last-commit/Hakorimanasharif/coms?style=flat-square" alt="Last Commit">
  <img src="https://img.shields.io/github/stars/Hakorimanasharif/coms?style=flat-square&logo=github" alt="Stars">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs Welcome">
</p>

Full-stack web application for DAB Enterprise Ltd to manage customer orders, payments, and generate reports.

## Prerequisites

- **Node.js** v18+ 
- **MongoDB** running locally on port 27017
- **npm**

## Project Structure

```
├── backend-project/        # Node.js + Express API
│   ├── server.js           # Entry point
│   ├── config/db.js        # MongoDB connection
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   └── middleware/         # Auth middleware
│
└── frontend-project/       # React + Vite + Tailwind CSS
    └── src/
        ├── pages/          # Page components
        ├── components/     # Shared components
        ├── api/            # Axios config
        └── utils/          # Validation helpers
```

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/Hakorimanasharif/coms.git
cd coms
```

### 2. Set up the backend

```bash
cd backend-project
cp .env.example .env          # Create environment file
npm install                   # Install dependencies
npm run seed                  # Create default admin user
npm start                     # Start server on port 5001
```

### 3. Set up the frontend (new terminal)

```bash
cd frontend-project
npm install                   # Install dependencies
npm run dev                   # Start dev server on port 5173
```

### 4. Open in browser

Visit **http://localhost:5173**

### Default Login

- **Username:** `admin`
- **Password:** `Admin@1234`

Or create a new account from the Sign Up page.

## Features

- **Dashboard** — Overview stats (customers, orders, revenue, payments)
- **Customers** — Add and view customers
- **Orders** — Create orders with auto-calculated totals
- **Payments** — Full CRUD, record payments against orders
- **Reports** — Daily orders report + Payment status report with PDF download
- **Authentication** — Session-based login with encrypted passwords
- **Responsive** — Sidebar layout with mobile support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | express-session, bcryptjs |
| PDF | jsPDF with jspdf-autotable |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |
| GET/POST | `/api/customers` | List / Create customers |
| GET/POST | `/api/orders` | List / Create orders |
| GET/POST/PUT/DELETE | `/api/payments` | Full CRUD payments |
| GET | `/api/reports/dashboard` | Dashboard stats |
| GET | `/api/reports/daily-orders` | Daily orders report |
| GET | `/api/reports/payment-status` | Payment status report |

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Developer:** [Hakorimana Sharif](https://github.com/Hakorimanasharif)

<p align="center">
  Made with ❤️ in Rwanda
</p>
