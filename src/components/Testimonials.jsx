import { testimonials } from "../data/marketing";
import { StarIcon } from "./Icons";

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-ink py-24 text-cream">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div data-reveal className="reveal mb-14 flex flex-col items-center gap-3 text-center">
          <span className="font-sans text-xs font-medium tracking-[0.3em] text-gold-light uppercase">
            Loved By Our Clients
          </span>
          <h2 className="font-display text-4xl sm:text-5xl">Words From Our Family</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <figure
              key={t.id}
              data-reveal
              className="reveal border border-cream/15 bg-cream/[0.03] p-8"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="flex gap-1 text-gold-light">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <StarIcon key={idx} />
                ))}
              </div>
              <blockquote className="mt-5 font-display text-xl italic leading-relaxed text-cream/90">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-light/50 font-display text-sm text-gold-light">
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <span>
                  <span className="block text-sm font-medium text-cream">{t.name}</span>
                  <span className="block text-xs text-cream/60">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
