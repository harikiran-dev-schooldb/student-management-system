

# 🎓 Student Management System

![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![License](https://img.shields.io/github/license/harikiran-dev-schooldb/student-management-system)
![Repo Size](https://img.shields.io/github/repo-size/harikiran-dev-schooldb/student-management-system)
![Last Commit](https://img.shields.io/github/last-commit/harikiran-dev-schooldb/student-management-system)
![Issues](https://img.shields.io/github/issues/harikiran-dev-schooldb/student-management-system)
![Forks](https://img.shields.io/github/forks/harikiran-dev-schooldb/student-management-system)
![Stars](https://img.shields.io/github/stars/harikiran-dev-schooldb/student-management-system)

## 📌 Overview

The **Student Management System** is a full-stack web platform designed for educational institutions to manage student records and academic workflows.
Built with **Next.js**, **Prisma**, and **PostgreSQL**, it centralizes core operations such as student registration, fee management, attendance, marks entry, and reporting.

Ideal for **schools, colleges, coaching centers**, and **training institutions** looking to modernize their administrative processes.

---

## 🚀 Key Features

### 👨‍💼 Admin

* Manage students, teachers, classes, and fee structures
* Assign roles and permissions
* Access complete reporting dashboards

### 👩‍🏫 Teacher

* Record daily attendance
* Enter marks and view student performance
* Track fee status and student profiles

### 👨‍🎓 Student

* View academic profile
* Access marks, fee details, and attendance records
* Download reports and invoices

### Core Modules

* 📋 **Student Enrollment & Profiles**
* 💰 **Fee Tracking & Ledgers**
* 📊 **Attendance Management**
* 📝 **Exam & Marks Entry**
* 📈 **Comprehensive Reports**
* 🔐 **Secure Authentication (Role Based)**
* 📊 **Central Admin Dashboard**

---

## 🛠 Tech Stack

| Layer         | Technology                               |
| ------------- | ---------------------------------------- |
| UI / Frontend | Next.js, React, TypeScript, Tailwind CSS |
| API / Backend | Next.js API Routes + Prisma ORM          |
| Database      | PostgreSQL                               |
| Auth          | Clerk, NextAuth, or custom               |
| Deployment    | Vercel |

---

## 📀 Installation & Setup

### 1️⃣ Prerequisites

* Node.js **18+**
* PostgreSQL **14+**
* Git
* VS Code or preferred editor

---

### 2️⃣ Clone Repository

```bash
git clone https://github.com/harikiranadangi/student-management-system.git
cd student-management-system
```

---

### 3️⃣ Install Packages

```bash
npm install
```

---

### 4️⃣ Configure Environment

Create `.env` in project root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/student_db"
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000/api"
```

> Update username, password, and database name as needed.
> Create database manually or run: `createdb student_db`

---

### 5️⃣ Run Database Migrations

```bash
npx prisma migrate dev --name init
```

(Optional) Seed or inspect database using:

```bash
npx prisma studio
```

---

### 6️⃣ Launch Dev Server

```bash
npm run dev
```

Application runs at:
[http://localhost:3000](http://localhost:3000)

---

## 📂 Project Structure

```
student-management-system/
├── .env
├── package.json
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── api/
│   ├── app/
│   │   ├── students/
│   │   ├── fees/
│   │   │   ├── fee_ledger/
│   │   │   └── [id]/
│   │   ├── teachers/
│   │   ├── reports/
│   ├── components/
│   ├── config/
│   ├── lib/
│   ├── styles/
```

---

## 📈 Modules & Screens

* **🧾 Fee Ledger** — `/fees/fee_ledger`
* **💳 Student Fees** — `/fees/[id]`
* **📝 Reports Dashboard** — `/reports`
* **🎓 Students** — `/students`
* **👩‍🏫 Teachers** — `/teachers`

---

## ❗ Troubleshooting

### Missing Node or npm

```bash
node -v
npm -v
```

Reinstall Node if required.

### Database Connection Errors

* PostgreSQL services must be running
* Check `.env` configuration
* Use:

```bash
pg_isready
```

---

## 🤝 Contributing

```bash
git checkout -b feature/my-feature
git commit -m "Add: New feature"
git push origin feature/my-feature
```

Submit a pull request anytime.

---

## 📜 License

Released under the **MIT License**.
See `LICENSE` for terms.

---

## 📧 Contact

* GitHub: **@harikiranadangi**
* Organization: **Kotak Salesian School**
* Email (optional): *replace-email-here*

---

## 🚀 Deployment Options

* **Vercel** (Recommended)
* **Railway**
* **DigitalOcean**
* **Self-hosted VPS**

> Use a hosted PostgreSQL instance + production `.env` secrets.

---

### 🏁 Built & Maintained By

**Harikiran**
