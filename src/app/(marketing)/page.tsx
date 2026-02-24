import FeatureCard from "@/components/marketing/FeatureCard";
import FeatureCarousel from "@/components/marketing/FeatureCarousel";
import ScreenshotCarousel from "@/components/marketing/ScreenshotCarousel";

export const metadata = {
  title: "School DB | Leadership-Focused School ERP",
  description:
    "School DB is a centralized school management system built for principals and leadership teams to gain full visibility into academics, attendance, staff, and finances.",
  openGraph: {
    title: "School DB – The Executive Operating System for Schools",
    description:
      "A modern ERP platform designed to bring clarity, control, and confidence to school leadership.",
    images: ["/og/home.png"],
    type: "website",
  },
};

export default function Home() {
  return (
    <main className="bg-white text-gray-900">

      {/* ================= HERO ================= */}
      <section className="relative bg-gradient-to-b from-white to-slate-100 py-32">
        <div className="max-w-6xl mx-auto px-6 text-center">

          <span className="inline-block bg-indigo-100 text-indigo-600 px-4 py-1 rounded-full text-sm font-medium">
            Built for Modern Indian Schools
          </span>

          <h1 className="mt-8 text-6xl font-bold leading-tight max-w-4xl mx-auto">
            The Executive Command Center <br />
            For Your Entire School
          </h1>

          <p className="mt-8 text-xl text-gray-600 max-w-3xl mx-auto">
            School DB centralizes academics, attendance, staff operations,
            and financial oversight into one powerful real-time dashboard
            designed specifically for principals and leadership teams.
          </p>

          <div className="mt-12 flex justify-center gap-6">
            <a
              href="/demo"
              className="bg-indigo-600 text-white px-10 py-4 rounded-2xl text-lg font-semibold shadow-xl hover:bg-indigo-700 transition"
            >
              Request Leadership Demo
            </a>

            <a
              href="/features"
              className="border border-gray-300 px-10 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-100 transition"
            >
              Explore Features
            </a>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            Secure • Multi-Tenant • Scalable Architecture
          </p>
        </div>
      </section>

      {/* ================= TRUST METRICS ================= */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-4xl font-bold text-indigo-600">60% Less</h3>
              <p className="mt-2 text-gray-600">
                Administrative workload
              </p>
            </div>

            <div>
              <h3 className="text-4xl font-bold text-indigo-600">Real-Time</h3>
              <p className="mt-2 text-gray-600">
                Operational visibility
              </p>
            </div>

            <div>
              <h3 className="text-4xl font-bold text-indigo-600">Centralized</h3>
              <p className="mt-2 text-gray-600">
                Academic & financial control
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES GRID ================= */}
      <section className="py-28 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">

          <h2 className="text-4xl font-bold text-center mb-16">
            Designed for Leadership. Engineered for Scale.
          </h2>

          <div className="grid md:grid-cols-2 gap-10">
            <FeatureCard
              title="Unified Executive Dashboard"
              description="A real-time overview of attendance trends, academic progress, staff activity, and financial performance — all from one centralized interface."
            />
            <FeatureCard
              title="Attendance & Academic Intelligence"
              description="Track daily attendance and performance metrics with structured reporting built for management review."
            />
            <FeatureCard
              title="Financial Oversight & Fee Tracking"
              description="Monitor collections, pending dues, and revenue flow clearly with integrated digital payment support."
            />
            <FeatureCard
              title="Audit-Ready Reports"
              description="Generate export-ready reports for inspections, compliance reviews, and institutional analysis within seconds."
            />
          </div>
        </div>
      </section>

      {/* ================= SCREENSHOTS ================= */}
      <section className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">

          <h2 className="text-4xl font-bold text-center mb-6">
            School DB in Action
          </h2>

          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-16">
            A centralized interface that gives leadership teams complete clarity
            into operations without chasing manual reports.
          </p>

          <ScreenshotCarousel />
        </div>
      </section>

      {/* ================= POSITIONING ================= */}
      <section className="py-28 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 text-center">

          <h2 className="text-4xl font-bold">
            Not Just Software. <br />
            A Leadership Operating System.
          </h2>

          <p className="mt-8 text-lg text-gray-600 max-w-3xl mx-auto">
            School DB connects academic, operational, and financial systems
            into a single source of truth — enabling faster decisions,
            early issue detection, and long-term institutional growth.
          </p>

        </div>
      </section>

      {/* ================= FEATURE SLIDER ================= */}
      <section className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">

          <h2 className="text-4xl font-bold mb-14 text-center">
            Capabilities at a Glance
          </h2>

          <FeatureCarousel />
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="py-32 text-center bg-indigo-600 text-white">
        <h2 className="text-4xl font-bold">
          Ready to Transform Your School Operations?
        </h2>

        <p className="mt-6 text-indigo-100 text-lg max-w-2xl mx-auto">
          Book a personalized demo and discover how School DB brings
          clarity, control, and confidence to your institution.
        </p>

        <a
          href="/demo"
          className="mt-10 inline-block bg-white text-indigo-600 px-10 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:bg-gray-100 transition"
        >
          Schedule Leadership Demo
        </a>
      </section>

    </main>
  );
}