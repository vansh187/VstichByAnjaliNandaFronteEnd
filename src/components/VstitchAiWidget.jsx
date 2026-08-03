import { useEffect, useRef, useState } from "react";
import { inputClass } from "../utils/inputClass";
import { submitCustomizationInterest } from "../lib/catalogApi";
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

function customizationFallbackMessage({ name, phone, email }) {
  return [
    "Hi VStitch! I'd like to request a custom outfit. Here are my details:",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email}`,
  ].join("\n");
}

function customizationWhatsappHref(values) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(customizationFallbackMessage(values))}`;
}

function adminMailHref({ name, phone, email }) {
  const subject = `Customization Required By ${name}`;
  const body = [
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
  return `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// "menu" -> the two main CTAs. "form" -> the customization contact form.
// "sent" -> confirmation after a successful submit. "error" -> the
// WhatsApp/email fallback shown when the request couldn't go through -
// per the backend team, every non-2xx (422/429/500) is treated the same
// way here rather than differentiated, since it's a 3-field contact form.
export default function VstitchAiWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("menu");
  const [values, setValues] = useState({ name: "", phone: "", email: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Same StrictMode double-invoke pitfall fixed in ReturnReplaceModal /
  // CustomizationModal: reset to true inside the effect body on every
  // mount, not just declared via useRef(true).
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const resetAndClose = () => {
    if (submitting) return;
    setOpen(false);
    setView("menu");
    setValues({ name: "", phone: "", email: "" });
    setFieldErrors({});
  };

  const setField = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

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

    setSubmitting(true);
    try {
      await submitCustomizationInterest({
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
      });
      if (!mountedRef.current) return;
      setView("sent");
    } catch {
      // Per the backend team: don't differentiate 422/429/500 here - just
      // drop straight to the WhatsApp/email fallback rather than trying to
      // surface granular errors on a 3-field contact form.
      if (!mountedRef.current) return;
      setView("error");
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
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
              disabled={submitting}
              className="text-cream/80 hover:text-cream disabled:cursor-not-allowed disabled:opacity-40"
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
                  disabled={submitting}
                  className="mb-3 flex items-center gap-1 text-xs font-medium tracking-wide text-charcoal/60 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
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
                      disabled={submitting}
                      className={inputClass(fieldErrors.name)}
                    />
                  </FormField>
                  <FormField label="Phone Number" error={fieldErrors.phone}>
                    <input
                      type="tel"
                      value={values.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      disabled={submitting}
                      className={inputClass(fieldErrors.phone)}
                    />
                  </FormField>
                  <FormField label="Email" error={fieldErrors.email}>
                    <input
                      type="email"
                      value={values.email}
                      onChange={(e) => setField("email", e.target.value)}
                      disabled={submitting}
                      className={inputClass(fieldErrors.email)}
                    />
                  </FormField>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-1 w-full bg-ink py-3 text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-charcoal disabled:cursor-not-allowed disabled:bg-sand-dark disabled:text-charcoal/40"
                  >
                    {submitting ? "Sending…" : "Contact Us"}
                  </button>
                </form>
              </div>
            )}

            {view === "sent" && (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircleIcon width="36" height="36" className="text-emerald-600" />
                <p className="font-display text-lg text-ink">Request sent</p>
                <p className="text-sm text-charcoal/70">
                  Thank you! Our styling team has been notified and will reach out to you
                  shortly to discuss your custom outfit.
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

            {view === "error" && (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <p className="font-display text-lg text-ink">Couldn't reach us just now</p>
                <p className="text-sm text-charcoal/70">
                  Please message us directly instead — we've kept your details ready to send.
                </p>
                <a
                  href={customizationWhatsappHref(values)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 bg-ink py-3 text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-charcoal"
                >
                  <WhatsappGlyphIcon width="18" height="18" />
                  Message on WhatsApp
                </a>
                <a
                  href={adminMailHref(values)}
                  className="text-xs font-medium tracking-wide text-ink underline underline-offset-2 hover:text-gold"
                >
                  or email us directly
                </a>
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="mt-1 text-xs font-medium tracking-wide text-charcoal/60 hover:text-ink"
                >
                  Close
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
