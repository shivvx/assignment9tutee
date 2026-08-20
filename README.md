# Gatekeeper OS - Visitor Pass Management System (MERN)

A modern, secure Visitor Pass Management System built using the MERN stack (MongoDB, Express, React, Node.js). This application digits manual visitor registers, enabling online pre-registration, email/SMS mock notifications, OTP validations, web camera photo captures, scannable QR passes, and downloadable PDF badges.

## Key Features

1. **Role-Based Authentication & Access Control (RBAC):**
   * **Admin:** System control, staff registration, and visual charts analytics.
   * **Security/Frontdesk:** QR scans or manual code pass check-in/out, active visitor monitoring, and instant walk-in pass generation.
   * **Employee/Host:** Pre-registration approval/rejection panel.
   * **Visitor:** Online self pre-registration, OTP verification, and scannable digital badge download.
2. **OTP-Based Verification:** Verification code generated during pre-registration to authenticate visitor phone numbers.
3. **Web Camera Captures:** Dynamic camera capture component for visitor badges with a Canvas fallback portrait generator.
4. **Scannable QR Pass & PDF Badges:** QR codes generated in base64 on-the-fly, combined with detailed visitor details into a printable A6 PDF badge streamed using `pdfkit`.
5. **Analytics Dashboard:** Visual representation of weekly entry statistics and reason distributions built using custom lightweight SVG charts.
6. **Plug & Play Database Auto-Seeding:** If local MongoDB is not running, the backend automatically spins up a local in-memory database server (`mongodb-memory-server`) and populates it with rich dummy entries.

---

## Project Structure

```
assignment9/
├── backend/                  # Node.js + Express + Mongoose
│   ├── config/               # Database connection + memory fallback config
│   ├── middleware/           # JWT auth and RBAC middlewares
│   ├── models/               # MongoDB models (User, Appointment, Pass, CheckLog)
│   ├── routes/               # API endpoints
│   ├── scripts/              # DB Seeding logic
│   └── server.js             # Entry server file
├── frontend/                 # Vite + React
│   ├── src/
│   │   ├── components/       # Reusable UI (Sidebar, QrScanner)
│   │   ├── context/          # State management (AuthContext)
│   │   ├── pages/            # Core views (Login, Dashboard, PreRegister, etc.)
│   │   ├── App.jsx           # Client router
│   │   └── index.css         # Custom styling sheet
└── package.json              # Root project running scripts
```

---

## Setup & Running Guide

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm** (comes with Node.js)
* *Optional:* A running local MongoDB instance on port `27017` (If not present, the system will seamlessly run using its own embedded in-memory MongoDB).

### Step 1: Clone and Install Dependencies
Install all backend and frontend packages with the root script:
```bash
npm run install-all
```

### Step 2: Running the Application
Launch both the Express API server and the React Vite dev server concurrently:
```bash
npm start
```

* **API Server Address:** `http://localhost:5001`
* **Web Portal Address:** `http://localhost:5174`

---

## Seed Accounts (Quick Testing)

The database is automatically pre-populated with these test accounts when launched for the first time. You can click on the quick-fill badges on the login screen to fill them instantly:

| Role | Email Address | Password | Purpose / Features |
|---|---|---|---|
| **Admin** | `admin@gatekeeper.com` | `password123` | Analytics dashboard, check logs audit, staff register. |
| **Security** | `security@gatekeeper.com` | `password123` | Issue direct passes, web camera scan check-in/out. |
| **Host (Employee)** | `amit@gatekeeper.com` | `password123` | Approve or reject pending pre-registrations. |
| **Visitor** | `karan@visitor.com` | `password123` | Track pre-registered visits, view scannable digital badge. |

---

## Core Flow Walkthrough

1. **Pre-Registration:**
   * Go to `http://localhost:5174/pre-register`.
   * Fill out the form, selecting **Amit Patel** as the host.
   * Submit the form. An OTP code will show on screen (simulating the SMS notification). Enter the code to verify.
2. **Host Approval:**
   * Log in as the host: `amit@gatekeeper.com` / `password123`.
   * Open the **Appointments** tab. Click **Approve** on the new visitor's request.
3. **Pass Issuance:**
   * Log in as gate security: `security@gatekeeper.com` / `password123`.
   * Navigate to **Issue Pass**.
   * Click on the approved appointment in the sidebar to autofill details.
   * Click **Activate Camera** (or let it generate a fallback avatar) and click **Generate Digital Pass**.
   * Download the PDF visitor badge or inspect the QR code.
4. **Gate Entry / Exit Scans:**
   * Open the **Dashboard** as Security.
   * Enter the Pass ID manually (or scan via webcam) to check the visitor in. The status changes to "Checked In" and they appear in the *Currently Active* list.
   * Enter the Pass ID again to check them out.

---

## Docker + Nginx Deployment (Bonus Challenge)

You can run the entire application using Docker Compose, which boots MongoDB, the Express backend, and the Nginx frontend reverse proxy on port 80:

```bash
docker-compose up --build
```

* **Frontend Portal (Served by Nginx):** `http://localhost/`
* **Backend API (Reverse proxied):** `http://localhost/api/`

