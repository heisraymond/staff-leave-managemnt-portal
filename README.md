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

### 🔁 Authentication Flow

1. User logs in using email and password
2. Django validates credentials using `authenticate()`
3. If valid, backend returns:
   - Access Token
   - Refresh Token
   - User data
4. Frontend stores token locally
5. Token is used for authenticated API requests


