"use client";

import Menu from "./Menu";

export default function MoreMenu({
  role,
  onClose,
}: {
  role: "admin" | "teacher" | "student";
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60">
      <div className="absolute bottom-0 w-full max-h-[80%] overflow-y-auto bg-white dark:bg-gray-900 rounded-t-xl">
        
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold">More</h3>
          <button onClick={onClose} className="text-xl">✕</button>
        </div>

        <div className="pb-6">
          <Menu role={role} />
        </div>
      </div>
    </div>
  );
}
