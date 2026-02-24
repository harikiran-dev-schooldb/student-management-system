"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link href="/" className="text-xl font-semibold tracking-tight">
          <span className="text-gray-900">School</span>
          <span className="text-indigo-600">DB</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/features" className="text-gray-600 hover:text-indigo-600 transition">
            Features
          </Link>

          <Link href="/platform" className="text-gray-600 hover:text-indigo-600 transition">
            Platform
          </Link>

          <Link href="/pricing" className="text-gray-600 hover:text-indigo-600 transition">
            Pricing
          </Link>

          <Link
            href="/demo"
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-full hover:bg-indigo-700 transition shadow-md"
          >
            Get Demo
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-4">
          <Link href="/features" className="block text-gray-700">
            Features
          </Link>
          <Link href="/platform" className="block text-gray-700">
            Platform
          </Link>
          <Link href="/pricing" className="block text-gray-700">
            Pricing
          </Link>
          <Link
            href="/demo"
            className="block bg-indigo-600 text-white px-4 py-2 rounded-full text-center"
          >
            Get Demo
          </Link>
        </div>
      )}
    </header>
  );
}