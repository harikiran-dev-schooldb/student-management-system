"use client";

import { FileSpreadsheet } from "lucide-react";

interface Props {
  selectedCount: number;
  onBulkPay: () => void;
  onExport: () => void;
}

export default function FeeActions({
  selectedCount,
  onBulkPay,
  onExport,
}: Props) {
  return (
    <div className="flex gap-3">

      {selectedCount > 0 && (
        <button
          onClick={onBulkPay}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Pay Selected ({selectedCount})
        </button>
      )}

      <button
        onClick={onExport}
        className="flex items-center gap-2"
      >
        <FileSpreadsheet size={16} />
        Export CSV
      </button>

    </div>
  );
}