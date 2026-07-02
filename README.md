# College OD & Attendance Manager 📚🎓

A cozy, soft-themed, student-focused web application built with **React, TypeScript, Tailwind CSS, Recharts, and Supabase**. It helps college students manage their On Duty (OD) records, attendance percentages, and bunk predictions, featuring mock automatic syncing simulation from the **aims.rkmvc.ac.in** portal.

---

## 🎨 Theme & Vibe
Designed to feel warm, inviting, and calming rather than corporate.
- **Color Palette:** Soft Lavender, Pastel Blue, Mint Green, Cream, Peach, and Light Beige.
- **Styling Details:** Soft glassmorphism, comfortable typography (Nunito & Poppins), and large rounded corners (`16px` to `24px`).
- **Demo Workspace Fallback:** Runs automatically using local storage mock databases if Supabase variables are unconfigured.

---

## 🚀 Key Features

1. **User Authentication:** 
   - Secure login & registration (Name, Register No, Department, Semester, Section).
   - Powered by Supabase Auth (with local database simulation fallback).
2. **Interactive Dashboard:**
   - Display aggregate statistics: Attendance level, classes conducted/attended, OD usages, and allowable bunk limits.
   - Dynamic threshold alerts when attendance drops below target levels.
3. **Attendance Tracker & Bunk Advisor:**
   - Subject-wise progress grids with quick increment (`+ Attended` / `+ Missed`) buttons.
   - Dynamic math simulator calculating exactly how many classes can be safely skipped or how many consecutive lectures must be attended.
4. **On-Duty (OD) Management:**
   - Add/edit/delete OD requests with date, faculty in-charge, reasons, and mockup attachment links.
   - Status indicators (Pending, Approved, Rejected) with built-in status simulation controls.
5. **Secure Portal Syncing:**
   - Simulates securely connecting and retrieving attendance metrics from [aims.rkmvc.ac.in](https://aims.rkmvc.ac.in).
   - Detailed loading stages showing connection, credentials transmission, scraping, parsing, and database storage.
6. **Detailed Analytics (Recharts):**
   - Course Standing Charts (with 75% reference target boundaries).
   - Weekly Combined Attendance Trend lines.
   - OD Status share pie charts.
   - Radial Course Balance radars.

---

## 🛠️ Tech Stack
- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **Backend/DB:** Supabase (PostgreSQL with RLS & Triggers)
- **Hosting:** Netlify

---

## 📂 Project Structure
```text
├── supabase/
│   └── schema.sql          # DB initialization SQL script
├── src/
│   ├── components/
│   │   ├── AuthView.tsx        # Register & Login coziness
│   │   ├── Navbar.tsx          # Mobile bottom-nav & Desktop sidebar
│   │   ├── DashboardView.tsx   # Dashboard cards & activities
│   │   ├── AttendanceView.tsx  # Course manager & modifiers
│   │   ├── BunkCalculator.tsx  # Dynamic skiadvisor mathematics
│   │   ├── SyncStatus.tsx      # AIMS Portal auth & progress stages
│   │   ├── OdView.tsx          # OD lists & approval simulator
│   │   └── AnalyticsView.tsx   # Recharts charts container
│   ├── lib/
│   │   └── supabase.ts         # Supabase client instantiation
│   ├── services/
│   │   ├── db.ts               # Universal DB layer with offline mock engine
│   │   └── portalSync.ts       # Portal scraping steps & reference lambda code
│   ├── types/
│   │   └── index.ts            # Type structures
│   ├── App.tsx                 # View navigation router & state manager
│   ├── index.css               # Cozy custom scrollbars & glassmorphism
│   └── main.tsx                # React renderer
├── .env.example                # Variable setup instructions
├── netlify.toml                # Netlify SPA redirects config
└── package.json
```

---

## ⚙️ Installation & Setup

### 1. Clone the project and install dependencies
```bash
# Install packages
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Supabase credentials:
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```
*Note: If these credentials are left blank, the app will gracefully run in **Demo Workspace Mode** using localStorage, enabling full testing features immediately.*

### 3. Database Schema Setup
Execute the contents of `supabase/schema.sql` inside your Supabase SQL Editor. This script creates:
- `public.users`, `public.attendance`, `public.od_records`, and `public.sync_logs` tables.
- RLS Policies restricting data access to owners (`auth.uid() = user_id`).
- PostgreSQL triggers to create a public profile on Auth SignUp and auto-recalculate course percentages.

### 4. Running locally
Run the Vite development server using the following:
```bash
# Bypasses execution policies in Windows if npm.ps1 fails:
npm.cmd run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production
To bundle the project for deployment:
```bash
npm.cmd run build
```

---

## 🌐 Netlify Deployment
This project is configured for one-click deployment on Netlify:
1. Connect your repository to Netlify.
2. Netlify will detect the `netlify.toml` file automatically.
3. Configure the environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Netlify dashboard under **Site Configuration -> Environment Variables**.
4. Deploy!
