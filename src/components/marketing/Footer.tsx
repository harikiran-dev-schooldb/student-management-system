export default function Footer() {
  return (
    <footer className="border-t bg-slate-50 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-gray-600 flex flex-col md:flex-row justify-between gap-4">
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="font-medium text-gray-800">Schooldb</span>. All rights
          reserved.
        </p>

        <p className="text-gray-500">
          Smart School Management System for Principals & Management
        </p>
      </div>
    </footer>
  );
}
