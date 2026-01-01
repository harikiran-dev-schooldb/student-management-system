// components/auth/LoginMethodToggle.tsx
import React from "react";

type LoginMethod = "password" | "otp";

interface Props {
  loginMethod: LoginMethod;
  setLoginMethod: (method: LoginMethod) => void;
  setPendingVerification: (val: boolean) => void;
  setError: (val: string) => void;
}

export default function LoginMethodToggle({
  loginMethod,
  setLoginMethod,
  setPendingVerification,
  setError,
}: Props) {
  const handleToggle = (method: LoginMethod) => {
    setLoginMethod(method);
    setPendingVerification(false);
    setError("");
  };

  return (
    <div className="flex w-full rounded-xl bg-zinc-100 dark:bg-[#020617] p-1 mb-4">
      {["password", "otp"].map((method) => (
        <button
          key={method}
          type="button"
          onClick={() => handleToggle(method as LoginMethod)}
          className={`flex-1 py-2 text-sm rounded-lg transition
        ${
          loginMethod === method
            ? "bg-white dark:bg-darkMode shadow text-zinc-900 dark:text-white"
            : "text-zinc-500 dark:text-zinc-400"
        }
      `}
        >
          {method === "password" ? "Password" : "OTP Login"}
        </button>
      ))}
    </div>
  );
}
