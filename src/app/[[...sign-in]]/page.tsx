"use client";

import { useSignIn, useUser, useSession } from "@clerk/nextjs";
import { useRouter, redirect } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  School,
  Banknote,
  CalendarCheck,
  GraduationCap,
  FileSpreadsheet,
  Users,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { toast, Toaster } from "sonner";

import PasswordLogin from "@/components/auth/PasswordLogin";
import OTPLogin from "@/components/auth/OTPLogin";
import LoginMethodToggle from "@/components/auth/LoginMethodToggle";
import Spinner from "@/components/ui/Spinner";

// --- Features aligned with your Student Management System README ---
const FEATURES = [
  {
    title: "Student Enrollment",
    desc: "Centralized CRUD operations to manage student profiles, contacts, and academic history.",
    icon: Users,
    color: "bg-orange-500",
  },
  {
    title: "Fee Management",
    desc: "Track payments, manage ledgers, and generate invoices with seamless financial tracking.",
    icon: Banknote,
    color: "bg-emerald-500",
  },
  {
    title: "Smart Attendance",
    desc: "Digitize daily records with one-click attendance tracking for students and staff.",
    icon: CalendarCheck,
    color: "bg-blue-500",
  },
  {
    title: "Exam & Grading",
    desc: "Input marks, calculate GPAs automatically, and generate comprehensive performance reports.",
    icon: GraduationCap,
    color: "bg-violet-500",
  },
];

export default function Page() {
  if (process.env.NEXT_PUBLIC_DISABLE_AUTH === "true") {
    redirect("/");
  }

  // --- Auth & Theme Hooks ---
  const { isLoaded: isUserLoaded, isSignedIn, user } = useUser();
  const { isLoaded: isSignInLoaded, signIn, setActive } = useSignIn();
  const { isLoaded: isSessionLoaded } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // --- State ---
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("otp");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  // Track if we have already triggered a redirect to prevent double execution
  const [hasRedirected, setHasRedirected] = useState(false);

  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % FEATURES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  /* ---------------- Session Logic ---------------- */
  useEffect(() => {
    if (!isUserLoaded || !isSessionLoaded || hasRedirected) return;

    if (isSignedIn && user) {
      const role = user.publicMetadata?.role as string | undefined;

      if (role) {
        toast.success(`Welcome back, ${user.firstName}!`);
        setHasRedirected(true); // Prevent multiple redirect attempts

        // ✅ FIX: Small timeout allows toast to render before navigation cuts it off
        setTimeout(() => {
          router.replace(`/${role}`);
        }, 100);
      } else {
        // Only show error if we haven't already tried to redirect
        if (!hasRedirected) toast.error("User role not found. Contact Admin.");
      }
    }
  }, [isUserLoaded, isSessionLoaded, isSignedIn, user, router, hasRedirected]);

  useEffect(() => {
    if (pendingVerification) otpInputRef.current?.focus();
  }, [pendingVerification]);

  useEffect(() => {
    if (resendTimer === 0) return;
    const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  useEffect(() => {
    const savedPhone = localStorage.getItem("rememberedPhone");
    if (savedPhone) setPhoneNumber(savedPhone);
  }, []);

  useEffect(() => {
    if (rememberMe) localStorage.setItem("rememberedPhone", phoneNumber);
    else localStorage.removeItem("rememberedPhone");
  }, [phoneNumber, rememberMe]);

  /* ---------------- Handlers ---------------- */
  const handleSendOTP = async () => {
    if (!isSignInLoaded || !signIn) return;
    try {
      setIsSending(true);
      const result = await signIn.create({
        identifier: `+91${phoneNumber}`,
        strategy: "phone_code",
      });
      if (result.status === "needs_first_factor") {
        setPendingVerification(true);
        setResendTimer(30);
        toast.success("OTP sent to your phone.");
      } else {
        throw new Error("OTP generation failed.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to send OTP.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSignIn = async () => {
    if (!isSignInLoaded || !signIn) return;
    try {
      setIsSending(true);

      if (loginMethod === "password") {
        const result = await signIn.create({
          identifier: `+91${phoneNumber}`,
          password,
        });
        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          // ❌ REMOVED: router.refresh() - This was conflicting with the redirect
          return;
        }
        toast.error("Invalid credentials.");
        return;
      }

      if (!pendingVerification) {
        toast.error("Please request an OTP first.");
        return;
      }
      const result = await signIn.attemptFirstFactor({
        strategy: "phone_code",
        code: otpCode,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        // ❌ REMOVED: router.refresh() - This was conflicting with the redirect
        return;
      }
      toast.error("Invalid OTP.");
    } catch (err: any) {
      toast.error(err?.message || "Sign-in failed.");
    } finally {
      setIsSending(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-darkMode font-sans transition-colors duration-300">
      <Toaster position="top-center" richColors />

      {/* --- LEFT SIDE: Login Form --- */}
      <div className="relative flex w-full flex-col justify-center px-4 lg:w-[45%] lg:px-12 xl:px-24 bg-white dark:bg-darkMode z-10">
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-20">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm hover:bg-zinc-100 dark:border-zinc-800 dark:bg-darkMode dark:text-white dark:hover:bg-zinc-800 transition-all"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black shadow-lg">
                <School className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                v1.0.0
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Kotak Salesian School
            </h1>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (loginMethod === "otp" && !pendingVerification)
                handleSendOTP();
              else handleSignIn();
            }}
            className={loginMethod === "otp" ? "space-y-3" : "space-y-6"}
          >
            {/* Toggle */}

            <div className="rounded-xl bg-white justify-center items-center dark:bg-darkMode">
              <LoginMethodToggle
                loginMethod={loginMethod}
                setLoginMethod={setLoginMethod}
                setPendingVerification={setPendingVerification}
                setError={(msg) => {
                  if (!msg || msg.trim() === "") {
                    toast.dismiss(); // This removes the red box immediately
                  } else {
                    toast.error(msg);
                  }
                }}
              />
            </div>

            {/* Inputs Container */}
            <motion.div
              layout
              className={`relative overflow-hidden ${
                loginMethod === "otp" ? "min-h-0" : "min-h-[140px]"
              }`}
            >
              <AnimatePresence mode="wait">
                {loginMethod === "password" ? (
                  <motion.div
                    key="pass"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PasswordLogin
                      phoneNumber={phoneNumber}
                      password={password}
                      setPhoneNumber={setPhoneNumber}
                      setPassword={setPassword}
                      rememberMe={rememberMe}
                      setRememberMe={setRememberMe}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              layout
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isSending}
              className="group relative w-full overflow-hidden rounded-xl bg-zinc-900 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              <div className="flex items-center justify-center gap-2">
                {isSending && <Spinner />}
                {loginMethod === "password"
                  ? "Sign In"
                  : pendingVerification
                  ? "Verify & Login"
                  : "Send OTP"}
                {!isSending && (
                  <ChevronRight
                    size={16}
                    className="opacity-50 group-hover:translate-x-1 transition-transform"
                  />
                )}
              </div>
            </motion.button>
          </form>

          {/* Footer Info */}
          <div className="mt-12 border-t border-zinc-100 dark:border-zinc-800 pt-6">
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-400">
                Powered by{" "}
                <span className="font-medium text-zinc-600 dark:text-zinc-300">
                  Next.js & Prisma
                </span>
              </p>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <ShieldCheck size={14} className="text-emerald-500" />
                Secure Connection
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- RIGHT SIDE: Dashboard Showcase --- */}
      <div className="hidden relative w-[55%] items-center justify-center overflow-hidden bg-[#050505] lg:flex">
        {/* Background Gradients */}
        <div className="absolute top-[0%] right-[0%] h-[300px] w-[300px] rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="absolute bottom-[0%] left-[0%] h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150" />

        {/* Floating Icons */}
        <FloatingIcon
          icon={Banknote}
          delay={0}
          x={-200}
          y={-180}
          size={36}
          color="text-emerald-500"
        />
        <FloatingIcon
          icon={GraduationCap}
          delay={2}
          x={220}
          y={-120}
          size={40}
          color="text-violet-500"
        />
        <FloatingIcon
          icon={FileSpreadsheet}
          delay={4}
          x={-220}
          y={150}
          size={32}
          color="text-blue-400"
        />
        <FloatingIcon
          icon={Users}
          delay={1}
          x={180}
          y={220}
          size={34}
          color="text-orange-500"
        />

        {/* Carousel Content */}
        <div className="relative z-10 max-w-lg px-8 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFeature}
              initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              {/* Feature Icon */}
              <div
                className={`mb-8 flex h-24 w-24 items-center justify-center rounded-3xl ${FEATURES[currentFeature].color} shadow-2xl ring-4 ring-white/5 backdrop-blur-md`}
              >
                <IconRenderer
                  icon={FEATURES[currentFeature].icon}
                  className="h-10 w-10 text-white"
                />
              </div>

              <h2 className="mb-4 text-4xl font-bold tracking-tight text-white">
                {FEATURES[currentFeature].title}
              </h2>
              <p className="text-lg leading-relaxed text-zinc-400">
                {FEATURES[currentFeature].desc}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Indicators */}
          <div className="mt-16 flex justify-center gap-3">
            {FEATURES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentFeature(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx === currentFeature
                    ? "w-12 bg-white"
                    : "w-2 bg-zinc-800 hover:bg-zinc-700"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---
const IconRenderer = ({
  icon: Icon,
  className,
}: {
  icon: any;
  className: string;
}) => {
  return <Icon className={className} />;
};

const FloatingIcon = ({ icon: Icon, delay, x, y, size, color }: any) => {
  return (
    <motion.div
      animate={{
        y: [y, y - 25, y],
        rotate: [0, 10, -10, 0],
        opacity: [0.2, 0.6, 0.2],
      }}
      transition={{
        duration: 7,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      }}
      className={`absolute ${color} blur-[0.5px]`}
      style={{
        left: "50%",
        top: "50%",
        x,
        marginLeft: -size / 2,
        marginTop: -size / 2,
      }}
    >
      <Icon size={size} />
    </motion.div>
  );
};
