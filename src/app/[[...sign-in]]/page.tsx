"use client";

import { useSignIn, useUser, useSession } from "@clerk/nextjs";
import { useRouter, redirect } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import PasswordLogin from "@/components/auth/PasswordLogin";
import OTPLogin from "@/components/auth/OTPLogin";
import LoginMethodToggle from "@/components/auth/LoginMethodToggle";
import ErrorMessage from "@/components/auth/ErrorMessage";

export default function Page() {
  if (process.env.NEXT_PUBLIC_DISABLE_AUTH === "true") {
    redirect("/");
  }

  const { isLoaded: isUserLoaded, isSignedIn, user } = useUser();
  const { isLoaded: isSignInLoaded, signIn } = useSignIn();
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

    const timer = setTimeout(
      () => setResendTimer((t) => t - 1),
      1000
    );

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
      if (loginMethod === "password") {
        const result = await signIn.create({
          identifier: `+91${phoneNumber}`,
          password,
        });

        if (result.status === "complete") window.location.reload();
        else setError("Invalid phone number or password.");
        return;
      }

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

      if (result.status === "complete") window.location.reload();
      else setError("Invalid OTP.");
    } catch (err: any) {
      setError(err?.message || "Sign-in failed.");
    }
  };

  /* ---------------- Loader ---------------- */
  if (isLoading || !isUserLoaded || !isSessionLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        Checking session...
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <header className="text-center mb-6">
          <img src="/logo.png" className="w-20 mx-auto mb-3" />
          <h1 className="text-xl font-semibold">Kotak Salesian School</h1>
        </header>

        <ErrorMessage message={error} />

        <LoginMethodToggle
          loginMethod={loginMethod}
          setLoginMethod={setLoginMethod}
          setPendingVerification={setPendingVerification}
          setError={setError}
        />

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

        <button
          type="button"
          onClick={
            loginMethod === "otp" && !pendingVerification
              ? handleSendOTP
              : handleSignIn
          }
          disabled={isSending}
          className="w-full mt-4 py-3 rounded-lg bg-zinc-800 text-white"
        >
          {loginMethod === "password"
            ? "Sign In"
            : pendingVerification
            ? "Verify OTP"
            : "Send OTP"}
        </button>
      </div>
    </div>
  );
}
