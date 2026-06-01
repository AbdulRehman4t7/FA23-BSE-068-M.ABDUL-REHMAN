# Doctor Hub

Production-grade healthcare consultation platform built with the MERN stack.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Vite, Tailwind CSS v4, Framer Motion, React Router v6, Axios, React Hook Form + Zod |
| Backend | Node.js, Express.js, MongoDB, Mongoose, JWT (HTTP-only cookies), Multer, Helmet |
| Auth | Access + refresh tokens, bcrypt, role-based access control |

## Project Structure

```
DOCTOR HUB/
├── backend/          # REST API
│   ├── config/       # DB, Multer
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── seed.js
│   └── server.js
└── frontend/         # React SPA
    └── src/
        ├── components/
        ├── pages/
        ├── context/
        ├── hooks/
        └── utils/
```

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set MONGODB_URI, JWT secrets, CLIENT_URL
npm install
npm run seed    # optional demo data
npm run dev
```

API runs at `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App runs at `http://localhost:5173` (proxies `/api` to backend)

## Demo Accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Patient | patient@doctorhub.com | Password@123 |
| Doctor | doctor@doctorhub.com | Password@123 |
| Assistant | assistant@doctorhub.com | Password@123 |
| Admin | admin@doctorhub.com | Password@123 |
| Super Admin | superadmin@doctorhub.com | Password@123 |

## API Overview

### Auth
- `POST /api/auth/register` — Register (patient/doctor)
- `POST /api/auth/login` — Login (sets HTTP-only cookies)
- `POST /api/auth/logout` — Logout
- `POST /api/auth/refresh-token` — Refresh access token
- `GET /api/auth/me` — Current user
- `PUT /api/auth/profile` — Update profile
- `PUT /api/auth/change-password` — Change password
- `POST /api/auth/forgot-password` — Request reset email
- `POST /api/auth/reset-password/:token` — Reset password

### Doctors
- `GET /api/doctors?disease=&type=&city=&rating=&page=` — Search
- `GET /api/doctors/:id` — Profile
- `PUT /api/doctors/:id` — Update (doctor)
- `GET /api/doctors/:id/schedule` — Schedule

### Appointments
- `POST /api/appointments` — Book (patient)
- `GET /api/appointments` — List (role-filtered)
- `PATCH /api/appointments/:id/status` — Update status
- `DELETE /api/appointments/:id` — Cancel (patient, pending only)

### Payments
- `POST /api/payments` — Upload screenshot (multipart)
- `GET /api/payments/pending` — Assistant queue
- `PATCH /api/payments/:id/verify` — Verify/reject

### Medical History
- `GET /api/history/:patientId` — View history
- `POST /api/history/:patientId` — Add record (doctor only)
- No PUT/DELETE — immutability enforced

### Prescriptions
- `POST /api/prescriptions` — Create (doctor)
- `GET /api/prescriptions/patient` — Patient list
- Locked automatically after 24 hours

### Clinics
- `POST /api/clinics` — Create
- `GET /api/clinics/:doctorId` — List by doctor
- `PUT /api/clinics/:id` — Update
- `POST /api/clinics/:id/assistants` — Add assistant

### Admin
- `GET /api/admin/users` — All users
- `PATCH /api/admin/users/:id/status` — Approve/suspend
- `GET /api/admin/stats` — Analytics
- `GET /api/admin/audit-logs` — Super admin only

## Environment Variables

See `backend/.env.example` and `frontend/.env.example`.

## Security Features

- Helmet.js HTTP headers
- Rate limiting on auth routes (5 req / 15 min)
- express-mongo-sanitize
- JWT in HTTP-only cookies
- Role-based middleware
- Image-only uploads (5MB max)
- Immutable medical history

## License

MIT
