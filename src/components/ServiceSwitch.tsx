"use client";

import { useState } from "react";

type Props = {
  studentId: string;
  type: "transportRequired" | "hostelRequired";
  value: boolean;
  slug: string;
};

const ServiceSwitch = ({ studentId, type, value, slug }: Props) => {
  const [enabled, setEnabled] = useState(value);

  const [loading, setLoading] = useState(false);

  const updateValue = async (checked: boolean) => {
    try {
      setLoading(true);

      /* Optimistic Update */
      setEnabled(checked);

      const res = await fetch(`/api/v1/tenants/${slug}/students/services`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          studentId,
          [type]: checked,
        }),
      });

      if (!res.ok) {
        /* Rollback */
        setEnabled(!checked);
      }
    } catch (error) {
      /* Rollback */
      setEnabled(!checked);

      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        checked={enabled}
        disabled={loading}
        onChange={(e) => updateValue(e.target.checked)}
        className="peer sr-only"
      />

      <div className="h-6 w-11 rounded-full bg-gray-300 transition-all peer-checked:bg-indigo-600 peer-disabled:opacity-50"></div>

      <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-all peer-checked:translate-x-5"></div>
    </label>
  );
};

export default ServiceSwitch;
