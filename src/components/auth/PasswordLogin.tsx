// components/auth/PasswordLogin.tsx
import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  phoneNumber: string;
  password: string;
  setPhoneNumber: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  rememberMe: boolean;
  setRememberMe: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function PasswordLogin({
  phoneNumber,
  password,
  setPhoneNumber,
  setPassword,
  rememberMe,
  setRememberMe,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedPhone = localStorage.getItem("rememberedPhone");
    if (savedPhone) setPhoneNumber(savedPhone);
  }, []);

  useEffect(() => {
    if (rememberMe) {
      localStorage.setItem("rememberedPhone", phoneNumber);
    } else {
      localStorage.removeItem("rememberedPhone");
    }
  }, [phoneNumber, rememberMe]);

  return (
    <fieldset className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="phoneNumber"
          className="text-sm font-medium text-zinc-950  dark:text-white"
        >
          Mobile Number
        </label>
        <input
          type="tel"
          id="phoneNumber"
          autoComplete="tel"
          value={phoneNumber}
          placeholder="Enter 10-digit mobile number"
          onChange={(e) => setPhoneNumber(e.target.value)}
          className=" dark:bg-[#121727] w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex flex-col gap-2 relative">
        <label
          htmlFor="password"
          className="text-sm font-medium text-zinc-950 dark:text-white "
        >
          Password
        </label>
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          autoComplete="current-password"
          value={password}
          placeholder="Enter password"
          onChange={(e) => setPassword(e.target.value)}
          className="dark:bg-[#121727] w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="mr-2 dark:bg-[#121727]"
        />
        <label className="text-sm text-zinc-600 dark:text-zinc-300">
          Remember Me
          </label>
      </div>
    </fieldset>
  );
}
