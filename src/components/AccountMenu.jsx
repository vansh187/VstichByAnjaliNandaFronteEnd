import { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useClickOutside } from "../hooks/useClickOutside";
import { UserIcon } from "./Icons";
import { formatDisplayName } from "../utils/formatName";

export default function AccountMenu() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useClickOutside(menuRef, open, () => setOpen(false));

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        state={{ backgroundLocation: location }}
        aria-label="Log in"
        className="hidden transition-colors hover:text-gold sm:inline-flex"
      >
        <UserIcon />
      </Link>
    );
  }

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <div ref={menuRef} className="relative hidden sm:inline-flex">
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[11px] font-medium text-cream transition-opacity hover:opacity-85"
      >
        {(user?.username?.[0] || "V").toUpperCase()}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-3 w-52 border border-sand-dark bg-cream py-2 shadow-xl">
          <p className="border-b border-sand-dark/70 px-4 pb-2 pt-1 text-xs tracking-wide text-charcoal/60">
            Signed in as{" "}
            <span className="font-medium text-ink">{formatDisplayName(user?.username)}</span>
          </p>
          <Link
            to="/home"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-charcoal hover:bg-sand/60"
          >
            My Home
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full px-4 py-2.5 text-left text-sm text-charcoal hover:bg-sand/60"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
