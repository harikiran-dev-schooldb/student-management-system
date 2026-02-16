"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { School, ShieldCheck, LogOut } from "lucide-react";

export default function LogoutPage() {
  const { signOut } = useClerk();
  const router = useRouter();
  const params = useParams();

  const schoolId = params?.schoolId as string;

  useEffect(() => {
    const signOutAndRedirect = async () => {
      try {
        await signOut();

        setTimeout(() => {
          // redirect to school-specific login
          router.replace(`/${schoolId}/login`);
        });
      } catch (err) {
        console.error("Logout failed:", err);
        router.replace(`/${schoolId}/login`);
      }
    };

    if (schoolId) {
      signOutAndRedirect();
    }
  }, [signOut, router, schoolId]);

  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-darkMode font-sans transition-colors">
      {/* LEFT SIDE */}
      <div className="relative flex w-full flex-col justify-center px-6 lg:w-[45%] xl:px-24 bg-white dark:bg-darkMode">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto w-full max-w-md text-center"
        >
          {/* Header */}
          <div className="mb-8 flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black shadow-lg">
              <School className="h-7 w-7" />
            </div>

            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              {schoolId?.toUpperCase()}
            </h1>
          </div>

          {/* Status Card */}
          <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-darkMode p-8 shadow-xl">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black"
            >
              <LogOut />
            </motion.div>

            <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
              Logging you out
            </h2>

            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Ending your session securely. Please wait…
            </p>
          </div>

          {/* Footer */}
          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-zinc-500">
            <ShieldCheck size={14} className="text-emerald-500" />
            Secure sign-out in progress
          </div>
        </motion.div>
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden relative w-[55%] lg:flex items-center justify-center bg-[#050505] overflow-hidden">
        <div className="absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[120px]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="z-10 max-w-lg text-center px-10"
        >
          <h2 className="mb-4 text-4xl font-bold text-white">
            Session Ended
          </h2>
          <p className="text-lg text-zinc-400 leading-relaxed">
            You have been safely logged out of the School Management System.
            Thank you for using our platform.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
