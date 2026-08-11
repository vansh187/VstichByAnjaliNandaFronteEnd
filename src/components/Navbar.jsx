import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useOverlay } from "../hooks/useOverlay";
import { useCategories } from "../hooks/useCategories";
import AccountMenu from "./AccountMenu";
import { BagIcon, ChevronDownIcon, CloseIcon, MenuIcon, SearchIcon } from "./Icons";
import { withBrandPrefix } from "../utils/categoryVideo";

// Mobile drawer only - it lists these as plain links (no room for a nested
// flyout there), so "Collections" just goes to the /collections overview.
// Desktop gets the dropdown version, CollectionsNavItem, below.
const navLinks = [
  { label: "Home", href: "/" },
  { label: "Summer Luxe", href: "/summer-luxe" },
  { label: "Collections", href: "/collections" },
  { label: "Our Story", href: "/our-story" },
];

function CollectionsNavItem() {
  const [open, setOpen] = useState(false);
  const { categories } = useCategories();

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        to="/collections"
        aria-expanded={open}
        className="link-underline flex items-center gap-1 font-sans text-[13px] font-medium tracking-[0.14em] text-charcoal uppercase"
      >
        Collections
        <ChevronDownIcon width="14" height="14" className={open ? "rotate-180" : ""} />
      </Link>
      {open && (
        // pt-4 (not mt-4) on this wrapper, not the panel below, so the gap
        // between the trigger and the panel is still part of this element's
        // hover area - a margin gap there is dead space the cursor has to
        // cross outside any element, which drops the mouseleave/close before
        // it ever reaches the links.
        <div className="absolute left-0 top-full z-30 w-60 pt-4">
          <div className="border border-sand-dark bg-cream py-2 shadow-xl">
            <Link
              to="/collections"
              onClick={() => setOpen(false)}
              className="block border-b border-sand-dark/70 px-4 py-2.5 text-sm font-medium text-ink hover:bg-sand/60"
            >
              View All Collections
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.vstitch_category_id}
                to={`/collections/${cat.vstitch_category_id}`}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-charcoal hover:bg-sand/60"
              >
                {withBrandPrefix(cat.category_name)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const { count, openCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setSearchOpen(false);
    setSearchQuery("");
  };

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
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-4 sm:px-8">
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
          className="mr-auto flex min-w-0 flex-1 items-center gap-2.5 font-display text-lg leading-tight tracking-wide text-ink sm:text-3xl"
        >
          <img
            src="/static/brand/logo.jpg"
            alt="VStitch by Anjali Nanda"
            className="h-9 w-9 shrink-0 rounded-full object-cover sm:h-11 sm:w-11"
          />
          <span>
            VStitch <span className="italic text-gold">by Anjali Nanda</span>
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-end gap-6 lg:flex lg:ml-8">
          <Link
            to="/"
            className="link-underline font-sans text-[13px] font-medium tracking-[0.14em] text-charcoal uppercase"
          >
            Home
          </Link>
          <Link
            to="/summer-luxe"
            className="link-underline font-sans text-[13px] font-medium tracking-[0.14em] text-charcoal uppercase"
          >
            Summer Luxe
          </Link>
          <CollectionsNavItem />
          <Link
            to="/our-story"
            className="link-underline font-sans text-[13px] font-medium tracking-[0.14em] text-charcoal uppercase"
          >
            Our Story
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3 text-ink sm:gap-5">
          <button
            type="button"
            aria-label="Search"
            className="inline-flex transition-colors hover:text-gold"
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
          <form
            onSubmit={handleSearchSubmit}
            className="mx-auto flex max-w-7xl items-center gap-3"
          >
            <SearchIcon className="shrink-0 text-charcoal" />
            <input
              type="search"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sarees, lehengas, suits…"
              className="w-full border-none bg-transparent font-display text-lg italic text-ink placeholder:text-charcoal/50 focus:outline-none"
            />
            <button
              type="button"
              aria-label="Close search"
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery("");
              }}
              className="text-charcoal hover:text-gold"
            >
              <CloseIcon />
            </button>
          </form>
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
