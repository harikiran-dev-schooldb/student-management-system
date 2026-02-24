export const metadata = {
  title: "Pricing | School DB",
  description:
    "Transparent, per-student pricing for School DB. Scalable plans designed for modern institutions.",
};

export default function Pricing() {
  return (
    <main className="bg-white text-gray-900">

      {/* ================= HERO ================= */}
      <section className="py-28 bg-gradient-to-b from-white to-slate-100 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl font-bold leading-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-6 text-xl text-gray-600">
            Pay only for the number of students enrolled.
            No hidden fees. No complex tiers.
          </p>
        </div>
      </section>

      {/* ================= PRICING CARDS ================= */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">

          {/* Basic Plan */}
          <div className="bg-white border border-gray-200 rounded-3xl p-10 shadow-lg hover:shadow-2xl transition">
            <h3 className="text-xl font-semibold">Essential</h3>
            <p className="mt-4 text-4xl font-bold text-indigo-600">
              ₹150
            </p>
            <p className="text-sm text-gray-500 mt-1">
              per student / year
            </p>

            <ul className="mt-8 space-y-3 text-gray-600 text-sm">
              <li>✔ Student Management</li>
              <li>✔ Attendance Tracking</li>
              <li>✔ Exams & Results</li>
              <li>✔ Basic Reports</li>
            </ul>

            <a
              href="/demo"
              className="mt-10 block text-center bg-indigo-600 text-white py-3 rounded-full hover:bg-indigo-700 transition"
            >
              Get Started
            </a>
          </div>

          {/* Growth Plan */}
          <div className="bg-indigo-600 text-white rounded-3xl p-10 shadow-2xl scale-105">
            <h3 className="text-xl font-semibold">Growth</h3>
            <p className="mt-4 text-4xl font-bold">
              ₹225
            </p>
            <p className="text-sm text-indigo-100 mt-1">
              per student / year
            </p>

            <ul className="mt-8 space-y-3 text-indigo-100 text-sm">
              <li>✔ Everything in Essential</li>
              <li>✔ Financial Management</li>
              <li>✔ Role-Based Access Control</li>
              <li>✔ Advanced Reports</li>
              <li>✔ Priority Support</li>
            </ul>

            <a
              href="/demo"
              className="mt-10 block text-center bg-white text-indigo-600 py-3 rounded-full font-medium hover:bg-gray-100 transition"
            >
              Most Popular
            </a>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white border border-gray-200 rounded-3xl p-10 shadow-lg hover:shadow-2xl transition">
            <h3 className="text-xl font-semibold">Enterprise</h3>
            <p className="mt-4 text-4xl font-bold text-indigo-600">
              ₹300
            </p>
            <p className="text-sm text-gray-500 mt-1">
              per student / year
            </p>

            <ul className="mt-8 space-y-3 text-gray-600 text-sm">
              <li>✔ Everything in Growth</li>
              <li>✔ Multi-Campus Support</li>
              <li>✔ Custom Workflows</li>
              <li>✔ Dedicated Assistance</li>
              <li>✔ Early Access Features</li>
            </ul>

            <a
              href="/demo"
              className="mt-10 block text-center bg-indigo-600 text-white py-3 rounded-full hover:bg-indigo-700 transition"
            >
              Contact Sales
            </a>
          </div>

        </div>
      </section>

      {/* ================= EXAMPLE CALCULATION ================= */}
      <section className="py-24 bg-slate-50 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold">
            What Does This Mean For Your School?
          </h2>

          <p className="mt-6 text-gray-600 text-lg">
            Example: A school with 500 students on the Growth plan
            would pay ₹112,500 per year (₹225 × 500 students).
          </p>

          <p className="mt-4 text-gray-500 text-sm">
            Scales automatically with your enrollment strength.
          </p>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-32 bg-indigo-600 text-white text-center">
        <h2 className="text-4xl font-bold">
          Ready to Modernize Your Institution?
        </h2>

        <p className="mt-6 text-indigo-100 text-lg">
          Schedule a personalized demo and get a tailored pricing estimate.
        </p>

        <a
          href="/demo"
          className="mt-10 inline-block bg-white text-indigo-600 px-10 py-4 rounded-full font-semibold shadow-lg hover:bg-gray-100 transition"
        >
          Schedule Demo
        </a>
      </section>

    </main>
  );
}