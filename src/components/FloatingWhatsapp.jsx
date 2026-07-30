import { useEffect, useState } from "react";
import { WhatsappGlyphIcon } from "./Icons";

const SHOW_DELAY_MS = 1500;

export default function FloatingWhatsapp() {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-end gap-3">
      {showTooltip && (
        <div className="max-w-[210px] rounded-2xl rounded-br-sm border border-sand-dark/70 bg-white px-4 py-3 text-sm leading-snug text-charcoal shadow-xl">
          Have a question? Chat with us on WhatsApp to book a private styling consultation with
          Anjali Nanda.
        </div>
      )}

      <a
        href="https://wa.me/919953149142"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white shadow-xl transition-transform hover:scale-110"
        style={{ background: "radial-gradient(circle at 30% 30%, #2CE463, #128C7E)" }}
      >
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/60" />
        <WhatsappGlyphIcon width="28" height="28" />
      </a>
    </div>
  );
}
