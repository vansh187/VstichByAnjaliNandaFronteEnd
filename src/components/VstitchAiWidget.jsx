import { useState } from "react";
import { inputClass } from "../utils/inputClass";
import FormField from "./FormField";
import {
  ChatBubbleIcon,
  CloseIcon,
  ChevronLeftIcon,
  WhatsappGlyphIcon,
  RulerIcon,
  CheckCircleIcon,
} from "./Icons";

const WHATSAPP_NUMBER = "919953149142";
const ADMIN_EMAIL = "vstitchbyanjalinanda@gmail.com";

const CONSULTATION_MESSAGE =
  "Hi VStitch! I'd love to book a private styling consultation with Anjali Nanda to find pieces made for me.";

function consultationHref() {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(CONSULTATION_MESSAGE)}`;
}

function buildAdminEmailBody({ name, phone, email }) {
  return [
    "A customer has requested a custom outfit through the VStitch website.",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    "",
    "Please reach out to them as soon as possible to discuss their requirements.",
    "",
    "— Sent from the VStitch website",
  ].join("\n");
}

function adminMailHref({ name, phone, email }) {
  const subject = `Customization Required By ${name}`;
  const body = buildAdminEmailBody({ name, phone, email });
  return `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// "menu" -> the two main CTAs. "form" -> the customization contact form.
// "sent" -> confirmation after handing off to the visitor's mail app.
export default function VstitchAiWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("menu");
  const [values, setValues] = useState({ name: "", phone: "", email: "" });
  const [fieldErrors, setFieldErrors] = useState({});

  const resetAndClose = () => {
    setOpen(false);
    setView("menu");
    setValues({ name: "", phone: "", email: "" });
    setFieldErrors({});
  };

  const setField = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = {};
    if (!values.name.trim()) errors.name = "Required";
    if (!values.phone.trim()) errors.phone = "Required";
    if (!values.email.trim()) errors.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      errors.email = "Enter a valid email address";
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    window.location.href = adminMailHref(values);
    setView("sent");
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[320px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border border-sand-dark bg-cream shadow-2xl">
          <div className="flex items-center justify-between bg-ink px-4 py-3.5 text-cream">
            <div>
              <p className="font-display text-base leading-tight">VStitch AI</p>
              <p className="text-xs text-cream/70">Here to help you get styled</p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={resetAndClose}
              className="text-cream/80 hover:text-cream"
            >
              <CloseIcon width="18" height="18" />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-4">
            {view === "menu" && (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-charcoal/75">
                  Hi there! Whether you'd like personal styling advice or a piece made just for
                  you, we're one tap away.
                </p>

                <a
                  href={consultationHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 rounded-xl border border-sand-dark bg-ink px-4 py-3.5 text-left text-cream transition-colors hover:bg-charcoal"
                >
                  <WhatsappGlyphIcon width="22" height="22" className="mt-0.5 shrink-0" />
                  <span>
                    <span className="block text-sm font-medium tracking-wide">
                      Book a Private Consultation
                    </span>
                    <span className="mt-0.5 block text-xs text-cream/70">
                      Chat 1:1 with Anjali Nanda on WhatsApp
                    </span>
                  </span>
                </a>

                <button
                  type="button"
                  onClick={() => setView("form")}
                  className="flex items-start gap-3 rounded-xl border border-sand-dark bg-cream px-4 py-3.5 text-left text-ink transition-colors hover:bg-sand/60"
                >
                  <RulerIcon width="22" height="22" className="mt-0.5 shrink-0 text-gold" />
                  <span>
                    <span className="block text-sm font-medium tracking-wide">
                      Need a Custom Outfit?
                    </span>
                    <span className="mt-0.5 block text-xs text-charcoal/60">
                      Share your details — our studio will reach out
                    </span>
                  </span>
                </button>
              </div>
            )}

            {view === "form" && (
              <div>
                <button
                  type="button"
                  onClick={() => setView("menu")}
                  className="mb-3 flex items-center gap-1 text-xs font-medium tracking-wide text-charcoal/60 hover:text-ink"
                >
                  <ChevronLeftIcon width="14" height="14" />
                  Back
                </button>
                <p className="mb-4 text-sm text-charcoal/75">
                  Tell us how to reach you and our styling team will get in touch about your
                  custom outfit.
                </p>
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
                  <FormField label="Full Name" error={fieldErrors.name}>
                    <input
                      type="text"
                      value={values.name}
                      onChange={(e) => setField("name", e.target.value)}
                      className={inputClass(fieldErrors.name)}
                    />
                  </FormField>
                  <FormField label="Phone Number" error={fieldErrors.phone}>
                    <input
                      type="tel"
                      value={values.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      className={inputClass(fieldErrors.phone)}
                    />
                  </FormField>
                  <FormField label="Email" error={fieldErrors.email}>
                    <input
                      type="email"
                      value={values.email}
                      onChange={(e) => setField("email", e.target.value)}
                      className={inputClass(fieldErrors.email)}
                    />
                  </FormField>
                  <button
                    type="submit"
                    className="mt-1 w-full bg-ink py-3 text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-charcoal"
                  >
                    Contact Us
                  </button>
                </form>
              </div>
            )}

            {view === "sent" && (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircleIcon width="36" height="36" className="text-emerald-600" />
                <p className="font-display text-lg text-ink">Almost there</p>
                <p className="text-sm text-charcoal/70">
                  We've opened an email to our styling team with your details — please hit send
                  in your mail app to confirm your request.
                </p>
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="mt-1 bg-ink px-6 py-2.5 text-sm font-medium tracking-[0.12em] text-cream uppercase hover:bg-charcoal"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close VStitch AI" : "Open VStitch AI"}
        className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink text-cream shadow-xl transition-transform hover:scale-110"
      >
        {!open && <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-ink/40" />}
        {open ? <CloseIcon width="24" height="24" /> : <ChatBubbleIcon width="26" height="26" />}
      </button>
    </div>
  );
}
