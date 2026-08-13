import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { verifyEmail } from "../lib/api";
import { parseVerificationParams } from "../utils/verification";

export default function EmailVerificationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    let active = true;

    const verify = async () => {
      const { userId, token } = parseVerificationParams(location);

      if (!userId || !token) {
        if (!active) return;
        setStatus("error");
        setMessage("Invalid verification link. Please check the link and try again.");
        return;
      }

      try {
        const data = await verifyEmail(userId, token);
        if (!active) return;

        setStatus("success");
        setMessage(data.message || "Email verification success. Please login to continue.");

        window.setTimeout(() => {
          window.location.href = "/login";
        }, 2500);
      } catch (err) {
        if (!active) return;

        const detail = err?.message || "Verification failed. Please try again later.";
        setStatus("error");
        setMessage(detail);

        const lower = detail.toLowerCase();
        if (lower.includes("already verified") || lower.includes("already been used")) {
          window.setTimeout(() => {
            navigate("/login", { replace: true });
          }, 2200);
        }
      }
    };

    verify();

    return () => {
      active = false;
    };
  }, [location, navigate]);

  return (
    <div className="flex min-h-svh items-center justify-center bg-ink px-5 py-16 text-cream">
      <div className="w-full max-w-md rounded-2xl border border-sand-dark bg-cream/95 p-8 text-center text-ink shadow-2xl">
        <p className="text-xs font-medium tracking-[0.26em] text-gold uppercase">Email Verification</p>
        <h1 className="mt-4 font-display text-3xl text-ink">
          {status === "loading" ? "Checking your link…" : status === "success" ? "Verified" : "Verification issue"}
        </h1>

        <div className="mt-6 rounded border border-sand-dark bg-sand/60 px-4 py-4 text-sm text-charcoal/80">
          {status === "loading" && (
            <div className="flex items-center justify-center gap-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-charcoal/20 border-t-ink" />
              <span>{message}</span>
            </div>
          )}
          {status !== "loading" && <p>{message}</p>}
        </div>

        {status !== "loading" && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center border border-ink px-5 py-3 text-xs font-medium tracking-[0.16em] text-ink uppercase transition-colors hover:bg-ink hover:text-cream"
            >
              Go to Login
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center border border-sand-dark px-5 py-3 text-xs font-medium tracking-[0.16em] text-charcoal uppercase transition-colors hover:border-charcoal hover:text-ink"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
