# 🚗 EZpark — Smart Parking Management System

A full-stack parking management web app built with **ReactJS**, **Node.js (Express)**, and **MongoDB**.  
Responsive design using **Bootstrap 5** — works on mobile, tablet, laptop, and desktop.

---

## 🗂 Project Structure

```
EZpark/
├── backend/               Node.js + Express API
│   ├── config/db.js
│   ├── controllers/       authController, userController, slotController, bookingController, adminController
│   ├── models/            User, ParkingSlot, Booking, Payment
│   ├── routes/            authRoutes, userRoutes, slotRoutes, bookingRoutes, adminRoutes
│   ├── middleware/        authMiddleware, roleMiddleware
│   ├── utils/             calculatePrice
│   ├── server.js
│   └── .env
│
├── frontend/              ReactJS app
│   └── src/
│       ├── components/    Navbar, Footer, SlotCard, ProtectedRoute
│       ├── pages/         Home, Login, Register, ForgotPassword, Slots, Booking,
│       │                  Checkout, BookingSuccess, Dashboard, Profile, MyBookings, AdminDashboard
│       ├── services/      api.js (Axios)
│       └── utils/         auth.js
│
└── seedAdmin.js           Script to seed admin & demo user
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)

### 2. Clone & Install

```bash
# Install backend dependencies
cd EZpark/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Configure Environment

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ezpark
JWT_SECRET=ezpark_super_secret_jwt_key_2024
JWT_EXPIRE=7d
NODE_ENV=development
```

### 4. Seed Admin & Demo User

```bash
# From root EZpark/ folder
node seedAdmin.js
```

This creates:
- **Admin**: admin@ezpark.com / admin123
- **User**: user@ezpark.com / user123

### 5. Run the App

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm start
```

Open: **http://localhost:3000**

---

## 🔑 Features

### 👤 User
- Register, Login, Forgot Password
- Browse real-time parking slots with filters (type, availability)
- Book a slot with custom date/time range
- Pay via card, UPI, netbanking, or wallet (simulated)
- View, track and cancel bookings
- Update profile and change password

### 🛡 Admin
- Dashboard with live stats (users, slots, bookings, revenue)
- Manage all bookings — update status
- CRUD for parking slots (create, edit, delete)
- Seed 30 demo parking slots instantly
- View and delete users

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET  | /api/auth/me | Get current user |
| POST | /api/auth/forgot-password | Request reset token |
| POST | /api/auth/reset-password | Reset password |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | /api/users/profile | Get profile |
| PUT  | /api/users/profile | Update profile |
| PUT  | /api/users/change-password | Change password |

### Slots
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | /api/slots | Get all slots (supports ?type=ev&isAvailable=true) |
| GET  | /api/slots/:id | Get single slot |
| POST | /api/slots | Create slot (admin) |
| PUT  | /api/slots/:id | Update slot (admin) |
| DELETE | /api/slots/:id | Delete slot (admin) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/bookings | Create booking |
| GET  | /api/bookings/my | Get user's bookings |
| GET  | /api/bookings/:id | Get single booking |
| PUT  | /api/bookings/:id/cancel | Cancel booking |
| POST | /api/bookings/:id/pay | Process payment |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | /api/admin/stats | Dashboard statistics |
| GET  | /api/admin/users | All users |
| DELETE | /api/admin/users/:id | Delete user |
| GET  | /api/admin/bookings | All bookings |
| PUT  | /api/admin/bookings/:id | Update booking status |
| POST | /api/admin/seed-slots | Seed 30 demo slots |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Bootstrap 5, React Bootstrap |
| Backend | Node.js, Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) |
| Styling | Bootstrap 5 + Custom CSS (dark theme) |
| Icons | React Icons (Feather) |
| Notifications | React Toastify |

---

## 📱 Responsive Breakpoints
- **Mobile** (< 576px) — stacked layout, hamburger nav
- **Tablet** (576–992px) — 2-column grids
- **Desktop** (> 992px) — full layout with sidebars

---

## 🔐 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ezpark.com | admin123 |
| User | user@ezpark.com | user123 |

> Run `node seedAdmin.js` from project root to create these accounts.