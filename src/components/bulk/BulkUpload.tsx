"use client";

import { useState, useRef, DragEvent } from "react";
import Papa from "papaparse";
import { UploadCloud, Loader2 } from "lucide-react";

type BulkUploadProps<T> = {
  endpoint: string;
  title: string;
  templateUrl: string;
  validateRow?: (row: T, index: number) => string | null;
};

export default function BulkUpload<T>({
  endpoint,
  title,
  templateUrl,
  validateRow,
}: BulkUploadProps<T>) {
  const [rows, setRows] = useState<T[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setFileName(file.name);

    Papa.parse<T>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data as T[];
        const err: string[] = [];

        parsed.forEach((row, i) => {
          const msg = validateRow?.(row, i);
          if (msg) err.push(msg);
        });

        setErrors(err);
        setRows(parsed);
      },
    });
  };

  const handleUpload = async () => {
    setLoading(true);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify({ rows }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data.errors?.length) setErrors(data.errors);
      else alert("Upload successful");

    } catch {
      setErrors(["Upload failed"]);
    }

    setLoading(false);
  };

  return (
    <div>
      <h1>{title}</h1>

      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        hidden
        onChange={(e) => e.target.files && processFile(e.target.files[0])}
      />

      <button onClick={() => inputRef.current?.click()}>
        <UploadCloud /> Upload CSV
      </button>

      {rows.length > 0 && (
        <button onClick={handleUpload} disabled={loading}>
          {loading ? <Loader2 /> : `Import ${rows.length}`}
        </button>
      )}

      {errors.map((e, i) => (
        <p key={i}>{e}</p>
      ))}
    </div>
  );
}