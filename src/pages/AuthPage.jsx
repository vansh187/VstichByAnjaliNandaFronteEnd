import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AuthCard from "../components/AuthCard";

export default function AuthPage() {
  const { isAuthenticated, ready } = useAuth();
  const location = useLocation();

  // Matches AuthCard's own post-login redirect so the two agree regardless
  // of which one a login actually resolves through (this declarative check
  // also covers arriving at /login while already signed in).
  if (ready && isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || "/home"} replace />;
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-ink px-5 py-16">
      <img
        src="https://picsum.photos/id/64/1800/1200"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/85 to-ink" />

      <div className="relative z-10 w-full max-w-md">
        <Link to="/" className="mb-8 block text-center font-display text-2xl italic text-cream">
          VStitch <span className="text-gold-light">by Anjali Nanda</span>
        </Link>
        <AuthCard />
        <Link
          to="/"
          className="link-underline mt-6 block text-center text-xs tracking-widest text-cream/60 uppercase"
        >
          ← Back to Shopping
        </Link>
      </div>
    </div>
  );
}
