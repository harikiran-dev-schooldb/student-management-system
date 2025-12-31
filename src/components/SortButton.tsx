"use client"; // Client Component

import { SortAsc, SortDesc } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

interface SortButtonProps {
  sortKey: string; // The database column to sort by
}

const SortButton: React.FC<SortButtonProps> = ({ sortKey }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Get current sort order from URL
  useEffect(() => {
    const currentSort = searchParams.get("sort");
    if (currentSort === "desc" || currentSort === "asc") {
      setSortOrder(currentSort);
    }
  }, [searchParams]);

  const handleSort = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);

    // Update URL parameters for sorting
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSortOrder);
    params.set("sortKey", sortKey); // Specify which column is being sorted
    router.push(`?${params.toString()}`);
  };

  return (
    <button
      onClick={handleSort}
      className="flex items-center justify-center w-8 h-8 rounded-full bg-LamaBlue"
      title={`Sort by ${sortKey} (${sortOrder})`}
    >
      <SortDesc className="w-4 h-4 text-white" />
    </button>
  );
};

export default SortButton;
