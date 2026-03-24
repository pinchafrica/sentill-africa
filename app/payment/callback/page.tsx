"use client";

import { useEffect, useState } from "react";
import { PartyPopper, XCircle, Loader2 } from "lucide-react";

export default function PaymentCallbackPage() {
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [reason, setReason] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    const plan = params.get("plan");
    const failReason = params.get("reason") || "";

    console.log("[Callback] Payment status:", paymentStatus, "| Plan:", plan, "| Reason:", failReason);

    if (paymentStatus === "success") {
      setStatus("success");
      // Send postMessage to parent (dashboard iframe) immediately and with a delay for reliability
      const sendSuccess = () => {
        try {
          window.parent.postMessage(
            { type: "PAYSTACK_PAYMENT_SUCCESS", plan: plan || "TRIAL_3_DAYS" },
            "*"
          );
        } catch (_) {}
      };
      sendSuccess();
      // Retry a few times to make sure the parent gets it
      setTimeout(sendSuccess, 500);
      setTimeout(sendSuccess, 1500);

    } else if (paymentStatus === "failed" || paymentStatus === "error") {
      setStatus("failed");
      setReason(failReason);
      const sendFailed = () => {
        try {
          window.parent.postMessage(
            { type: "PAYSTACK_PAYMENT_FAILED", reason: failReason },
            "*"
          );
        } catch (_) {}
      };
      sendFailed();
      setTimeout(sendFailed, 500);

    } else {
      // No status param yet - could be a direct visit or still loading
      // Wait a moment then show verifying
      setTimeout(() => {
        if (status === "verifying") {
          setStatus("failed");
          setReason("timeout");
        }
      }, 15000);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-8">
      <div className="text-center space-y-6 max-w-md">
        {status === "verifying" && (
          <>
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Verifying Payment...</h2>
            <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Please wait while we confirm your transaction.</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <PartyPopper className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Payment Successful!</h2>
            <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Your premium access is now active.</p>
          </>
        )}
        {status === "failed" && (
          <>
            <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-rose-400" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Payment Issue</h2>
            <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest">Please close this and try again from the dashboard.</p>
            {reason && (
              <p className="text-[8px] text-slate-600 font-mono uppercase">{reason}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
