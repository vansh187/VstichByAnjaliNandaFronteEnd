import { RefreshIcon, ShieldIcon, SparkleIcon, TruckIcon } from "./Icons";

const features = [
  {
    icon: TruckIcon,
    title: "Complimentary Shipping",
    desc: "Free worldwide delivery on orders above ₹4,999",
  },
  {
    icon: SparkleIcon,
    title: "Handcrafted Quality",
    desc: "Each piece hand-embroidered by master artisans",
  },
  {
    icon: RefreshIcon,
    title: "Easy 7-Day Returns",
    desc: "Not the perfect fit? We'll make it right",
  },
  {
    icon: ShieldIcon,
    title: "Secure Checkout",
    desc: "100% protected payments, every time",
  },
];

export default function Features() {
  return (
    <section className="border-y border-sand-dark bg-cream">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-5 py-12 sm:px-8 md:grid-cols-4">
        {features.map((f, i) => (
          <div
            key={f.title}
            data-reveal
            className="reveal flex flex-col items-center gap-3 text-center md:flex-row md:items-start md:text-left"
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <f.icon className="shrink-0 text-gold" />
            <div>
              <h3 className="font-display text-lg text-ink">{f.title}</h3>
              <p className="mt-0.5 text-sm text-charcoal/70">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
