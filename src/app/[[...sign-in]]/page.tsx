"use client";

import { useSignIn, useUser, useSession } from "@clerk/nextjs";
import { useRouter, redirect } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import PasswordLogin from "@/components/auth/PasswordLogin";
import OTPLogin from "@/components/auth/OTPLogin";
import LoginMethodToggle from "@/components/auth/LoginMethodToggle";
import ErrorMessage from "@/components/auth/ErrorMessage";
import Spinner from "@/components/ui/Spinner";

export default function Page() {
  if (process.env.NEXT_PUBLIC_DISABLE_AUTH === "true") {
    redirect("/");
  }

  const { isLoaded: isUserLoaded, isSignedIn, user } = useUser();
  const { isLoaded: isSignInLoaded, signIn, setActive } = useSignIn();
  const { isLoaded: isSessionLoaded } = useSession();
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("otp");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const otpInputRef = useRef<HTMLInputElement>(null);

  /* ---------------- Session Check ---------------- */
  useEffect(() => {
    if (!isUserLoaded || !isSessionLoaded) return;

    setIsLoading(false);

    if (isSignedIn && user) {
      const role = user.publicMetadata?.role as string | undefined;
      if (role) router.replace(`/${role}`);
      else setError("User role not found.");
    }
  }, [isUserLoaded, isSessionLoaded, isSignedIn, user, router]);

  /* ---------------- OTP Focus ---------------- */
  useEffect(() => {
    if (pendingVerification) otpInputRef.current?.focus();
  }, [pendingVerification]);

  /* ---------------- OTP Timer ---------------- */
  useEffect(() => {
    if (resendTimer === 0) return;

    const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);

    return () => clearTimeout(timer);
  }, [resendTimer]);

  /* ---------------- Remember Me ---------------- */
  useEffect(() => {
    const savedPhone = localStorage.getItem("rememberedPhone");
    if (savedPhone) setPhoneNumber(savedPhone);
  }, []);

  useEffect(() => {
    if (rememberMe) localStorage.setItem("rememberedPhone", phoneNumber);
    else localStorage.removeItem("rememberedPhone");
  }, [phoneNumber, rememberMe]);

  /* ---------------- Send OTP ---------------- */
  const handleSendOTP = async () => {
    setError("");

    if (!isSignInLoaded || !signIn) {
      setError("Sign-in service not available.");
      return;
    }

    try {
      setIsSending(true);

      const result = await signIn.create({
        identifier: `+91${phoneNumber}`,
        strategy: "phone_code",
      });

      if (result.status === "needs_first_factor") {
        setPendingVerification(true);
        setResendTimer(30);
      } else {
        throw new Error("OTP generation failed.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to send OTP.");
    } finally {
      setIsSending(false);
    }
  };

  /* ---------------- Verify / Password Sign-In ---------------- */
  const handleSignIn = async () => {
    setError("");

    if (!isSignInLoaded || !signIn) {
      setError("Sign-in service not available.");
      return;
    }

    try {
      setIsSending(true);

      /* ---------- PASSWORD LOGIN ---------- */
      if (loginMethod === "password") {
        const result = await signIn.create({
          identifier: `+91${phoneNumber}`,
          password,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.replace("/");
          return;
        }

        setError("Invalid phone number or password.");
        return; // ✅ REQUIRED
      }

      /* ---------- OTP LOGIN ---------- */
      if (!pendingVerification) {
        setError("Please request an OTP first.");
        return;
      }

      if (otpCode.length !== 6) {
        setError("OTP must be 6 digits.");
        return;
      }

      const result = await signIn.attemptFirstFactor({
        strategy: "phone_code",
        code: otpCode,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/");
        return;
      }

      setError("Invalid OTP.");
    } catch (err: any) {
      setError(err?.message || "Sign-in failed.");
    } finally {
      setIsSending(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-br 
  from-[#0f172a] via-[#020617] to-black 
  dark:from-black dark:via-[#020617] dark:to-black px-4"
    >
      <div
        className="w-full max-w-md rounded-3xl border border-white/10 
    bg-white/90 dark:bg-[#0b1220]/90 
    backdrop-blur-xl shadow-2xl p-8"
      >
        {/* Header */}
        <header className="text-center mb-8">
          <img
            src="/logo.png"
            className="mx-auto h-20 w-20 rounded-full shadow-md mb-4"
            alt="Kotak Salesian School"
          />
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
            Kotak Salesian School
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Secure Login Portal
          </p>
        </header>

        {/* Error */}
        <ErrorMessage message={error} />

        <form
          onSubmit={(e) => {
            e.preventDefault();

            if (loginMethod === "otp" && !pendingVerification) {
              handleSendOTP();
            } else {
              handleSignIn();
            }
          }}
        >
          {/* Login Method */}
          <LoginMethodToggle
            loginMethod={loginMethod}
            setLoginMethod={setLoginMethod}
            setPendingVerification={setPendingVerification}
            setError={setError}
          />

          {/* Inputs */}
          {loginMethod === "password" ? (
            <PasswordLogin
              phoneNumber={phoneNumber}
              password={password}
              setPhoneNumber={setPhoneNumber}
              setPassword={setPassword}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
            />
          ) : (
            <OTPLogin
              phoneNumber={phoneNumber}
              otpCode={otpCode}
              setPhoneNumber={setPhoneNumber}
              setOtpCode={setOtpCode}
              pendingVerification={pendingVerification}
              otpInputRef={otpInputRef}
              isSending={isSending}
              resendTimer={resendTimer}
              handleSendOTP={handleSendOTP}
            />
          )}

          {/* Submit */}
          <button
            type="submit" // ✅ REQUIRED
            disabled={isSending}
            className="mt-6 w-full rounded-xl py-3 text-sm font-semibold
      bg-gradient-to-r from-indigo-600 to-purple-600
      hover:from-indigo-500 hover:to-purple-500
      text-white shadow-lg transition-all
      disabled:opacity-60 disabled:cursor-not-allowed
      flex items-center justify-center gap-2"
          >
            {isSending && <Spinner />}
            {loginMethod === "password"
              ? "Sign In"
              : pendingVerification
              ? "Verify OTP"
              : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}
