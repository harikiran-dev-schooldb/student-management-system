export const metadata = {
  title: "Features | School DB – Leadership Operating System for Schools",
  description:
    "Explore School DB features built for principals and leadership teams to gain real-time visibility, structured control, and confident decision-making across academics and finance.",
  openGraph: {
    title: "School DB Features",
    description:
      "A centralized, leadership-focused ERP platform for modern schools.",
    images: ["/og/features.png"],
    type: "website",
  },
};

export default function Features() {
  return (
    <main className="bg-white text-gray-900">

      {/* ================= HERO ================= */}
      <section className="py-32 bg-gradient-to-b from-white to-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-5xl font-bold max-w-4xl leading-tight">
            Powerful Capabilities Built for
            <br /> School Leadership
          </h1>

          <p className="mt-8 text-xl text-gray-600 max-w-3xl">
            School DB is engineered to provide principals and management teams
            with complete operational clarity, structured oversight, and
            reliable real-time data across academics, staff operations,
            and financial management.
          </p>
        </div>
      </section>

      {/* ================= FEATURE GRID ================= */}
      <section className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid gap-10 md:grid-cols-2">

          <Feature
            title="Executive Leadership Dashboard"
            text="A real-time command center that provides management with instant visibility into attendance trends, academic performance, teacher activity, and financial status."
          />

          <Feature
            title="Role-Based Governance & Access Control"
            text="Clearly structured roles ensure accountability while allowing administrators and teachers to manage their responsibilities without operational bottlenecks."
          />

          <Feature
            title="Comprehensive Student Profiles"
            text="Centralized student records combining attendance history, academic progress, class assignments, and fee status in one secure system."
          />

          <Feature
            title="Teacher & Workforce Oversight"
            text="Transparent tracking of teacher allocations, subject assignments, and workload distribution to support planning and institutional performance."
          />

          <Feature
            title="Structured Attendance Management"
            text="Accurate daily attendance marking by both teachers and administrators ensures continuity and operational reliability."
          />

          <Feature
            title="Attendance Intelligence & Pattern Analysis"
            text="Class-wise and date-wise analytics help leadership detect trends early and intervene before performance issues escalate."
          />

          <Feature
            title="Exams, Marks & Academic Analytics"
            text="Streamlined marks entry with structured result processing enables timely academic insights and data-driven interventions."
          />

          <Feature
            title="Digital Homework & Academic Coordination"
            text="Centralized homework management enhances instructional consistency and improves coordination across classes."
          />

          <Feature
            title="Financial Oversight & Fee Tracking"
            text="Transparent fee monitoring with student-wise and term-wise tracking ensures accurate revenue visibility and accountability."
          />

          <Feature
            title="Audit-Ready Reports & Data Exports"
            text="Generate inspection-ready and management-ready reports instantly without manual compilation or spreadsheet dependency."
          />

        </div>
      </section>

      {/* ================= POSITIONING SECTION ================= */}
      <section className="py-28 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold">
            Designed for Decisions — Not Just Data Entry
          </h2>

          <p className="mt-8 text-lg text-gray-600 max-w-3xl mx-auto">
            School DB integrates academic, operational, and financial
            intelligence into a single source of truth. Leadership teams
            gain early visibility into potential risks, track institutional
            performance clearly, and act with confidence.
          </p>
        </div>
      </section>

      {/* ================= PREMIUM CTA ================= */}
      <section className="py-32 bg-indigo-600 text-white text-center">
        <h2 className="text-4xl font-bold">
          Experience These Capabilities Firsthand
        </h2>

        <p className="mt-6 text-indigo-100 text-lg max-w-2xl mx-auto">
          Book a personalized leadership demo and see how School DB
          transforms operational clarity within your institution.
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

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-4 text-gray-600 leading-relaxed">{text}</p>
    </div>
  );
}