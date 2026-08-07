import { useState } from "react";
import { subscribe } from "../lib/api";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    setError("");
    try {
      await subscribe({ email: email.trim() });
      setSubmitted(true);
    } catch (err) {
      setError(err.fieldErrors?.email || err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
            Thank you for subscribing — your welcome offer is on its way.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-4 flex w-full max-w-md flex-col gap-3"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
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
                disabled={loading}
                className="shrink-0 bg-ink px-7 py-3.5 text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-charcoal disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Subscribing…" : "Subscribe"}
              </button>
            </div>
            {error && <p className="text-sm text-red-700">{error}</p>}
          </form>
        )}
      </div>
    </section>
  );
}
