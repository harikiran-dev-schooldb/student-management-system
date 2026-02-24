

# 🎓 Student Management System — Multi-Tenant SaaS Platform

![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![License](https://img.shields.io/github/license/harikiran-dev-schooldb/student-management-system)
![Repo Size](https://img.shields.io/github/repo-size/harikiran-dev-schooldb/student-management-system)
![Last Commit](https://img.shields.io/github/last-commit/harikiran-dev-schooldb/student-management-system)
![Issues](https://img.shields.io/github/issues/harikiran-dev-schooldb/student-management-system)
![Forks](https://img.shields.io/github/forks/harikiran-dev-schooldb/student-management-system)
![Stars](https://img.shields.io/github/stars/harikiran-dev-schooldb/student-management-system)

**A production-ready, multi-tenant School ERP solution for institutions — deployed on Vercel with Neon PostgreSQL and Clerk authentication.**

This repository contains the web platform used to manage academic and administrative operations across multiple schools (tenants) from a single secure deployment. ([GitHub][1])

---

## 🌐 Product Overview

The **Student Management System** is a **multi-tenant, browser-based SaaS platform** designed to help schools and educational institutions manage:

* student records
* fee billing and payments
* attendance tracking
* exam entries and performance
* role-based access and reporting

Each institution (tenant) operates in an isolated workspace under a single global deployment. Multi-tenant architecture allows:

* cost-effective scaling
* centralized updates
* efficient resource usage
* secure per-tenant data isolation

> Multi-tenant SaaS provides resource sharing and secure data partitioning for many customers from one deployed instance. ([Rishabh Software][2])

---

## 🚀 Core Product Highlights

### 🌟 Why This is SaaS-Ready

* **Tenant routing:** `yourdomain.com/[schoolId]`
* **Versioned API:** `/api/v1/tenants/[schoolId]/*`
* **Role-based access control**
* **Secure authentication with Clerk**
* **Serverless deployment model**
* **Designed for production deployments**

**Use cases:**
School districts, coaching hubs, training institutes, chain schools, centralized academic services.

---

## 🧠 Key Features

### 🏫 Multi-Tenant Organization Support

* Isolated tenant data scopes
* Admin dashboards per tenant
* Secure API boundaries per school

### 👨‍💼 Admin Capabilities

* Manage students, teachers, classes
* Define fee structures and ledgers
* Assign roles and permissions
* Access rich analytics & reports

### 👩‍🏫 Teacher Efficiency Tools

* Daily attendance
* Marks entry and performance dashboards
* Class & subject-wise workflows

### 👨‍🎓 Student Experience

* Personal academic dashboard
* Attendance and marks tracking
* Downloadable reports and invoices

---

## 🛠 Tech Stack

| Layer               | Technology                                          |
| ------------------- | --------------------------------------------------- |
| Frontend            | Next.js App Router, React, TypeScript, Tailwind CSS |
| Backend             | Next.js Server Functions                            |
| ORM                 | Prisma                                              |
| Database            | Neon PostgreSQL                                     |
| Authentication      | Clerk                                               |
| Hosting             | Vercel                                              |
| Payments (optional) | Razorpay (server only)                              |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── [schoolId]/             # Tenant scoped UI pages
│   │   └── (dashboard)/
│   └── api/v1/tenants/
│       └── [schoolId]/         # SaaS APIs
├── components/
├── lib/                       # Tenant helpers & security
├── prisma/
│   └── schema.prisma
└── middleware.ts              # Tenant extraction logic
```

---

## ⚙️ Getting Started (Local Development)

### 1️⃣ Install

```bash
npm install
```

### 2️⃣ Environment Variables

Create a `.env` file with:

```env
DATABASE_URL="your_neon_connection_string"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000/api"
```

Optional (server-only, not exposed to client):

```
RAZORPAY_KEY_ID="your_server_key_id"
RAZORPAY_KEY_SECRET="your_server_key_secret"
```

---

### 3️⃣ Migrations

```bash
npx prisma migrate dev
```

### 4️⃣ Start Dev

```bash
npm run dev
```

Visit:

```
http://localhost:3000
```

---

## 📦 Deployment (Production)

1. **Provision Neon PostgreSQL** and set `DATABASE_URL` in Vercel
2. **Add Clerk API keys** in Vercel environment
3. **Add Razorpay keys (optional)** for payments
4. **Deploy via Vercel** — automatic build + serverless creation
5. Run production migrations:

```bash
npx prisma migrate deploy
```

---

## 📊 SaaS Considerations

* Tenant routing and middleware ensure each tenant’s data is isolated at the API and database level.
* Clerk provides secure authentication flows per institution.
* Because this is a production platform, all sensitive client secrets must remain server-side and protected.

Multi-tenant SaaS architecture improves resource usage and reduces operational overhead while serving multiple paying customers from one codebase and infrastructure. ([Rishabh Software][2])

---

## ⚠️ License & Source Policy

This repository is now **proprietary and non-open source** — it is no longer licensed under MIT in open-source mode and is restricted for internal or authorized deployment.

---

## 📬 Contact

Maintained by **Harikiran** — for feature access or enterprise onboarding, reach out via the internal maintainer channels (Clerk admin console + private support).

---

