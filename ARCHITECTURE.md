# SchoolDB System Architecture

SchoolDB is built using a modern serverless SaaS architecture.

Frontend
Next.js (App Router)
React
TypeScript

Backend
Next.js server functions

Database
Neon PostgreSQL

ORM
Prisma

Authentication
Clerk

Deployment
Vercel serverless infrastructure

## Multi-Tenant Model

Each school operates within an isolated workspace.

Tenant routing:

schooldb.co.in/[schoolId]

All APIs enforce tenant boundaries.