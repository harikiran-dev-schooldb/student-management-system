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
  setLoading(true);

  try {
    const res = await fetch(`/api/v1/tenants/${schoolId}/cashfree/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    const data = await res.json();

    const cashfree = (window as any).Cashfree({
      mode: "sandbox",
    });

    await cashfree.checkout({
      paymentSessionId: data.payment_session_id,
      redirectTarget: "_self",
    });

  } catch (error) {
    console.error(error);
    alert("Something went wrong.");
  } finally {
    setLoading(false);
  }
};

  return (
    <>

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
