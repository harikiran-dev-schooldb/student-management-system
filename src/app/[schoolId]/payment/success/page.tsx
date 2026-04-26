"use client";

import { useTenantApi } from "@/hooks/useTenantApi";
import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useState } from "react";

type PaymentStatusResponse = {
  status: "PENDING" | "SUCCESS" | "FAILED" | "NOT_FOUND";
};

export default function PaymentSuccessPage() {
  const params = useSearchParams();
  const routeParams = useParams();

  const orderId = params.get("order_id");
  const schoolId = routeParams.schoolId;

  const [status, setStatus] = useState("CHECKING");

  const api = useTenantApi();

  useEffect(() => {
  if (!orderId || !schoolId) return;

  let attempts = 0;
  const maxAttempts = 8;
  let interval: NodeJS.Timeout;

  const checkPayment = async () => {
    try {
      attempts++;

      const res = await fetch(
        `/api/v1/tenants/${schoolId}/cashfree/verify-payment?order_id=${orderId}`
      );

      const data = await res.json();

      console.log("VERIFY:", data);

      // ✅ SUCCESS
      if (data.status === "SUCCESS") {
        setStatus("SUCCESS");
        clearInterval(interval);

        setTimeout(() => {
          window.location.href = `/${schoolId}`;
        }, 2000);

        return;
      }

      // ❌ FAILED
      if (data.status === "FAILED") {
        setStatus("FAILED");
        clearInterval(interval);
        return;
      }

      // ⏳ STILL PENDING
      setStatus("PENDING");

      // ⛔ STOP AFTER LIMIT
      if (attempts >= maxAttempts) {
        setStatus("TIMEOUT");
        clearInterval(interval);
      }

    } catch (err) {
      console.error(err);
      setStatus("ERROR");
      clearInterval(interval);
    }
  };

  checkPayment();
  interval = setInterval(checkPayment, 2000);

  return () => clearInterval(interval);
}, [orderId, schoolId]);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-3">
      {status === "CHECKING" && <p>Checking payment status...</p>}

      {status === "PENDING" && (
        <p className="text-yellow-600">Processing payment... ⏳</p>
      )}

      {status === "SUCCESS" && (
  <div className="text-green-600 text-lg font-semibold">
    Payment Successful ✅
    <div className="mt-3">
      <a
        href={`/${schoolId}`}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Go to Dashboard
      </a>
    </div>
  </div>
)}

      {status === "FAILED" && (
        <p className="text-red-600 text-lg font-semibold">
          Payment Failed ❌
        </p>
      )}

      {status === "TIMEOUT" && (
  <p className="text-gray-600">
    Payment received. Updating status... Please wait or refresh.
  </p>
)}

      {status === "ERROR" && (
        <p className="text-gray-500">
          Something went wrong. Please contact admin.
        </p>
      )}
    </div>
  );
}