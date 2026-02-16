import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          Schooldb
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">
          <Link
            href="/features"
            className="text-gray-700 hover:text-indigo-600 transition"
          >
            Features
          </Link>

          <Link
            href="/demo"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
          >
            Request Demo
          </Link>
        </div>
      </div>
    </nav>
  );
}
