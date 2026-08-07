import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AnnouncementBar from "../components/AnnouncementBar";
import Navbar from "../components/Navbar";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import { useReveal } from "../hooks/useReveal";
import { ChevronRightIcon, PlusIcon, MinusIcon } from "../components/Icons";

const PAGE_TITLE = "FAQs — Sarees, Shipping, Returns & Custom Tailoring | VStitch by Anjali Nanda";
const PAGE_DESCRIPTION =
  "Answers to the most common questions about shopping VStitch by Anjali Nanda: shipping and order tracking, Cash on Delivery and secure online payments, returns and exchanges, sizing, handcrafted saree and lehenga care, and bespoke bridal tailoring.";

const faqGroups = [
  {
    category: "Orders & Shipping",
    questions: [
      {
        question: "Do you ship handcrafted sarees and ethnic wear across India and internationally?",
        answer:
          "Yes. VStitch by Anjali Nanda ships handcrafted sarees, suits, lehengas and bridal wear across India and worldwide. Orders above ₹4,999 qualify for complimentary shipping, and every order can be tracked in real time once it's dispatched.",
      },
      {
        question: "How can I track my order after placing it?",
        answer:
          "Sign in and open My Orders to see live shipment status for every order — from Placed and Shipment Created through Shipped, Out for Delivery and Delivered — updated directly from our courier partner as it moves.",
      },
      {
        question: "How long does delivery usually take?",
        answer:
          "Most in-stock, ready-to-wear pieces are dispatched within 1–3 business days, with delivery timelines depending on your location. Made-to-measure and bridal orders are shared with an expected delivery window at the time of order confirmation.",
      },
      {
        question: "Can I cancel or edit my order after placing it?",
        answer:
          "If your order hasn't shipped yet, reach out to our support team as soon as possible via WhatsApp or email and we'll do our best to update the address, items or cancel it before dispatch.",
      },
    ],
  },
  {
    category: "Payments",
    questions: [
      {
        question: "Is Cash on Delivery (COD) available?",
        answer:
          "Yes — Cash on Delivery is available on eligible orders, alongside secure online payment via Razorpay (cards, UPI, net banking and wallets). A PDF invoice is generated automatically the moment your order is placed, whichever way you pay.",
      },
      {
        question: "Is it safe to pay online on this website?",
        answer:
          "Yes. Every online payment is processed through Razorpay's encrypted, PCI-DSS compliant checkout, so your card and banking details are never stored on our servers. Cash on Delivery remains available wherever you'd rather pay in person.",
      },
      {
        question: "Do you offer discounts or festive sale codes?",
        answer:
          "We run seasonal and festive offers through the year — the latest active codes are always shown in the announcement bar at the top of the site, so check there or subscribe to our newsletter for early access.",
      },
    ],
  },
  {
    category: "Returns & Sizing",
    questions: [
      {
        question: "What is your return and exchange policy?",
        answer:
          "We offer easy 7-day returns from the date of delivery on eligible items, so you can shop with confidence. If a piece doesn't fit or isn't quite right, our support team will help arrange a return or exchange.",
      },
      {
        question: "How do I choose the right saree, suit or lehenga size?",
        answer:
          "Every product page lists the available sizes and colors with live stock so you always see what's actually in stock. For bespoke or made-to-measure pieces, our styling team guides you to the right fit from your own measurements.",
      },
      {
        question: "What if the size I ordered doesn't fit?",
        answer:
          "Get in touch within 7 days of delivery and we'll help arrange a size exchange or return, subject to the piece being unused and in its original condition.",
      },
    ],
  },
  {
    category: "Craftsmanship & Care",
    questions: [
      {
        question: "Are VStitch sarees and suits truly handcrafted?",
        answer:
          "Yes. Every piece is designed and finished by our in-house artisans, with many styles hand-embroidered using traditional Indian textile techniques — blending heritage craftsmanship with contemporary silhouettes.",
      },
      {
        question: "How should I care for a handcrafted or embroidered saree?",
        answer:
          "Embroidered and zari-work fabrics last longest with gentle, garment-specific care. We recommend dry cleaning for heavily embroidered or bridal pieces, and always following the care instructions listed on the individual product.",
      },
    ],
  },
  {
    category: "Bridal & Customization",
    questions: [
      {
        question: "Do you offer custom stitching or made-to-measure tailoring?",
        answer:
          "Yes. Beyond ready-to-wear collections, VStitch offers bespoke tailoring — from bridal lehengas to custom blouses — hand-finished by our artisans to your exact measurements and styling preferences.",
      },
      {
        question: "Do you have a bridal or wedding collection?",
        answer:
          "Yes — our bridal edit features handcrafted lehengas, Indo-Western sets and festive wear designed for weddings and celebrations, with private styling consultations available on request.",
      },
    ],
  },
];

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="border-b border-sand-dark/70 py-5">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="font-display text-lg text-ink sm:text-xl">{item.question}</span>
        <span className="shrink-0 text-charcoal/60">
          {isOpen ? <MinusIcon /> : <PlusIcon />}
        </span>
      </button>
      {isOpen && (
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-charcoal/75 sm:text-base">
          {item.answer}
        </p>
      )}
    </div>
  );
}

export default function FaqPage() {
  const revealRef = useReveal();
  const [openKey, setOpenKey] = useState("Orders & Shipping-0");

  useEffect(() => {
    const previousTitle = document.title;
    document.title = PAGE_TITLE;

    let metaDescription = document.querySelector('meta[name="description"]');
    const createdMeta = !metaDescription;
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    const previousDescription = metaDescription.getAttribute("content");
    metaDescription.setAttribute("content", PAGE_DESCRIPTION);

    const structuredData = document.createElement("script");
    structuredData.type = "application/ld+json";
    structuredData.id = "faq-structured-data";
    structuredData.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqGroups.flatMap((group) =>
        group.questions.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      ),
    });
    document.head.appendChild(structuredData);

    return () => {
      document.title = previousTitle;
      if (createdMeta) {
        metaDescription.remove();
      } else if (previousDescription !== null) {
        metaDescription.setAttribute("content", previousDescription);
      }
      structuredData.remove();
    };
  }, []);

  return (
    <div ref={revealRef}>
      <AnnouncementBar />
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-ink text-cream">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),_transparent_40%)]" />
          <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
            <nav className="flex items-center gap-1.5 text-xs tracking-widest text-cream/70 uppercase">
              <Link to="/" className="link-underline">
                Home
              </Link>
              <ChevronRightIcon width="12" height="12" />
              <span className="text-cream">FAQs</span>
            </nav>
            <p className="mt-4 font-sans text-xs font-semibold tracking-[0.32em] text-gold-light uppercase">
              Frequently Asked Questions
            </p>
            <h1 className="mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
              Everything you need to know before you shop
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-cream/80">
              Shipping and order tracking, Cash on Delivery and secure payments, returns and
              sizing, and how our handcrafted sarees, suits and bridal lehengas are made and cared
              for — all in one place.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
          <div className="space-y-14">
            {faqGroups.map((group) => (
              <div key={group.category} data-reveal className="reveal">
                <h2 className="font-sans text-xs font-semibold tracking-[0.28em] text-gold uppercase">
                  {group.category}
                </h2>
                <div className="mt-4">
                  {group.questions.map((item, index) => {
                    const key = `${group.category}-${index}`;
                    return (
                      <FaqItem
                        key={key}
                        item={item}
                        isOpen={openKey === key}
                        onToggle={() => setOpenKey((current) => (current === key ? null : key))}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-[1.5rem] border border-sand-dark/70 bg-white p-8 text-center shadow-sm sm:p-10">
            <h2 className="font-display text-2xl text-ink">Still have a question?</h2>
            <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
              Our styling team is happy to help with sizing, custom orders or anything else.
            </p>
            <a
              href="mailto:vstitchbyanjalinanda@gmail.com"
              className="link-underline mt-4 inline-block font-medium text-ink"
            >
              vstitchbyanjalinanda@gmail.com
            </a>
          </div>
        </section>

        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
