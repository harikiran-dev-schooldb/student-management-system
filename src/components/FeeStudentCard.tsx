"use client";

import { useState } from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { toast } from "react-toastify";

export default function FeeStudentCard({ item, slug, dueAmount, paidAmount }: any) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const handleCollect = () => {
        router.push(`/${slug}/list/fees/collect/${item.id}`);
    };

    const handleCancel = () => {
        // ✅ Custom confirm (better than window.confirm later upgrade)
        const confirm = window.confirm(
            "Cancel this payment?\n\nThis will revert the fee."
        );

        if (!confirm) return;

        let cancelled = false;

        const toastId = toast.info(
            <div className="flex items-center justify-between gap-4">
                <span>Payment cancelled</span>

                <button
                    onClick={() => {
                        cancelled = true;
                        toast.dismiss(toastId);
                        toast.success("Undo successful");
                        // 👉 call restore API here
                    }}
                    className="text-indigo-600 font-semibold hover:underline"
                >
                    Undo
                </button>
            </div>,
            {
                autoClose: 4000,
                closeOnClick: false,
            }
        );

        // 🔥 Delay actual cancel API (real undo logic)
        setTimeout(() => {
            if (!cancelled) {
                router.push(`/${slug}/list/fees/cancel/${item.id}`);
            }
        }, 4000);
    };

    return (
        <>
            {/* CARD */}
            <div
                onClick={() => setOpen(true)}
                className="group relative flex items-center p-3 rounded-xl border-2 cursor-pointer bg-white dark:bg-darkfg border-slate-200 dark:border-slate-800 hover:border-indigo-400 shadow-sm hover:shadow-md transition"
            >
                {/* Avatar */}
                <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 bg-slate-100">
                    {item.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{item.name}</p>
                    <p className="text-xs text-slate-500">ID: {item.admissionNo}</p>
                    <p className="text-xs text-slate-400 truncate">
                        Due: ₹{dueAmount}
                    </p>
                </div>

                {/* Status */}
                <div
                    className={clsx(
                        "text-xs font-bold",
                        dueAmount === 0 ? "text-emerald-500" : "text-rose-500"
                    )}
                >
                    {dueAmount === 0 ? "Paid" : "Due"}
                </div>
            </div>

            {/* 🔥 ACTION MODAL */}
            {open && (
                <div className="fixed inset-0 z-50 flex justify-center items-end bg-black/40">

                    <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-t-2xl p-5 animate-in slide-in-from-bottom duration-300">

                        {/* Handle */}
                        <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto mb-4" />

                        {/* Title */}
                        <h2 className="text-lg font-semibold text-center mb-4">
                            {item.name}
                        </h2>

                        {/* Due */}
                        <p className="text-center text-sm text-slate-500 mb-4">
                            ₹{dueAmount} pending
                        </p>

                        {/* Actions */}
                        <div className="space-y-3">

                            {/* ✅ COLLECT */}
                            {dueAmount > 0 && (
                                <button
                                    onClick={handleCollect}
                                    className="w-full group flex items-center justify-center gap-2 py-3 rounded-xl font-semibold
      bg-gradient-to-r from-emerald-500 to-emerald-600
      hover:from-emerald-600 hover:to-emerald-700
      text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                                >
                                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                                    Collect Fees
                                </button>
                            )}

                            {/* ❌ CANCEL */}
                            {paidAmount > 0 && (
                                <button
                                    onClick={handleCancel}
                                    className="w-full group flex items-center justify-center gap-2 py-3 rounded-xl font-semibold
      bg-gradient-to-r from-rose-500 to-rose-600
      hover:from-rose-600 hover:to-rose-700
      text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                                >
                                    <RotateCcw className="w-4 h-4 group-hover:-rotate-12 transition" />
                                    Cancel Payment
                                </button>
                            )}

                        </div>

                        {/* Close */}
                        <button
                            onClick={() => setOpen(false)}
                            className="mt-4 w-full text-sm text-slate-400"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}