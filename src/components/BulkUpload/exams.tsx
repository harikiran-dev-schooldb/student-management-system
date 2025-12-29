"use client";

import { useState } from "react";
import Papa from "papaparse";
import axios from "axios";

type ExamCSV = {
  exam_title: string;
  grade_level: string;
  subject_name: string;
  exam_date: string;
  start_time: string;
  max_marks: string;
};

export default function BulkExamUpload() {
  const [rows, setRows] = useState<ExamCSV[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ----------------------------------------
     CSV Parse & Client-side Validation
  -----------------------------------------*/
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse<ExamCSV>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data;
        const err: string[] = [];

        parsed.forEach((row, index) => {
          const missing: string[] = [];

          if (!row.exam_title) missing.push("exam_title");
          if (!row.grade_level) missing.push("grade_level");
          if (!row.subject_name) missing.push("subject_name");
          if (!row.exam_date) missing.push("exam_date");
          if (!row.start_time) missing.push("start_time");
          if (!row.max_marks) missing.push("max_marks");

          if (missing.length > 0) {
            err.push(`Row ${index + 2}: missing ${missing.join(", ")}`);
          }
        });

        setErrors(err);
        setRows(parsed);
      },
    });
  };

  /* ----------------------------------------
     Upload to Server
  -----------------------------------------*/
  const handleUpload = async () => {
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      const csv = Papa.unparse(rows);
      formData.append(
        "file",
        new File([csv], "bulk_exams.csv", { type: "text/csv" })
      );

      const res = await axios.post("/api/exams/bulk", formData);

      setMessage(`Inserted: ${res.data.inserted}`);
      setErrors(
        res.data.errors?.map(
          (e: any) => `Row ${e.row}: ${JSON.stringify(e.error)}`
        ) || []
      );

      if (!res.data.errors?.length) {
        setRows([]);
      }
    } catch (err) {
      console.error(err);
      setMessage("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-900 rounded shadow">
      <h1 className="text-xl font-semibold">Bulk Upload Exams</h1>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="block w-full text-sm file:mr-4 file:py-2 file:px-4
                   file:rounded file:border-0 file:bg-blue-600 file:text-white
                   hover:file:bg-blue-700"
      />

      {errors.length > 0 && (
        <div className="p-4 text-sm text-red-700 bg-red-100 border rounded">
          <p className="font-semibold">Validation Errors</p>
          <ul className="mt-2 list-disc list-inside">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {rows.length > 0 && (
        <div className="overflow-auto border rounded max-h-96">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-gray-100">
              <tr>
                {Object.keys(rows[0]).map((key) => (
                  <th key={key} className="px-3 py-2 border-b text-left">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="even:bg-gray-50">
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="px-3 py-1 border-b">
                      {val || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={loading}
          className="px-6 py-2 bg-green-600 text-white rounded
                     hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload to Server"}
        </button>
      )}

      {message && (
        <p className="font-medium text-green-600">{message}</p>
      )}
    </div>
  );
}
