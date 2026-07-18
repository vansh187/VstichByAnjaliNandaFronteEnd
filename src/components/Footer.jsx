import {
  FacebookIcon,
  InstagramIcon,
  PinterestIcon,
  WhatsappIcon,
} from "./Icons";

const shopLinks = ["Sarees", "Suits & Sets", "Bridal Lehengas", "Indo-Western", "New Arrivals", "Sale"];
const helpLinks = ["Track Your Order", "Shipping Policy", "Returns & Exchanges", "Size Guide", "FAQs", "Care Instructions"];
const companyLinks = ["Our Story", "The Atelier", "Careers", "Press", "Sustainability", "Terms of Service", "Privacy Policy"];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-sand-dark bg-ink text-cream">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <p className="font-display text-2xl italic">
              VStitch <span className="text-gold-light">by Anjali Nanda</span>
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/65">
              Handcrafted Indian couture — sarees, bridalwear and bespoke
              tailoring, made by artisans, worn for a lifetime.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <a href="#" aria-label="Instagram" className="text-cream/70 transition-colors hover:text-gold-light">
                <InstagramIcon />
              </a>
              <a href="#" aria-label="Facebook" className="text-cream/70 transition-colors hover:text-gold-light">
                <FacebookIcon />
              </a>
              <a href="#" aria-label="Pinterest" className="text-cream/70 transition-colors hover:text-gold-light">
                <PinterestIcon />
              </a>
              <a href="#" aria-label="WhatsApp" className="text-cream/70 transition-colors hover:text-gold-light">
                <WhatsappIcon />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium tracking-[0.2em] text-gold-light uppercase">Shop</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
              {shopLinks.map((link) => (
                <li key={link}>
                  <a href="#bestsellers" className="link-underline transition-colors hover:text-cream">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium tracking-[0.2em] text-gold-light uppercase">Customer Care</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
              {helpLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="link-underline transition-colors hover:text-cream">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium tracking-[0.2em] text-gold-light uppercase">Get in Touch</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
              <li>Atelier: C-87, First Floor, Sushant Lok-1, Sector 43, Gurugram, 122002</li>
              <li>
                <a href="tel:+919953149142" className="link-underline transition-colors hover:text-cream">
                  +91 99531 49142
                </a>
              </li>
              <li>
                <a
                  href="mailto:vstitchbyanjalinanda@gmail.com"
                  className="link-underline transition-colors hover:text-cream"
                >
                  vstitchbyanjalinanda@gmail.com
                </a>
              </li>
              <li>Mon–Sat, 10am – 7pm IST</li>
            </ul>

            <div className="mt-6">
              <h3 className="text-xs font-medium tracking-[0.2em] text-gold-light uppercase">Company</h3>
              <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-cream/70">
                {companyLinks.map((link) => (
                  <li key={link}>
                    <a href="#" className="link-underline transition-colors hover:text-cream">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col-reverse items-center justify-between gap-4 px-5 py-6 text-xs text-cream/55 sm:flex-row sm:px-8">
          <p>&copy; {year} VStitch by Anjali Nanda. All rights reserved.</p>
          <div className="flex items-center gap-3 tracking-widest uppercase">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>RuPay</span>
            <span>UPI</span>
            <span>PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
