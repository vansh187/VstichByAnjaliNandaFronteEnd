import ModalShell from "./ModalShell";

const SECTIONS = [
  {
    heading: "1. Introduction",
    body: "VStitch by Anjali Nanda (\"VStitch\", \"we\", \"us\") respects your privacy. This Privacy Policy explains what information we collect when you browse this website or place an order, how we use it, and the choices you have.",
  },
  {
    heading: "2. Information We Collect",
    body: "Account details you provide directly: name, username, email address, phone number, and password (stored securely, never in plain text) when you create an account. Order & delivery details: shipping address, order history, size/customization preferences, and payment status (payment card and UPI details themselves are handled directly by our payment gateway — we do not store your card number). Location: with your permission, your device's approximate coordinates, captured once when you first open the site and saved against your account if you go on to sign up or log in — used to serve you better (e.g. estimating delivery timelines). You may decline this prompt at any time with no impact on using the site. Communications: messages you send us via the customization/contact widget, WhatsApp, phone, or email. Newsletter: your email address, only if you choose to subscribe.",
  },
  {
    heading: "3. How We Use Your Information",
    body: "To create and manage your account, process and deliver your orders, communicate order updates, respond to customization requests and support queries, send newsletter updates (only if subscribed — you can unsubscribe at any time), and improve our website and product offerings.",
  },
  {
    heading: "4. Cookies & Local Storage",
    body: "We use your browser's local storage to keep you logged in between visits and to remember items in your cart. We do not use third-party advertising trackers on this site.",
  },
  {
    heading: "5. Sharing Your Information",
    body: "We do not sell your personal information. We share it only with the service providers necessary to run our business — payment gateways to process transactions, courier partners to deliver your order, and email/SMS providers to send order and account updates — and only to the extent needed for them to perform that service. We may also disclose information if required by law.",
  },
  {
    heading: "6. Data Security",
    body: "We use industry-standard measures, including encrypted password storage and secure (HTTPS) connections, to protect your information. No method of transmission or storage is 100% secure, and we continuously work to safeguard your data.",
  },
  {
    heading: "7. Your Choices & Rights",
    body: "You may update your account details, decline or revoke location access from your browser's site settings at any time, unsubscribe from our newsletter via the link in any email, and request access to, correction of, or deletion of your personal data by contacting us using the details below.",
  },
  {
    heading: "8. Data Retention",
    body: "We retain your account and order information for as long as your account is active or as needed to comply with our legal and tax obligations, resolve disputes, and enforce our agreements.",
  },
  {
    heading: "9. Children's Privacy",
    body: "Our website is not directed at children under 18, and we do not knowingly collect personal information from children.",
  },
  {
    heading: "10. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time to reflect changes in our practices. The \"Last updated\" date below will always reflect the most recent revision.",
  },
  {
    heading: "11. Contact Us",
    body: "For any questions about this Privacy Policy or your personal data, please reach out to us at vstitchbyanjalinanda@gmail.com or +91 99531 49142.",
  },
];

export default function PrivacyPolicyModal({ onClose }) {
  return (
    <ModalShell title="Privacy Policy" onClose={onClose}>
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
