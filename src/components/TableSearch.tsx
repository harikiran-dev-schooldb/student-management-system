"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function TableSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");

  /* -------------------------------------------------
     Debounce input (500ms)
  --------------------------------------------------*/
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  /* -------------------------------------------------
     Sync debounced value to URL (?search=)
  --------------------------------------------------*/
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (debouncedValue) {
      params.set("search", debouncedValue);
    } else {
      params.delete("search");
    }

    router.push(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });
  }, [debouncedValue, router]);

  /* -------------------------------------------------
     Ctrl+F / Cmd+F → focus table search
  --------------------------------------------------*/
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="
        relative flex items-center gap-2
        w-full md:w-auto
        rounded-full border border-gray-300
        pl-4 pr-2
        focus-within:ring-2 focus-within:ring-LamaSky
      "
    >
      <img src="/search.png" alt="Search" width={14} height={14} />

      <input
        ref={inputRef}
        type="text"
        placeholder="Search…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="
          w-[200px] md:w-auto
          p-2 bg-transparent outline-none
          text-sm text-gray-500 dark:text-white
        "
      />
    </form>
  );
}
