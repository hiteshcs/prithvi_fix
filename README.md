# 🏛️ Prithvi Fix — National Cooperative Gig Services Platform
> *"Verified Skills. Fair Living Wage. Stronger Cooperative Communities."*

**Prithvi Fix** is a digital public goods platform designed to connect verified, skilled artisans belonging to regional **Labour Cooperative Societies & District Federations** with households, businesses, and government institutions.

Unlike profit-extracting private aggregators that levy high commissions (25%–35%) and treat gig workers as disposable labor with zero safety nets, **Prithvi Fix** implements an institutional cooperative model where:
1. Workers are **member-owners** in registered primary cooperative societies.
2. A statutory **93-2-5 Escrow Model** guarantees **93% direct living wage** to the artisan, **5%** into social security welfare (ESIC accident cover, Mini-PF, health fund, NSDC upskilling), and **2%** for cooperative platform upkeep.
3. Service tariffs are transparent and standardized with government-regulated base rates and **zero hidden surge pricing**.
4. Multi-district statutory governance is enforced by **District Cooperative Officers (DCOs)** under the Odisha Cooperative Societies Act across **Khordha, Cuttack, and Puri**.

---

## 🌟 Key Platform Modules

### 1. 👤 Citizen & Household Public Portal
- **Multi-Lingual Interface**: Complete live localization in 5 Indian languages: **English (EN)**, **Hindi (हिंदी)**, **Odia (ଓଡ଼ିଆ)**, **Bengali (বাংলা)**, and **Telugu (తెలుగు)**.
- **Standardized Public Services Catalog**: 15+ services across 12 trade categories (*Electrical, Plumbing, Carpentry, Painting, Cleaning, Masonry, Appliance Repair, IT & CCTV, Gardening, Caregiving, Driving, Emergency Squad*).
- **Smart Matching Recommendation Engine**: Composite multi-factor scoring:
  $$\text{Score} = (\text{Skill Match} \times 0.50) + (\text{Proximity} \times 0.30) + (\text{Availability} \times 0.20)$$
- **Dual OTP Physical Verification**: Generates a **4-digit Arrival OTP** (shared only when artisan reaches site) and a **4-digit Completion OTP** (shared after inspecting work), eliminating fraudulent check-ins.
- **Live Transit Tracking**: Real-time GPS route visualization and artisan telemetry using Leaflet.
- **Appliance Lineage Digital Passport**: Tamper-evident lifecycle service history for household appliances (AC, refrigerator, water purifier, electrical panel).
- **Simulated Multi-Channel Payments & Form IV Tax Invoicing**: Instant payment processing (UPI QR, Card, Net Banking) and printable statutory Form IV tax invoice.

### 2. 👷 Worker / Artisan Member Portal
- **Autonomy Over Duty Availability**: 1-click status switch (`AVAILABLE (Duty On)`, `ON JOB / BUSY`, `OFFLINE`).
- **Real-Time Dispatch Radar**: Audio-visual broadcast alerts for incoming service orders in the worker's operational jurisdiction with instant Accept / Decline workflow.
- **Transparent 93% Earnings Ledger**: Complete breakdown of gross earnings, 93% net bank settlement, and zero agency commission deductions.
- **Worker Welfare Centre**: Direct visibility into accumulated Mini-PF reserves, active ESIC accident insurance, and 1-click enrollment into NSDC vocational certification workshops.

### 3. 🏛️ Primary Cooperative Societies & Multi-District DCO Governance
- **Society Registration & Formation**: Digital incorporation with minimum 10 founding artisan promoters, trade classifications, and statutory bylaws.
- **District Cooperative Officer (DCO) Consoles**: Strictly segregated jurisdictional governance for **Khordha**, **Cuttack**, and **Puri** districts.
- **Statutory Audit & Reserve Fund Tracking**: Audit grade management (Grade A/B/C), annual return filing verification, and cooperative reserve fund ledger.
- **Quasi-Judicial Section 68 Inquiry Dockets**: Formal inquiry docket management, hearing summons, and conciliation proceedings.

### 4. 🏢 Apex Federation Console & Smart Features
- **Statewide Executive KPI Banner**: Real-time operational metrics across registered societies, verified artisans, active jobs, emergency dispatches, and escrow payouts.
- **Predictive AI Seasonal Demand Forecasting**: 4-week forward demand projection across trade clusters based on historical trends and weather directives.
- **Inter-Cooperative Mutual Aid Workforce Transfer**: Algorithmic deficit/surplus analysis enabling temporary cross-district artisan dispatches to balance localized shortages.
- **Institutional Bulk Tenders**: Public procurement portal for large-scale maintenance tenders from universities, hospitals, and municipal departments.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, React Router 7, Tailwind CSS 3.4, Lucide React Icons, Google Maps |
| **Backend** | Node.js, Express 5, PostgreSQL (`pg` pool with automatic connection retry and Supabase IPv4 pooler resolver) |
| **Security** | JWT Authentication, bcryptjs password hashing, Helmet HTTP security headers, CORS origin protection, Express Rate Limiter, PII Masking (DPDP Act) |
| **Deployment** | Native Render Blueprint (`render.yaml`), Vercel SPA configuration (`vercel.json`), PM2 cluster mode, Nginx reverse proxy |

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js** (v18.0 or higher) — `node -v`
- **PostgreSQL** (v14 or higher) — `psql -V`

### 2. Configure Environment Variables
Copy the example environment configuration into `backend/.env`:
```bash
cd backend
cp .env.example .env
```
Ensure your PostgreSQL credentials in `backend/.env` are set:
```env
PORT=5000
NODE_ENV=development
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_postgres_password
PGDATABASE=prithvifix
JWT_SECRET=prithvi_fix_secure_jwt_secret_key_2026
CORS_ORIGIN=http://localhost:5173
CORS_ALLOW_ALL=true
```

### 3. Auto-Migrate & Seed the Database
Run the automated migration and seed script to provision all 12 database tables, statutory indexes, and realistic demo data:
```bash
npm run seed
```

### 4. Start the Application
Run both backend and frontend from the root workspace or in separate terminals:

```bash
# Terminal 1: Backend API (Port 5000)
npm run dev:backend

# Terminal 2: Frontend Client (Port 5173)
npm run dev:frontend
```

Open your browser at **`http://localhost:5173`**.

---

## 🌐 Public Sharing via ngrok

To share the working platform with stakeholders or test across mobile devices:
```bash
ngrok http 5173
```
*Vite automatically proxies `/api` requests to backend port 5000, so a single frontend tunnel exposes the entire full-stack application.*

---

## 🔑 Pre-Configured Demo Credentials

For quick evaluation, 1-click login buttons are available directly on the `/login` page:

| Role | Portal URL | Login Email | Password | Pre-configured Persona |
| :--- | :--- | :--- | :--- | :--- |
| 👤 **Citizen / Customer** | `/login` | `customer@demo.local` | `password123` | Ananya Patel (Patia, Bhubaneswar) |
| 👷 **Skilled Artisan** | `/login?portal=worker` | `ramesh.w@demo.local` | `password123` | Ramesh Kumar (Master Electrician • Skill Certified) |
| 🏛️ **DCO Khordha** | `/login?portal=admin` | `dco.khordha@demo.local` | `password123` | Debendra Nayak (District Cooperative Officer) |
| 🏛️ **DCO Cuttack** | `/login?portal=admin` | `dco.cuttack@demo.local` | `password123` | Laxmi Devi (District Cooperative Officer) |
| 🏛️ **DCO Puri** | `/login?portal=admin` | `dco.puri@demo.local` | `password123` | Alok Mohapatra (District Cooperative Officer) |
| 🏢 **Apex Federation Head** | `/login?portal=admin` | `fedhead@demo.local` | `password123` | Arun Kumar Pattnaik (Statewide Governance) |

---

## 📚 Documentation Index

| Guide | Description |
| :--- | :--- |
| **[`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md)** | Complete REST API endpoint reference, query params, and JSON schemas |
| **[`WORKFLOW.md`](./WORKFLOW.md)** | End-to-end user journeys and Mermaid state lifecycle diagrams |
| **[`MANUAL_CORE_TEST_CASES.md`](./MANUAL_CORE_TEST_CASES.md)** | Step-by-step test execution scripts for Customer, Worker, and DCO workflows |
| **[`POSTGRES_AND_NGROK_GUIDE.md`](./POSTGRES_AND_NGROK_GUIDE.md)** | Guide for PostgreSQL setup, pgAdmin inspection, and ngrok tunneling |
| **[`RENDER_DEPLOYMENT_GUIDE.md`](./RENDER_DEPLOYMENT_GUIDE.md)** | 1-Click Blueprint and manual cloud deployment on Render.com |
| **[`DEPLOYMENT.md`](./DEPLOYMENT.md)** | Enterprise deployment guide for State Data Centres (NIC, Nginx, PM2) |
| **[`MANUAL_AND_EXTERNAL_DEPENDENCIES.md`](./MANUAL_AND_EXTERNAL_DEPENDENCIES.md)** | Production runtime dependencies and zero paid API confirmation |

---

## 📄 License
Government Open Public Services License (GPL / Digital Public Good).
Designed and developed for Labour Cooperative Federations.
