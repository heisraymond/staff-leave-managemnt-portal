# 📄 Staff Leave Management Portal

A role-based Staff Leave Management System built to digitize and streamline employee leave processes across organizations. The system replaces manual spreadsheets and email-based approvals with a centralized, secure, and scalable web application.

---

## 📌 Project Overview

The Staff Leave Management Portal is a full-stack web application that manages employee leave requests through a structured role-based system.

It supports three user roles:

- 👨‍💼 **Admin**
- 👨‍🏫 **Supervisor**
- 👨‍💻 **Employee**

Each role has specific permissions and access levels within the system.

---

## 🧱 Tech Stack

### 🖥️ Frontend
- Next.js (App Router)
- React.js
- TypeScript
- Tailwind CSS

**Why this stack?**
- Fast and modern full-stack React framework
- Type safety with TypeScript
- Clean and responsive UI with Tailwind CSS
- Scalable file-based routing system (App Router)

---

### ⚙️ Backend
- Django
- Django REST Framework (DRF)
- SimpleJWT (Authentication)

**Why Django?**
- Secure authentication system out of the box
- Rapid API development
- Powerful ORM for database operations
- Excellent scalability for enterprise systems

---

### 🗄️ Database
- SQLite (Development)
- PostgreSQL (Recommended for Production)

**Database is used for:**
- User accounts and authentication
- Leave requests and approvals
- Role and permission management
- Leave balance tracking and history

---

## 🔐 Authentication System

### 🔑 Method Used
JWT (JSON Web Token Authentication) using **Django SimpleJWT**

---

# 🚀 Running the Project Locally

This project uses:

* **Frontend:** Next.js + TypeScript + Tailwind CSS
* **Backend:** Django + Django REST Framework (DRF)
* **Authentication:** JWT using SimpleJWT

The frontend and backend run separately during development.

---

# 📦 Prerequisites

Make sure you have the following installed:

* Node.js (v18+ recommended)
* Python (v3.10+ recommended)
* pip
* Git

---

# ⚙️ Backend Setup (Django + DRF)

## 1️⃣ Clone the Repository

```bash
git clone <your-repository-url>
cd backend
```

---

## 2️⃣ Create Virtual Environment

### Mac/Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

---

## 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

If `requirements.txt` does not exist yet:

```bash
pip install django djangorestframework djangorestframework-simplejwt corsheaders
```

---

## 4️⃣ Run Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

---

## 5️⃣ Create Superuser

```bash
python manage.py createsuperuser
```

Follow the prompts to create your admin account.

---

## 6️⃣ Start Django Development Server

```bash
python manage.py runserver
```

Backend will run on:

```bash
http://127.0.0.1:8000
```

---

# 🌐 Frontend Setup (Next.js)

Open another terminal window.

---

## 1️⃣ Navigate to Frontend Folder

```bash
cd frontend
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

## 3️⃣ Start Development Server

```bash
npm run dev
```

Frontend will run on:

```bash
http://localhost:3000
```

---

# 🔐 Authentication

This project uses JWT Authentication via Django SimpleJWT.

After login:

* Access Token is used for authenticated requests
* Protected routes require valid JWT tokens
* Role-based permissions determine user access

---

# 👥 Demo Roles

## 👨‍💼 Admin

* Manage all users
* View all leave requests
* Manage leave balances
* Access system dashboard

## 👨‍🏫 Supervisor

* Approve or reject leave requests
* View team leave history

## 👨‍💻 Employee

* Submit leave requests
* View personal leave balance
* Track leave request status

---

# 📁 Project Structure

## Backend

```bash
backend/
│
├── users/
├── leave/
├── manage.py
└── requirements.txt
```

---

## Frontend

```bash
frontend/
│
├── app/
├── components/
├── lib/
├── services/
└── package.json
```

---

# 🛠️ API Communication

The frontend communicates with Django APIs using REST endpoints.

Example:

```bash
GET /api/auth/profile/
POST /api/auth/login/
POST /api/leave/
```

---

# 🌍 Recommended Production Stack

* PostgreSQL
* Docker
* Nginx
* Gunicorn
* Vercel (Frontend Deployment)

---

# ✅ Features

* JWT Authentication
* Role-Based Access Control
* Leave Request Workflow
* Leave Balance Tracking
* Supervisor Approval System
* Admin Dashboard
* Responsive UI
* RESTful API Architecture

---


