import FeatureCard from "@/components/marketing/FeatureCard";
import FeatureCarousel from "@/components/marketing/FeatureCarousel";
import ScreenshotCarousel from "@/components/marketing/ScreenshotCarousel";

export const metadata = {
  title: "Schooldb | Smart School Management System",
  description:
    "Schooldb is a centralized school management system that helps principals and management oversee academics, attendance, staff, and finances with clarity and control.",
  openGraph: {
    title: "Schooldb – Smart School Management System",
    description:
      "A management-first platform that gives school leaders complete visibility and confident decision-making.",
    images: ["/og/home.png"],
    type: "website",
  },
};

export default function Home() {
  return (
    <main className="bg-slate-50 text-gray-900">
      {/* HERO */}
      <section className="pt-24 pb-20 bg-white">
        <div className="max-w-6xl mx-auto text-center px-6">
          <h1 className="text-5xl font-bold leading-tight max-w-4xl mx-auto">
            Manage Your School with <br />
            Clarity, Control, and Confidence
          </h1>

          <p className="mt-6 text-lg text-gray-700 max-w-3xl mx-auto">
            Schooldb is a centralized school management system designed for
            principals and leadership teams to monitor academics, attendance,
            staff activity, and finances from one reliable dashboard.
          </p>

          <a
            href="/demo"
            className="mt-10 inline-block bg-indigo-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-indigo-700 transition"
          >
            Request a Management Demo
          </a>

          <p className="mt-4 text-sm text-gray-500">
            Built for Indian schools • Designed for principals and management
          </p>
        </div>
      </section>

      {/* WHY SCHOOLDB */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold">Why Schooldb</h2>

          <p className="text-gray-700 mt-6 max-w-3xl mx-auto">
            Schooldb reduces administrative workload, improves data accuracy,
            and gives school leadership real-time visibility into daily
            operations—enabling faster, more confident decision-making.
          </p>
        </div>
      </section>

      {/* KEY FEATURES */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Core Features Designed for Leadership
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <FeatureCard
              title="Unified Management Dashboard"
              description="A single dashboard to view students, attendance trends, teacher activity, and financial status in real time."
            />
            <FeatureCard
              title="Attendance & Academic Tracking"
              description="Teachers and administrators can manage attendance and marks with accurate records and instant visibility."
            />
            <FeatureCard
              title="Fees & Financial Oversight"
              description="Transparent fee tracking with clear visibility into paid, pending, and overdue amounts."
            />
            <FeatureCard
              title="Reports & Data Exports"
              description="Export-ready reports for audits, inspections, and management reviews without manual compilation."
            />
          </div>
        </div>
      </section>

      {/* SCREENSHOTS */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-4">
            Schooldb in Action
          </h2>

          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Real dashboards used by school management to monitor attendance,
            academic performance, staff responsibilities, and fee status—all
            from one platform.
          </p>

          <ScreenshotCarousel />
        </div>
      </section>

      {/* DECISION PLATFORM */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold">
            Built for Leadership, Not Just Data Entry
          </h2>

          <p className="mt-6 max-w-3xl text-gray-700">
            Schooldb connects academic, operational, and financial data into a
            single source of truth. This allows principals and management to
            identify issues early, track progress clearly, and take informed
            action without delays or dependency.
          </p>
        </div>
      </section>

      {/* FEATURE SLIDES */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold mb-10">
            Capabilities at a Glance
          </h2>

          <FeatureCarousel />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 text-center bg-indigo-600 text-white">
        <h2 className="text-3xl font-bold">
          See How Schooldb Fits Your School
        </h2>

        <p className="mt-3 text-indigo-100">
          Get a guided demo tailored to your school’s structure and needs
        </p>

        <a
          href="/demo"
          className="mt-8 inline-block bg-white text-indigo-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
        >
          Schedule a Demo
        </a>
      </section>
    </main>
  );
}
