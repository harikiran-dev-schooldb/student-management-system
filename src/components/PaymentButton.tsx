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
      const res = await fetch(`/api/v1/tenants/${schoolId}/razorpay/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();
      if (!data.orderId) throw new Error("Order creation failed");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: "INR",
        name: "Kotak Salesian School",
        description: "Fee Payment",
        order_id: data.orderId,
        handler: async function (response: any) {
          const verifyRes = await fetch(
            `/api/v1/tenants/${schoolId}/razorpay/verify`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderCreationId: data.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                studentId,
                amount,
              }),
            },
          );

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            alert("Payment Successful!");
            window.location.reload();
          } else {
            alert("Payment Verification Failed.");
          }
        },
        theme: { color: "#3399cc" },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Load Razorpay Script */}
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
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
