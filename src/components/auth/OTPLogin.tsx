// components/auth/OTPLogin.tsx
import React, { Dispatch, SetStateAction, RefObject } from "react";

type Props = {
  phoneNumber: string;
  otpCode: string;
  setPhoneNumber: Dispatch<SetStateAction<string>>;
  setOtpCode: Dispatch<SetStateAction<string>>;
  pendingVerification: boolean;
  otpInputRef: RefObject<HTMLInputElement>;
  isSending: boolean;
  resendTimer: number;
  handleSendOTP: () => Promise<void>;
};

const OTPLogin = ({
  phoneNumber,
  otpCode,
  setPhoneNumber,
  setOtpCode,
  pendingVerification,
  otpInputRef,
  isSending,
  resendTimer,
  handleSendOTP,
}: Props) => {
  return (
    <fieldset className="flex flex-col gap-5">
      {/* ---------------- Mobile Number ---------------- */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="phone"
            className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Mobile Number
          </label>

          {pendingVerification && (
            <button
              type="button"
              onClick={handleSendOTP}
              disabled={isSending || resendTimer > 0}
              className="
                text-xs font-medium
                text-indigo-600 dark:text-indigo-400
                hover:underline
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isSending
                ? "Sending..."
                : resendTimer > 0
                ? `Resend in ${resendTimer}s`
                : "Resend OTP"}
            </button>
          )}
        </div>

        <input
          id="phone"
          type="tel"
          inputMode="numeric"
          pattern="\d{10}"
          value={phoneNumber}
          onChange={(e) =>
            setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
          }
          placeholder="Enter 10-digit mobile number"
          disabled={isSending || pendingVerification}
          className="dark:bg-darkMode w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
          required
        />
      </div>

      {/* ---------------- OTP Input ---------------- */}
      {pendingVerification && (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="otp"
            className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Enter OTP
          </label>

          <input
            ref={otpInputRef}
            id="otp"
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            value={otpCode}
            onChange={(e) =>
              setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="xxxxxx"
            className="
              w-full rounded-xl px-4 py-3
              text-lg font-semibold tracking-widest text-center
              bg-white dark:bg-[#020617]
              border border-zinc-300 dark:border-[#020617]
              text-zinc-900 dark:text-white
              placeholder-zinc-400 dark:placeholder-zinc-600
              focus:outline-none focus:ring-2 focus:ring-LamaSky
              transition
            "
            required
          />
        </div>
      )}
    </fieldset>
  );
};

export default OTPLogin;
