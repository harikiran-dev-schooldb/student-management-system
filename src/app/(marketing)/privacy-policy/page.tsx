export const metadata = {
  title: "Privacy Policy | School DB",
  description:
    "Privacy Policy for School DB. Learn how we collect, use, and protect your data.",
};

export default function PrivacyPolicy() {
  return (
    <main className="bg-white text-gray-900">

      {/* ================= HERO ================= */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-100 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl font-bold leading-tight">
            Privacy Policy
          </h1>
          <p className="mt-4 text-gray-600">
            Your privacy is important to us. This page explains how School DB
            collects, uses, and protects your information.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Effective Date: March 31, 2026
          </p>
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6 space-y-10 text-gray-700">

          {/* Section */}
          <div>
            <h2 className="text-xl font-semibold">1. Information We Collect</h2>
            <p className="mt-2">
              We may collect personal information such as name, email address,
              phone number, and institutional data (students, staff, attendance,
              and academic records).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">2. Usage Data</h2>
            <p className="mt-2">
              We collect information such as device type, operating system,
              IP address, and app usage data to improve performance and user experience.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">3. Financial Information</h2>
            <p className="mt-2">
              Payments are processed through secure third-party providers like
              Razorpay or Cashfree. We do not store sensitive payment details such
              as card numbers.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">4. How We Use Data</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>To provide and maintain services</li>
              <li>To manage school data and operations</li>
              <li>To process payments</li>
              <li>To improve application performance</li>
              <li>To provide support</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold">5. Third-Party Services</h2>
            <p className="mt-2">
              We may use third-party services such as payment gateways and analytics
              providers. These services have their own privacy policies governing
              data usage.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">6. Data Security</h2>
            <p className="mt-2">
              We take appropriate measures to protect your data. However, no method
              of transmission over the internet is completely secure.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">7. Data Retention</h2>
            <p className="mt-2">
              We retain data only as long as necessary to provide our services
              or comply with legal obligations.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">8. Children's Privacy</h2>
            <p className="mt-2">
              School DB is intended for use by educational institutions. Student
              data is managed by authorized administrators.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">9. Changes to This Policy</h2>
            <p className="mt-2">
              We may update this Privacy Policy from time to time. Updates will
              be posted on this page.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">10. Contact Us</h2>
            <p className="mt-2">
              If you have any questions, contact us at:
            </p>
            <p className="mt-1 font-medium">
              harikiran.dev.schooldb@gmail.com
            </p>
          </div>

        </div>
      </section>

    </main>
  );
}