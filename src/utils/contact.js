// Single source of truth for the brand's WhatsApp number and Instagram
// profile - referenced by the footer icons, the AI widget's consultation/
// customization flows, and the Instagram gallery tiles.
export const WHATSAPP_NUMBER = "919953149142";
export const INSTAGRAM_URL = "https://www.instagram.com/vstitchbyanjalinanda/";

export function whatsappHref(message) {
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${WHATSAPP_NUMBER}${query}`;
}
