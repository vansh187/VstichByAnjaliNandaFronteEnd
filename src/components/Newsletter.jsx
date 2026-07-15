import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <section id="newsletter" className="bg-sand py-20">
      <div
        data-reveal
        className="reveal mx-auto flex max-w-2xl flex-col items-center gap-4 px-5 text-center sm:px-8"
      >
        <span className="font-sans text-xs font-medium tracking-[0.3em] text-gold uppercase">
          Stay In Touch
        </span>
        <h2 className="font-display text-4xl text-ink sm:text-5xl">
          Get 10% Off Your First Order
        </h2>
        <p className="max-w-md text-charcoal/75">
          Join our list for early access to new collections, styling edits and
          exclusive trunk-show invitations.
        </p>

        {submitted ? (
          <p className="mt-4 font-display text-lg italic text-gold">
            Thank you — check your inbox for your welcome offer.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-4 flex w-full max-w-md flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full border border-sand-dark bg-cream px-5 py-3.5 text-sm text-ink placeholder:text-charcoal/50 focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 bg-ink px-7 py-3.5 text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-charcoal"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
