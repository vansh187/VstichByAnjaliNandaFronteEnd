import ModalShell from "./ModalShell";

const SECTIONS = [
  {
    heading: "1. Acceptance of Terms",
    body: "By browsing this website or placing an order with VStitch by Anjali Nanda, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use this site or place an order.",
  },
  {
    heading: "2. Orders & Payment",
    body: "All orders are subject to acceptance and availability. Prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. Payment must be completed in full at the time of order via the payment methods offered at checkout (cards, UPI, net banking, or cash on delivery where available). We reserve the right to cancel or refuse any order at our discretion, including in cases of pricing errors or suspected fraud.",
  },
  {
    heading: "3. Shipping & Delivery",
    body: "All goods will be delivered within 8 to 15 business days from the date of order confirmation, depending on your location and the customization involved. Made-to-order and bespoke tailoring pieces may fall toward the longer end of this window. Estimated delivery timelines are communicated at checkout and may vary due to courier delays, remote locations, or circumstances beyond our reasonable control.",
  },
  {
    heading: "4. Customization & Bespoke Orders",
    body: "For products offering size or design customization, the final piece is made specifically for you. Please ensure all measurements and preferences submitted are accurate, as customized orders cannot be modified once production has begun.",
  },
  {
    heading: "5. Returns, Exchanges & Cancellations",
    body: "Standard (non-customized) items may be eligible for return or exchange within the window stated on the product page, provided they are unused, unwashed, and in their original packaging with tags intact. Customized and made-to-order pieces are final sale and not eligible for return or exchange unless the item arrives damaged or defective. To initiate a return, replacement, or report an issue with your order, please use the Track Your Order page or contact our support team.",
  },
  {
    heading: "6. Product Descriptions & Colors",
    body: "We make every effort to display our products, including colors and fabric details, as accurately as possible. Minor variations may occur due to the handcrafted nature of our garments and differences in display screens, and do not constitute a defect.",
  },
  {
    heading: "7. Intellectual Property",
    body: "All content on this website, including images, designs, logos, and text, is the property of VStitch by Anjali Nanda and may not be reproduced, distributed, or used commercially without prior written consent.",
  },
  {
    heading: "8. Limitation of Liability",
    body: "VStitch by Anjali Nanda shall not be liable for any indirect, incidental, or consequential damages arising from the use of this website or the purchase of our products, to the extent permitted by applicable law.",
  },
  {
    heading: "9. Governing Law",
    body: "These Terms of Service are governed by and construed in accordance with the laws of India, and any disputes shall be subject to the exclusive jurisdiction of the courts in Gurugram, Haryana.",
  },
  {
    heading: "10. Contact Us",
    body: "For any questions regarding these Terms of Service, please reach out to us at vstitchbyanjalinanda@gmail.com or +91 99531 49142.",
  },
];

export default function TermsOfServiceModal({ onClose }) {
  return (
    <ModalShell title="Terms of Service" onClose={onClose}>
      <p className="text-xs text-charcoal/60">Last updated: August 2026</p>

      <div className="mt-4 space-y-5">
        {SECTIONS.map((section) => (
          <div key={section.heading}>
            <h3 className="font-display text-base text-ink">{section.heading}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-charcoal/75">{section.body}</p>
          </div>
        ))}
      </div>
    </ModalShell>
  );
}
