export const metadata = {
  title: "Schedule a Leadership Demo | School DB",
  description:
    "Book a personalized leadership demo of School DB and discover how your institution can gain real-time visibility into academics, attendance, staff, and financial operations.",
};

export default function Demo() {
  return (
    <main className="bg-white text-gray-900">

      {/* ================= HERO ================= */}
      <section className="py-32 bg-gradient-to-b from-white to-slate-100 text-center">
        <div className="max-w-4xl mx-auto px-6">

          <span className="inline-block bg-indigo-100 text-indigo-600 px-4 py-1 rounded-full text-sm font-medium">
            Personalized Leadership Walkthrough
          </span>

          <h1 className="mt-8 text-5xl font-bold leading-tight">
            See How School DB
            <br /> Transforms School Operations
          </h1>

          <p className="mt-8 text-xl text-gray-600">
            In this guided session, we’ll walk you through the executive
            dashboard, attendance intelligence, financial oversight tools,
            and academic reporting system — tailored to your institution.
          </p>

        </div>
      </section>

      {/* ================= VALUE HIGHLIGHTS ================= */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10 text-center">

          <div className="p-8 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold">
              Executive Dashboard Overview
            </h3>
            <p className="mt-4 text-gray-600">
              Experience real-time visibility into attendance,
              academics, and financial metrics.
            </p>
          </div>

          <div className="p-8 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold">
              Deep Dive Into Core Modules
            </h3>
            <p className="mt-4 text-gray-600">
              Attendance, exams, reports, staff oversight,
              and fee tracking — all demonstrated live.
            </p>
          </div>

          <div className="p-8 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold">
              Strategic Q&A Session
            </h3>
            <p className="mt-4 text-gray-600">
              Discuss onboarding, pricing, data migration,
              and operational workflows.
            </p>
          </div>

        </div>
      </section>

      {/* ================= FORM SECTION ================= */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6">

          <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100">
            <h2 className="text-3xl font-bold text-center">
              Schedule Your Leadership Demo
            </h2>

            <p className="mt-4 text-center text-gray-600">
              Share your details below. Our team will contact you within 24 hours.
            </p>

            <form className="mt-10 space-y-6">

              <div>
                <label className="block text-sm font-medium mb-2">
                  School Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your school name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Contact Person
                </label>
                <input
                  type="text"
                  placeholder="Principal / Administrator name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="example@school.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-xl hover:bg-indigo-700 transition"
              >
                Schedule Demo Now
              </button>

              <p className="text-sm text-gray-500 text-center">
                No commitment required. Secure and confidential.
              </p>

            </form>
          </div>

        </div>
      </section>

      {/* ================= DIRECT CONTACT ================= */}
      <section className="py-24 bg-white text-center">
        <h3 className="text-2xl font-semibold">
          Prefer Direct Coordination?
        </h3>

        <p className="mt-4 text-gray-600">
          Reach out directly for faster scheduling.
        </p>

        <div className="mt-8 space-y-2 text-gray-800">
          <p><strong>Phone:</strong> +91 7801049830</p>
          <p><strong>Email:</strong> harikiran.dev.schooldb@gmail.com</p>
        </div>

        <a
          href="https://wa.me/917801049830"
          target="_blank"
          className="mt-8 inline-block bg-green-500 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:bg-green-600 transition"
        >
          Chat on WhatsApp
        </a>
      </section>

    </main>
  );
}