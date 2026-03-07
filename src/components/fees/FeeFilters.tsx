"use client";

interface Props {
  academicYears: string[];
  selectedAcademicYear: string | null;
  setSelectedAcademicYear: (year: string | null) => void;
}

export default function FeeFilters({
  academicYears,
  selectedAcademicYear,
  setSelectedAcademicYear,
}: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      <button
        onClick={() => setSelectedAcademicYear(null)}
        className={`px-3 py-1 rounded ${
          selectedAcademicYear === null
            ? "bg-slate-800 text-white"
            : "bg-white"
        }`}
      >
        All
      </button>

      {academicYears.map((y) => (
        <button
          key={y}
          onClick={() => setSelectedAcademicYear(y)}
          className={`px-3 py-1 rounded ${
            selectedAcademicYear === y
              ? "bg-slate-800 text-white"
              : "bg-white"
          }`}
        >
          {y}
        </button>
      ))}
    </div>
  );
}