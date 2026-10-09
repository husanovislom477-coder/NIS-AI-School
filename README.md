# 🎓 NIS AI School — Full-Stack Production Platform

Professional full-stack web platform for **NIS AI School** built with React, Vite, Node.js, Express, and PostgreSQL with Prisma ORM.

---

## 🌟 Key Features

* **High-Performance Architecture**: React 19 + Vite frontend paired with Node.js Express REST API.
* **Persistent Relational Database**: PostgreSQL powered by Prisma ORM with relational models, foreign keys, and indexes.
* **Security & Authentication**:
  * Secure JWT authentication and bcrypt password hashing.
  * **Remember Me** session persistence across browser restarts.
  * Role-Based Access Control (`USER`, `ADMIN`). Non-admins receive `403 Forbidden` on protected admin endpoints.
  * 2MFA security checkpoint for admin authentication.
* **Content Management & Public Sections**:
  * 🏢 **Branches**: Interactive campus profiles, coordinates, photos, and working hours.
  * 👨‍🏫 **Pedagogical Team**: Teacher profiles with universities (MIT, Stanford, Tsinghua, ETH), degrees, IELTS/SAT/HSK scores, and achievements.
  * 🏆 **Student Results**: Verified international and republican exam records (IOI, IAIO, IELTS 8.5+, SAT 1550+).
  * 🚀 **Student Projects & Startups**: Student research projects, startups, repositories, and demonstration links.
  * 📰 **News & Announcements**: Dynamic slug-based articles with publication states.
  * 📝 **Application & Enrollment System**: Online application submission with automated ID generation (`#NIS-XXXXXX`) and duplicate prevention.
* **Full-Featured Admin Dashboard**:
  * Real-time database metrics (Users, Branches, Teachers, Results, Projects, News, Applications).
  * Complete CRUD for all entities.
* **Multi-Language & Theme**: 10+ language switcher and customizable color themes with state persistence.

---

## 📁 Project Structure

```
NIS/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma ORM PostgreSQL schema
│   │   └── seed.js             # Database seeder (Admin, branches, teachers, results)
│   ├── src/
│   │   ├── config/             # Database and app configurations
│   │   ├── controllers/        # REST API controllers
│   │   ├── middleware/         # Auth, admin role check, upload & error handlers
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # Unified Prisma / DB data layer service
│   │   ├── utils/              # Helper utilities
│   │   └── server.js           # Server entry point
│   ├── uploads/                # File and image uploads directory
│   ├── .env.example            # Backend environment template
│   └── package.json
│
├── frontend/
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── api/                # Axios API client instances
│   │   ├── components/         # Reusable UI & layout components
│   │   ├── context/            # AuthContext & LanguageContext
│   │   ├── pages/              # Public pages & Admin management panels
│   │   ├── App.jsx             # React routing setup
│   │   └── main.jsx            # Frontend entry point
│   ├── .env.example            # Frontend environment template
│   ├── vercel.json             # Vercel SPA routing configuration
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
PORT=3001
NODE_ENV=production

# Database — PostgreSQL (Prisma ORM)
DATABASE_URL="postgresql://username:password@localhost:5432/nis_ai_school?schema=public"

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters
JWT_EXPIRES_IN=7d

# Initial Admin (Seed Script)
ADMIN_EMAIL=admin@nis-ai.edu.uz
ADMIN_PASSWORD=your_secure_admin_password

# CORS Allowed Origins
FRONTEND_URL=https://your-frontend.vercel.app,http://localhost:5173

# Server URL
BACKEND_URL=https://your-backend.railway.app

# Optional: Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Gemini AI Integration
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

### Frontend (`frontend/.env`)

```env
# Backend API Base URL
VITE_API_URL=http://localhost:3001/api

# App Metadata
VITE_APP_NAME=NIS AI School
VITE_APP_VERSION=1.0.0
```

---

## 🚀 Quick Start (Development)

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install --legacy-peer-deps

# Frontend
cd ../frontend
npm install
```

### 2. Database Setup & Seed

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Push Schema to PostgreSQL (if PostgreSQL is running)
npx prisma db push

# Seed Initial Admin, Branches, Teachers, Results, Projects, and News
npm run seed
```

### 3. Run Development Servers

```bash
# Terminal 1 — Start Backend API (Port 3001)
cd backend
npm run dev

# Terminal 2 — Start Frontend (Port 5173)
cd frontend
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Default Seed Accounts

* **Admin Account**:
  * Email: `admin@nis-ai.edu.uz`
  * Password: `NisAdmin2026!`
  * Role: `ADMIN`
  * 2MFA Master Bypass (Dev): `202601` or `749206` (or use the code shown on screen)
* **Student Account**:
  * Email: `student@nis-ai.edu.uz`
  * Password: `Student2026!`
  * Role: `USER`

---

## 🚢 Production Deployment

### 1. Database (PostgreSQL)
Create a managed PostgreSQL database on **Neon**, **Supabase**, **Railway**, **Render**, or **AWS RDS**:
1. Copy the connection string into `DATABASE_URL`.
2. Run database migration and seed:
   ```bash
   npx prisma db push
   npm run seed
   ```

### 2. Backend Hosting (Railway / Render / VPS)
1. Set the root directory to `backend`.
2. Set build command:
   ```bash
   npm install --legacy-peer-deps && npx prisma generate
   ```
3. Set start command:
   ```bash
   npm start
   ```
4. Configure environment variables from `backend/.env.example`.

### 3. Frontend Hosting (Vercel)
1. Import repository on [Vercel](https://vercel.com).
2. Set root directory to `frontend`.
3. Set framework preset to **Vite**.
4. Configure Environment Variable:
   * `VITE_API_URL`: URL of your deployed backend + `/api` (e.g., `https://api.yourdomain.com/api`).
5. Deploy. `vercel.json` will automatically handle SPA client-side routing.
