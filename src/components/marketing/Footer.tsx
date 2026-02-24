import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-32">
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            <span className="text-gray-900">School</span>
            <span className="text-indigo-600">DB</span>
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            A modern, multi-tenant SaaS platform built to help
            institutions operate with clarity, speed, and control.
          </p>
        </div>

        {/* Product */}
        <div>
          <h4 className="font-medium mb-4 text-gray-900">Product</h4>
          <ul className="space-y-3 text-gray-600 text-sm">
            <li><Link href="/features" className="hover:text-indigo-600">Features</Link></li>
            <li><Link href="/platform" className="hover:text-indigo-600">Platform</Link></li>
            <li><Link href="/demo" className="hover:text-indigo-600">Get Demo</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-medium mb-4 text-gray-900">Company</h4>
          <ul className="space-y-3 text-gray-600 text-sm">
            <li>About</li>
            <li>Privacy</li>
            <li>Terms</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-medium mb-4 text-gray-900">Contact</h4>
          <p className="text-sm text-gray-600">+91 7801049830</p>
          <p className="text-sm text-gray-600 mt-2">
            harikiran.dev.schooldb@gmail.com
          </p>
        </div>
      </div>

      <div className="border-t text-center text-xs text-gray-500 py-6">
        © {new Date().getFullYear()} SchoolDB. All rights reserved.
      </div>
    </footer>
  );
}