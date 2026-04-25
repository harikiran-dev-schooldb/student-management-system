"use client";

import { useState } from "react";
import Script from "next/script";
import { useSchoolSlug } from "./hooks/getschool";

interface PaymentButtonProps {
  amount: number;
  studentId: number;
}

export default function PaymentButton({
  amount,
  studentId,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const schoolId = useSchoolSlug();

  const handlePayment = async () => {
    if (!amount || amount <= 0) {
      alert("Invalid amount");
      return;
    }

    setLoading(true);

    try {
      /* -------------------------------
         1️⃣ Create Order (Backend)
      -------------------------------- */
      const res = await fetch(
        `/api/v1/tenants/${schoolId}/cashfree/order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount,
            studentId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data?.payment_session_id) {
        throw new Error(data?.error || "Order creation failed");
      }

      /* -------------------------------
         2️⃣ Ensure SDK Loaded
      -------------------------------- */
      if (!(window as any).Cashfree) {
        throw new Error("Payment SDK not loaded. Refresh page.");
      }

      /* -------------------------------
         3️⃣ Init Cashfree
      -------------------------------- */
      const cashfree = (window as any).Cashfree({
        mode:
          process.env.NODE_ENV === "production"
            ? "production"
            : "sandbox",
      });

      /* -------------------------------
         4️⃣ Open Checkout
      -------------------------------- */
      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self",
      });

    } catch (error: any) {
      console.error("Payment error:", error);
      alert(error.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ✅ Load Cashfree SDK */}
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        strategy="afterInteractive"
      />

      <button
        onClick={handlePayment}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Processing..." : `Pay ₹${amount}`}
      </button>
    </>
  );
}