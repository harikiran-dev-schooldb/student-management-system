export const metadata = {
  title: "Features | Schooldb – Smart School Management System",
  description:
    "Explore Schooldb features designed for school principals and management to gain visibility, control, and confident decision-making across academics, operations, and finance.",
  openGraph: {
    title: "Schooldb Features",
    description:
      "A complete school management system built for principals, administrators, and leadership teams.",
    images: ["/og/features.png"],
    type: "website",
  },
};

export default function Features() {
  return (
    <main className="bg-slate-50 text-gray-900">
      {/* PAGE INTRO */}
      <section className="pt-24 pb-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold max-w-4xl">
            Features Built for School Leadership
          </h1>

          <p className="mt-6 text-lg max-w-3xl text-gray-700">
            Schooldb is designed to support principals and management teams with
            complete visibility, structured control, and reliable data across
            academics, staff operations, and financial management.
          </p>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid gap-8 md:grid-cols-2">
            <Feature
              title="Leadership Dashboard"
              text="A centralized, real-time dashboard that gives management a clear overview of students, teachers, attendance trends, and financial status—without waiting for reports."
            />

            <Feature
              title="Role-Based Access Control"
              text="Clearly defined roles for administrators and teachers ensure accountability while allowing both to manage attendance and academic records without dependency."
            />

            <Feature
              title="Student Information Management"
              text="Comprehensive student profiles that combine attendance history, academic performance, class details, and fee status in one secure system."
            />

            <Feature
              title="Teacher & Staff Management"
              text="Transparent visibility into teacher assignments, subject responsibilities, and workload distribution to support planning and performance oversight."
            />

            <Feature
              title="Attendance Management"
              text="Attendance can be recorded by both teachers and administrators, ensuring continuity, accuracy, and uninterrupted daily operations."
            />

            <Feature
              title="Attendance Analytics & Reports"
              text="Class-wise and date-wise attendance reports help leadership identify patterns early and take corrective action before issues escalate."
            />

            <Feature
              title="Marks, Exams & Results"
              text="Structured marks entry by teachers and administrators enables timely result preparation, academic analysis, and informed interventions."
            />

            <Feature
              title="Homework & Academic Coordination"
              text="Digital homework assignment improves academic consistency and strengthens communication between teachers and students."
            />

            <Feature
              title="Fees & Financial Oversight"
              text="Clear visibility into paid and pending fees with student-wise and term-wise tracking for transparent financial management."
            />

            <Feature
              title="Reports & Data Exports"
              text="Export-ready reports support audits, inspections, and management reviews with reliable, well-organized, and accurate data."
            />
          </div>
        </div>
      </section>

      {/* MANAGEMENT POSITIONING */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold max-w-3xl">
            Designed for Decisions, Not Just Data Entry
          </h2>

          <p className="mt-6 max-w-3xl text-gray-700">
            Schooldb goes beyond basic record keeping. By connecting academic,
            operational, and financial data into a single source of truth, it
            enables school leadership to identify issues early, monitor progress
            clearly, and make confident decisions without manual effort or
            dependency.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-indigo-600 text-center text-white">
        <h2 className="text-3xl font-bold">
          See These Features in Action
        </h2>

        <p className="mt-3 text-indigo-100">
          Get a personalized demo tailored to your school’s structure and
          management needs
        </p>

        <a
          href="/demo"
          className="mt-8 inline-block bg-white text-indigo-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
        >
          Request a Demo
        </a>
      </section>
    </main>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition">
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-3 text-gray-700 leading-relaxed">{text}</p>
    </div>
  );
}
