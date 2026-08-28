import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { resendVerificationEmail, verifyEmail } from "../lib/api";
import { FRONTEND_BASE_URL } from "../lib/apiConfig";
import { parseVerificationParams } from "../utils/verification";
import {
  clearStoredVstitchUserId,
  readStoredVstitchUserId,
  storeVstitchUserId,
} from "../utils/vstitchUserId";

export default function EmailVerificationPage() {
  const location = useLocation();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");
  const [resending, setResending] = useState(false);
  const [verificationUserId, setVerificationUserId] = useState(null);
  const [showResendAction, setShowResendAction] = useState(false);

  const redirectToLogin = () => {
    const loginUrl = new URL("/login", FRONTEND_BASE_URL).toString();
    window.location.assign(loginUrl);
  };

  const handleResendVerificationEmail = async () => {
    const userId = verificationUserId || readStoredVstitchUserId();

    if (!userId) {
      setStatus("error");
      setShowResendAction(false);
      setMessage("We couldn't find your signup details. Please sign up again to receive a new verification email.");
      return;
    }

    setResending(true);
    try {
      const data = await resendVerificationEmail(userId);
      setStatus("success");
      setShowResendAction(true);
      setMessage(data?.message || "Verification email sent. Please check your inbox.");
    } catch (err) {
      if (err.status === 400) {
        setStatus("success");
        setShowResendAction(false);
        setMessage("Your email is already verified. Please login.");
        window.setTimeout(() => {
          redirectToLogin();
        }, 2000);
        return;
      }

      setStatus("error");
      if (err.status === 404) {
        clearStoredVstitchUserId();
        setShowResendAction(false);
        setMessage("We couldn't find that account. Please sign up again to receive a verification email.");
      } else if (err.status === 422) {
        setShowResendAction(false);
        setMessage("We couldn't resend the verification email because the account details are invalid. Please sign up again or contact support.");
      } else {
        setShowResendAction(true);
        setMessage(err.message || "Failed to resend verification email. Please try again later.");
      }
    } finally {
      setResending(false);
    }
  };

  useEffect(() => {
    let active = true;

    const verify = async () => {
      const { userId, token } = parseVerificationParams(location);
      const normalizedUserId = storeVstitchUserId(userId);
      if (normalizedUserId) {
        setVerificationUserId(normalizedUserId);
      } else {
        setVerificationUserId(null);
      }

      if (!normalizedUserId || !token) {
        if (!active) return;
        setStatus("error");
        setShowResendAction(Boolean(normalizedUserId || readStoredVstitchUserId()));
        setMessage("Invalid verification link. Please check the link and try again.");
        return;
      }

      try {
        const data = await verifyEmail(normalizedUserId, token);
        if (!active) return;

        setStatus("success");
        setShowResendAction(false);
        setMessage(data.message || "Email verification success. Please login to continue.");

        window.setTimeout(() => {
          redirectToLogin();
        }, 2500);
      } catch (err) {
        if (!active) return;

        const detail = err?.message || "Verification failed. Please try again later.";
        setStatus("error");
        setMessage(detail);

        const lower = detail.toLowerCase();
        if (err.status === 404) {
          clearStoredVstitchUserId();
          setShowResendAction(false);
          setMessage("We couldn't find that account. Please sign up again to receive a verification email.");
        } else if (err.status === 422) {
          setShowResendAction(false);
          setMessage("This verification link is invalid. Please sign up again or contact support.");
        } else if (lower.includes("already verified") || lower.includes("already been used")) {
          setStatus("success");
          setMessage("Your email is already verified. Please login.");
          setShowResendAction(false);
          window.setTimeout(() => {
            redirectToLogin();
          }, 2200);
        } else {
          setShowResendAction(true);
        }
      }
    };

    verify();

    return () => {
      active = false;
    };
  }, [location]);

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
            {showResendAction && (
              <button
                type="button"
                onClick={handleResendVerificationEmail}
                disabled={resending}
                className="inline-flex items-center justify-center border border-gold bg-gold px-5 py-3 text-xs font-medium tracking-[0.16em] text-ink uppercase transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resending ? "Sending..." : "Resend Email"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
