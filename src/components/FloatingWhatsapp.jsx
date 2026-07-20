import { WhatsappIcon } from "./Icons";

export default function FloatingWhatsapp() {
  return (
    <a
      href="https://wa.me/919953149142"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-110"
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/60" />
      <WhatsappIcon width="26" height="26" strokeWidth="1.7" />
    </a>
  );
}
