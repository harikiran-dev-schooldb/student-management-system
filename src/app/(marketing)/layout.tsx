import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">

      {/* NAVBAR */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            School DB
          </Link>

          <nav className="hidden md:flex gap-8 text-sm font-medium">
            <Link href="/features" className="hover:text-indigo-600">
              Features
            </Link>
            <Link href="/demo" className="hover:text-indigo-600">
              Book Demo
            </Link>
          </nav>

          <Link
            href="/demo"
            className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-indigo-700 transition"
          >
            Get Demo
          </Link>
        </div>
      </header>

      {/* CONTENT */}
      <div className="pt-24 flex-1">{children}</div>

      {/* FOOTER */}
      <footer className="bg-slate-50 border-t mt-20">
        <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8 text-sm text-gray-600">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">School DB</h3>
            <p>
              Leadership-focused School ERP built for modern Indian schools.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/features">Features</Link></li>
              <li><Link href="/demo">Request Demo</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
            <p>+91 7801049830</p>
            <p>harikiran.dev.schooldb@gmail.com</p>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 py-4 border-t">
          © {new Date().getFullYear()} School DB. All rights reserved.
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a
        href="https://wa.me/917801049830"
        target="_blank"
        className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl hover:scale-105 transition z-50"
      >
        WhatsApp Demo
      </a>
    </div>
  );
}