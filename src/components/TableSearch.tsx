"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const TableSearch = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null); // Reference to input
  const [value, setValue] = useState(""); // tracks input field
  const [debouncedValue, setDebouncedValue] = useState(""); // delayed value

  // Whenever 'value' changes, we wait 500ms, then update 'debouncedValue'
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, 500); // 500 ms delay

    // Clear the timer if the user types again within the delay
    return () => clearTimeout(handler);
  }, [value]);

  // When debouncedValue changes, update the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (debouncedValue) {
      params.set("search", debouncedValue);
    } else {
      params.delete("search");
    }
    router.push(`${window.location.pathname}?${params}`);
  }, [debouncedValue]);

  // Keyboard shortcut (Ctrl+K or Cmd+K) to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault(); // Prevent default behavior (browser search)
        inputRef.current?.focus(); // Focus the input field
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup the event listener when the component is unmounted
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <form
      className="relative w-full md:w-auto flex items-center rounded-full border border-gray-300 pl-4 pr-2 gap-2 focus-within:ring-2 focus-within:ring-LamaSky focus-within:outline-none"
      onSubmit={(e) => e.preventDefault()}
    >
      <img src="/search.png" alt="Search" width={14} height={14} />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search..."
        className="w-[200px] md:w-auto p-2 bg-transparent outline-none text-sm text-gray-500 dark:text-white"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
};

export default TableSearch;
