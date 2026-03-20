"use client";

export default function ReportLayout({
  title,
  description,
  actions,
  filters,
  children,
}: any) {
  return (
    <div className="flex flex-col gap-6 px-3 py-3">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-gray-500">{description}</p>
        </div>

        {actions}
      </div>

      {/* FILTER */}
      {filters}

      {/* CONTENT */}
      {children}
    </div>
  );
}