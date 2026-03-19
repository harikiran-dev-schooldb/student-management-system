"use client";
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
    <fieldset className="flex flex-col gap-7">

      {/* Phone Input */}
      <div className="flex flex-col gap-2.5">
        <input
          type="tel"
          inputMode="numeric"
          value={phoneNumber}
          onChange={(e) =>
            setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
          }
          placeholder="Enter mobile number"
          disabled={isSending || pendingVerification}
          className="
            w-full px-4 py-4
            rounded-xl
            border border-zinc-200 dark:border-zinc-700
            bg-white dark:bg-zinc-900
            text-zinc-900 dark:text-white
            placeholder-zinc-400
            focus:outline-none focus:ring-2 focus:ring-blue-500/70
            transition
          "
        />

        {/* Resend */}
        {pendingVerification && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSendOTP}
              disabled={isSending || resendTimer > 0}
              className="
                text-xs font-medium
                text-blue-600 dark:text-blue-400
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
          </div>
        )}
      </div>

      {/* OTP Section */}
      {pendingVerification && (
        <div className="flex flex-col gap-3 mt-1">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Enter the 6-digit code sent to your Whatsapp number
          </p>

          <input
            ref={otpInputRef}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otpCode}
            onChange={(e) =>
              setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="••••••"
            className="
              w-full px-4 py-4
              text-xl font-semibold tracking-[0.4em] text-center
              rounded-2xl
              border border-zinc-200 dark:border-zinc-700
              bg-white dark:bg-zinc-900
              text-zinc-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500
              transition
            "
          />
        </div>
      )}
    </fieldset>
  );
};

export default OTPLogin;