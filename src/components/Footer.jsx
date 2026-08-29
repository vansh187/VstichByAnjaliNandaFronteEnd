import { useState } from "react";
import { Link } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";
import { InstagramIcon, WhatsappIcon } from "./Icons";
import { withBrandPrefix } from "../utils/categoryVideo";
import { INSTAGRAM_URL, whatsappHref } from "../utils/contact";

const WHATSAPP_MESSAGE = "Hi VStitch by Anjali Nanda! I'd like to know more about your collection.";
import TermsOfServiceModal from "./TermsOfServiceModal";
import PrivacyPolicyModal from "./PrivacyPolicyModal";

const helpLinks = [
  { label: "Track Your Order", to: "/track-order" },
  { label: "FAQs", to: "/faqs" },
];
const companyLinks = ["Our Story", "Careers", "Terms of Service", "Privacy Policy"];

export default function Footer() {
  const year = new Date().getFullYear();
  const { categories } = useCategories();
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <footer className="border-t border-sand-dark bg-ink text-cream">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/static/brand/logo.jpg"
                alt="VStitch by Anjali Nanda"
                className="h-11 w-11 shrink-0 rounded-full object-cover"
              />
              <p className="font-display text-2xl italic">
                VStitch <span className="text-gold-light">by Anjali Nanda</span>
              </p>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/65">
              Handcrafted Indian couture — sarees, bridalwear and bespoke
              tailoring, made by artisans, worn for a lifetime.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-cream/70 transition-colors hover:text-gold-light"
              >
                <InstagramIcon />
              </a>
              <a
                href={whatsappHref(WHATSAPP_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-cream/70 transition-colors hover:text-gold-light"
              >
                <WhatsappIcon />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium tracking-[0.2em] text-gold-light uppercase">Shop</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
              {categories.map((category) => (
                <li key={category.vstitch_category_id}>
                  <Link
                    to={`/collections/${category.vstitch_category_id}`}
                    className="link-underline transition-colors hover:text-cream"
                  >
                    {withBrandPrefix(category.category_name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium tracking-[0.2em] text-gold-light uppercase">Customer Care</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
              {helpLinks.map((link) =>
                link.to === "#" ? (
                  <li key={link.label}>
                    <a href="#" className="link-underline transition-colors hover:text-cream">
                      {link.label}
                    </a>
                  </li>
                ) : (
                  <li key={link.label}>
                    <Link to={link.to} className="link-underline transition-colors hover:text-cream">
                      {link.label}
                    </Link>
                  </li>
                ),
              )}
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
                {companyLinks.map((link) => {
                  if (link === "Terms of Service" || link === "Privacy Policy") {
                    const onOpen = link === "Terms of Service" ? setTermsOpen : setPrivacyOpen;
                    return (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => onOpen(true)}
                          className="link-underline transition-colors hover:text-cream"
                        >
                          {link}
                        </button>
                      </li>
                    );
                  }
                  return (
                    <li key={link}>
                      <a href="#" className="link-underline transition-colors hover:text-cream">
                        {link}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col-reverse items-center justify-between gap-4 px-5 py-6 text-xs text-cream/55 sm:flex-row sm:px-8">
          <p>
            &copy; {year} VStitch by Anjali Nanda. All rights reserved. Website by{" "}
            <a
              href="https://webneststudio.co.in"
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline text-cream/70 transition-colors hover:text-gold-light"
            >
              WebNest Studio
            </a>
            .
          </p>
          <div className="flex items-center gap-3 tracking-widest uppercase">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>RuPay</span>
            <span>UPI</span>
            <span>PayPal</span>
          </div>
        </div>
      </div>

      {termsOpen && <TermsOfServiceModal onClose={() => setTermsOpen(false)} />}
      {privacyOpen && <PrivacyPolicyModal onClose={() => setPrivacyOpen(false)} />}
    </footer>
  );
}
