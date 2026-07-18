import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useOverlay } from "../hooks/useOverlay";
import AccountMenu from "./AccountMenu";
import { BagIcon, CloseIcon, MenuIcon, SearchIcon } from "./Icons";

const navLinks = [
  { label: "Collections", href: "/collections" },
  { label: "Our Story", href: "/our-story" },
];

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const { count, openCart } = useCart();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useOverlay(mobileOpen, () => setMobileOpen(false));

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
        scrolled
          ? "border-sand-dark/70 bg-cream/90 backdrop-blur-md"
          : "border-transparent bg-cream"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-4 sm:px-8">
        <button
          type="button"
          className="flex items-center gap-2 text-ink lg:hidden"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <MenuIcon />
        </button>

        <Link
          to="/"
          className="mr-auto font-display text-2xl tracking-wide text-ink sm:text-3xl"
        >
          VStitch <span className="italic text-gold">by Anjali Nanda</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-end gap-6 lg:flex lg:ml-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="link-underline font-sans text-[13px] font-medium tracking-[0.14em] text-charcoal uppercase"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-4 flex items-center gap-4 text-ink sm:gap-5">
          <button
            type="button"
            aria-label="Search"
            className="hidden transition-colors hover:text-gold sm:inline-flex"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <SearchIcon />
          </button>
          <AccountMenu />
          <button
            type="button"
            aria-label={`Open cart, ${count} items`}
            className="relative transition-colors hover:text-gold"
            onClick={openCart}
          >
            <BagIcon />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gold text-[10px] font-medium text-cream">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-sand-dark/70 bg-cream px-5 py-4 sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <SearchIcon className="shrink-0 text-charcoal" />
            <input
              type="search"
              autoFocus
              placeholder="Search sarees, lehengas, suits…"
              className="w-full border-none bg-transparent font-display text-lg italic text-ink placeholder:text-charcoal/50 focus:outline-none"
            />
            <button
              type="button"
              aria-label="Close search"
              onClick={() => setSearchOpen(false)}
              className="text-charcoal hover:text-gold"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      )}

      {/* mobile drawer */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!mobileOpen}
        inert={!mobileOpen ? true : undefined}
      >
        <button
          type="button"
          aria-label="Close menu"
          className="absolute inset-0 bg-ink/50"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 h-full w-[82%] max-w-xs bg-cream shadow-2xl transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-sand-dark px-5 py-4">
            <span className="font-display text-xl italic text-ink">Menu</span>
            <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <CloseIcon />
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-5 py-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="border-b border-sand-dark/60 py-3 font-sans text-sm font-medium tracking-[0.12em] text-charcoal uppercase"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  to="/orders"
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-sand-dark/60 py-3 font-sans text-sm font-medium tracking-[0.12em] text-charcoal uppercase"
                >
                  My Orders
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="py-3 text-left font-sans text-sm font-medium tracking-[0.12em] text-charcoal uppercase"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                state={{ backgroundLocation: location }}
                onClick={() => setMobileOpen(false)}
                className="py-3 font-sans text-sm font-medium tracking-[0.12em] text-charcoal uppercase"
              >
                Log In
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
