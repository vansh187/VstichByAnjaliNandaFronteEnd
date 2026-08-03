import { useState } from "react";
import { useOverlay } from "../hooks/useOverlay";
import { inputClass } from "../utils/inputClass";
import FormField from "./FormField";
import { CloseIcon, CheckCircleIcon } from "./Icons";

const WHATSAPP_NUMBER = "919953149142";

const MEASUREMENT_FIELDS = [
  { key: "bust", label: "Bust (in)" },
  { key: "waist", label: "Waist (in)" },
  { key: "hips", label: "Hips (in)" },
  { key: "shoulder", label: "Shoulder (in)" },
  { key: "sleeveLength", label: "Sleeve Length (in)" },
  { key: "dressLength", label: "Dress Length (in)" },
];

const REQUIRED_FIELDS = ["name", "phone", ...MEASUREMENT_FIELDS.map((f) => f.key)];

function buildWhatsappMessage(productName, values) {
  const lines = [
    `Hi VStitch, I'd like to request a customized fit for:`,
    `*${productName}*`,
    ``,
    `Name: ${values.name}`,
    `Phone: ${values.phone}`,
    ``,
    `Measurements (inches):`,
    ...MEASUREMENT_FIELDS.map((f) => `- ${f.label.replace(" (in)", "")}: ${values[f.key]}`),
  ];
  if (values.notes.trim()) {
    lines.push("", `Notes: ${values.notes.trim()}`);
  }
  return lines.join("\n");
}

// No backend endpoint exists for customization requests, so this hands the
// filled-in form straight to the WhatsApp number already used for styling
// consultations elsewhere on the site (FloatingWhatsapp) rather than
// silently dropping it or inventing an API call that doesn't exist.
export default function CustomizationModal({ productName, onClose }) {
  const [values, setValues] = useState({
    name: "",
    phone: "",
    bust: "",
    waist: "",
    hips: "",
    shoulder: "",
    sleeveLength: "",
    dressLength: "",
    notes: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [sent, setSent] = useState(false);

  useOverlay(true, onClose);

  const setField = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = {};
    REQUIRED_FIELDS.forEach((key) => {
      if (!String(values[key]).trim()) errors[key] = "Required";
    });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const message = buildWhatsappMessage(productName, values);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setSent(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/55 px-5 py-10 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg border border-sand-dark bg-cream shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-sand-dark px-6 py-5">
          <h2 className="font-display text-xl text-ink">Request a Custom Fit</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-charcoal/60 hover:text-ink"
          >
            <CloseIcon width="20" height="20" />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-6 py-6">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircleIcon width="40" height="40" className="text-emerald-600" />
              <p className="font-display text-xl text-ink">Sent to our styling team</p>
              <p className="text-sm text-charcoal/70">
                We've opened WhatsApp with your measurements for{" "}
                <span className="font-medium text-ink">{productName}</span> — send the message to
                confirm your request and our team will follow up.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 bg-ink px-6 py-2.5 text-sm font-medium tracking-[0.12em] text-cream uppercase hover:bg-charcoal"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <p className="text-sm text-charcoal/70">
                Tell us your measurements for <span className="font-medium text-ink">{productName}</span>{" "}
                and our tailoring team will confirm a bespoke fit with you over WhatsApp.
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              </div>

              <div className="border-t border-sand-dark/70 pt-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-charcoal/60">
                  Your Measurements
                </p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {MEASUREMENT_FIELDS.map((f) => (
                    <FormField key={f.key} label={f.label} error={fieldErrors[f.key]}>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        inputMode="decimal"
                        value={values[f.key]}
                        onChange={(e) => setField(f.key, e.target.value)}
                        className={inputClass(fieldErrors[f.key])}
                      />
                    </FormField>
                  ))}
                </div>
              </div>

              <FormField label="Additional Notes (optional)">
                <textarea
                  value={values.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Any specific alterations, fabric preferences, or occasion details?"
                  className={inputClass(false)}
                />
              </FormField>

              <button
                type="submit"
                className="w-full bg-ink py-3 text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-charcoal"
              >
                Send to Our Styling Team
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
