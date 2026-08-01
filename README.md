# Project VitalPulse - Remote Health Dashboard for Doctors

**VitalPulse** is a high-performance, clinician-facing remote health dashboard that aggregates live patient vitals, medical histories, diagnostic reports, and AI-driven risk analytics into a single dashboard interface.

![VitalPulse System Architecture](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20FastAPI%20%7C%20Prisma-14B8A6)

---

## 🌟 Key Features

- 🏥 **Clinician Command Center**: Centralized patient roster with real-time risk triage, search, and filtering across wards and severity levels.
- 📈 **Live Vitals Telemetry**: Real-time streaming of Heart Rate, SpO2, Blood Pressure, and Body Temperature with automated threshold alert notifications via WebSockets.
- 🧠 **AI Predictive Risk Analytics**: Machine Learning risk scoring (XGBoost/Scikit-Learn) with SHAP feature explainability indicating key clinical risk factors.
- 📋 **Diagnostic Reports & Summarizer**: Automatic clinical parsing and summarization of unstructured diagnostic test results and medical histories.
- 🩺 **Telehealth & Virtual Consultations**: Consultation scheduling, integrated video/audio interaction interface, clinical notes, and digital prescription builder.
- 🔐 **Role-Based Access Control (RBAC)**: Role-gated JWT authorization supporting Doctors, Admins, and Patients.

---

## 🛠️ Architecture Overview

```text
VitalPulse/
├── backend/          # Node.js, Express, TypeScript, Prisma ORM, Socket.io (Port 5000)
├── frontend/         # React, Vite, TypeScript, Tailwind CSS v3, Recharts (Port 3000)
└── ml-service/       # Python, FastAPI, XGBoost/Scikit-Learn, SHAP, Pandas (Port 8000)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.9+)
- SQLite (included zero-config) or PostgreSQL database

### 1. Backend Setup
```bash
cd backend
npm install
npm run db:setup
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. ML Risk Service Setup
```bash
cd ml-service
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python -m app.main
```

---

## 🧪 Demo Credentials

- **Doctor Login**: `doctor@vitalpulse.med` / `Doctor123!`
- **Admin Login**: `admin@vitalpulse.med` / `Admin123!`
