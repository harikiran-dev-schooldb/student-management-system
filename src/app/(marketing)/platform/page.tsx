export const metadata = {
  title: "Platform | School DB – Multi-Tenant SaaS Architecture",
  description:
    "Explore the cloud-native, multi-tenant SaaS architecture behind School DB. Secure tenant isolation, role-based access, serverless deployment, and scalable infrastructure.",
  openGraph: {
    title: "School DB Platform Architecture",
    description:
      "Multi-tenant SaaS infrastructure designed for institutional scale.",
    images: ["/og/platform.png"],
    type: "website",
  },
};

export default function Platform() {
  return (
    <main className="bg-white text-gray-900">

      {/* ================= HERO ================= */}
      <section className="py-32 bg-gradient-to-b from-white to-slate-100 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <span className="inline-block bg-indigo-100 text-indigo-600 px-4 py-1 rounded-full text-sm font-medium">
            SaaS Infrastructure & Architecture
          </span>

          <h1 className="mt-8 text-5xl font-bold leading-tight">
            The Technology Powering
            <br /> School DB
          </h1>

          <p className="mt-8 text-xl text-gray-600">
            A production-ready, multi-tenant SaaS platform built for secure
            institutional management at scale.
          </p>
        </div>
      </section>

      {/* ================= MULTI-TENANT ================= */}
      <section className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

          <div>
            <h2 className="text-3xl font-bold">
              Multi-Tenant SaaS Architecture
            </h2>
            <p className="mt-6 text-gray-600 leading-relaxed">
              Each institution operates in a securely isolated environment
              under a single global deployment. Tenant-based routing ensures
              strict data partitioning while allowing centralized updates
              and efficient infrastructure utilization.
            </p>
          </div>

          <div className="bg-slate-50 p-10 rounded-3xl shadow-lg">
            <ul className="space-y-4 text-gray-700">
              <li>✔ Secure tenant data isolation</li>
              <li>✔ Centralized SaaS updates</li>
              <li>✔ Cost-efficient scaling</li>
              <li>✔ Shared infrastructure, isolated data</li>
            </ul>
          </div>

        </div>
      </section>

      {/* ================= ROUTING & API ================= */}
      <section className="py-28 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

          <div className="bg-white p-10 rounded-3xl shadow-lg order-2 md:order-1">
            <ul className="space-y-4 text-gray-700">
              <li>✔ Tenant-based routing: /[schoolId]</li>
              <li>✔ Versioned APIs: /api/v1/tenants/[schoolId]</li>
              <li>✔ Structured long-term maintainability</li>
              <li>✔ Secure API boundaries per institution</li>
            </ul>
          </div>

          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-bold">
              Structured Routing & Versioned APIs
            </h2>
            <p className="mt-6 text-gray-600 leading-relaxed">
              School DB uses tenant-scoped routing and versioned APIs to
              ensure long-term maintainability, backward compatibility,
              and clean data separation across institutions.
            </p>
          </div>

        </div>
      </section>

      {/* ================= AUTH & SECURITY ================= */}
      <section className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

          <div>
            <h2 className="text-3xl font-bold">
              Enterprise-Grade Authentication & Governance
            </h2>
            <p className="mt-6 text-gray-600 leading-relaxed">
              Powered by Clerk authentication with structured role-based
              access control, ensuring administrators, teachers, and
              students access only what they are authorized to manage.
            </p>
          </div>

          <div className="bg-slate-50 p-10 rounded-3xl shadow-lg">
            <ul className="space-y-4 text-gray-700">
              <li>✔ Secure authentication flows</li>
              <li>✔ Role-based access control (RBAC)</li>
              <li>✔ Protected tenant APIs</li>
              <li>✔ Server-side secret isolation</li>
            </ul>
          </div>

        </div>
      </section>

      {/* ================= CLOUD INFRA ================= */}
      <section className="py-28 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 text-center">

          <h2 className="text-4xl font-bold">
            Cloud-Native & Serverless by Design
          </h2>

          <p className="mt-8 text-lg text-gray-600 max-w-3xl mx-auto">
            Deployed on Vercel with Neon PostgreSQL and Prisma ORM,
            School DB leverages modern serverless architecture for
            scalability, performance, and operational efficiency.
          </p>

          <div className="mt-16 grid md:grid-cols-3 gap-10">

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="font-semibold text-lg">Vercel Hosting</h3>
              <p className="mt-3 text-gray-600">
                Global edge deployment with automatic scaling.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="font-semibold text-lg">Neon PostgreSQL</h3>
              <p className="mt-3 text-gray-600">
                Serverless database built for performance and reliability.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="font-semibold text-lg">Prisma ORM</h3>
              <p className="mt-3 text-gray-600">
                Type-safe data modeling and scalable schema management.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-32 bg-indigo-600 text-white text-center">
        <h2 className="text-4xl font-bold">
          Built for Institutions. Engineered for Scale.
        </h2>

        <p className="mt-6 text-indigo-100 text-lg max-w-2xl mx-auto">
          Discover how School DB’s architecture supports secure,
          scalable growth for modern educational institutions.
        </p>

        <a
          href="/demo"
          className="mt-10 inline-block bg-white text-indigo-600 px-10 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:bg-gray-100 transition"
        >
          Schedule Platform Demo
        </a>
      </section>

    </main>
  );
}