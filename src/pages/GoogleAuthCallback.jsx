import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function readRedirectSession() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const token = params.get("token");
  const userId = params.get("vstitch_user_id");
  const userName = params.get("vstitch_user_name");
  window.history.replaceState(null, "", window.location.pathname);
  return token && userId && userName ? { token, userId: Number(userId), userName } : null;
}

// Landing page for the Google OAuth *redirect* flow: the backend does the
// whole exchange server-side and comes back here with a ready-made session
// in the URL fragment (never a query string, so it never hits server logs)
// rather than handing the browser a credential to POST anywhere itself.
// A missing/blank token means the user cancelled at Google's consent
// screen, or the backend rejected the state param - either way there's no
// JSON error body to read since this is a plain navigation, not a fetch.
export default function GoogleAuthCallback() {
  const { applyGoogleSession } = useAuth();
  const navigate = useNavigate();
  const [session] = useState(readRedirectSession);
  const failed = !session;

  useEffect(() => {
    if (!session) return;
    applyGoogleSession(session.token, session.userId, session.userName);
    navigate("/home", { replace: true });
  }, [session, applyGoogleSession, navigate]);

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-ink px-5 py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/85 to-ink" />
      <div className="relative z-10 w-full max-w-md text-center">
        <Link to="/" className="mb-8 block text-center font-display text-2xl italic text-cream">
          VStitch <span className="text-gold-light">by Anjali Nanda</span>
        </Link>

        {failed ? (
          <>
            <h1 className="font-display text-2xl text-cream">Google sign-in didn't go through</h1>
            <p className="mt-3 text-sm text-cream/70">
              The sign-in was cancelled or couldn't be completed. Please try again.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block border border-cream/30 px-8 py-3 text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-cream hover:text-ink"
            >
              Back to Log In
            </Link>
          </>
        ) : (
          <p className="text-sm tracking-widest text-cream/70 uppercase">Signing you in…</p>
        )}
      </div>
    </div>
  );
}
