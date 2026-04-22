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

  let interval: NodeJS.Timeout;

  const checkPayment = async () => {
    try {
      const res = await fetch(
        `/api/v1/tenants/${schoolId}/cashfree/verify-payment?order_id=${orderId}`
      );

      const data = await res.json();

      if (data.status === "PAID") {
  setStatus("SUCCESS");
  clearInterval(interval);

  setTimeout(() => {
    window.location.href = `/${schoolId}`;
  }, 2000);
      } else if (data.status === "FAILED") {
        setStatus("FAILED");
        clearInterval(interval);
      } else {
        setStatus("PENDING");
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
        <p className="text-green-600 text-lg font-semibold">
          Payment Successful ✅
        </p>
      )}

      {status === "FAILED" && (
        <p className="text-red-600 text-lg font-semibold">
          Payment Failed ❌
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