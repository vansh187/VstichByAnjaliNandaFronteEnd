import { useAuth } from "../hooks/useAuth";
import { formatDisplayName } from "../utils/formatName";

export default function WelcomeBanner() {
  const { user } = useAuth();
  const name = formatDisplayName(user?.username);

  return (
    <section className="relative flex h-[60svh] min-h-[440px] items-center overflow-hidden bg-ink text-cream">
      <img
        src="https://picsum.photos/id/106/1800/900"
        alt=""
        aria-hidden="true"
        loading="eager"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/20" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8">
        <p className="animate-fade-up font-sans text-xs font-medium tracking-[0.4em] text-gold-light uppercase">
          Welcome back
        </p>
        <h1
          className="animate-fade-up mt-4 font-display text-4xl leading-tight sm:text-5xl md:text-6xl"
          style={{ animationDelay: "80ms" }}
        >
          Hello, <span className="italic text-gold-light">{name}</span>
        </h1>
        <p
          className="animate-fade-up mt-4 max-w-lg text-base font-light text-cream/85"
          style={{ animationDelay: "160ms" }}
        >
          Your curated edit of sarees, bridalwear and bespoke tailoring is ready for you.
        </p>
        <a
          href="#bestsellers"
          className="animate-fade-up mt-8 inline-flex items-center gap-2 bg-gold px-8 py-3.5 text-sm font-medium tracking-[0.14em] text-ink uppercase transition-colors hover:bg-gold-light"
          style={{ animationDelay: "240ms" }}
        >
          Continue Shopping
        </a>
      </div>
    </section>
  );
}
