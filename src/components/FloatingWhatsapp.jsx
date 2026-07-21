import { WhatsappGlyphIcon } from "./Icons";

export default function FloatingWhatsapp() {
  return (
    <a
      href="https://wa.me/919953149142"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-transform hover:scale-110"
      style={{ background: "radial-gradient(circle at 30% 30%, #2CE463, #128C7E)" }}
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/60" />
      <WhatsappGlyphIcon width="28" height="28" />
    </a>
  );
}
