const messages = [
  "Complimentary shipping on orders above ₹4,999",
  "Festive Edit — flat 15% off, use code VSTITCH15",
  "Book a private styling consultation with Anjali Nanda",
  "Handcrafted in India · Ships worldwide",
];

const loop = [...messages, ...messages];

export default function AnnouncementBar() {
  return (
    <div className="overflow-hidden bg-ink py-2 text-cream">
      <span className="sr-only">{messages.join(". ")}</span>
      <div
        aria-hidden="true"
        className="flex w-max animate-marquee gap-16 whitespace-nowrap text-xs font-light tracking-[0.2em] uppercase"
      >
        {loop.map((msg, i) => (
          <span key={i} className="flex items-center gap-16">
            {msg}
            <span className="text-gold-light">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
