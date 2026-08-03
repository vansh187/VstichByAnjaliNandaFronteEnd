import { useEffect, useRef, useState } from "react";
import { inputClass } from "../utils/inputClass";
import { submitCustomizationRequest } from "../lib/catalogApi";
import FormField from "./FormField";
import ModalShell from "./ModalShell";
import { CheckCircleIcon } from "./Icons";

const WHATSAPP_NUMBER = "919953149142";

// key: internal form state key, apiKey: field name the backend expects
// (see customization-request-frontend-integration.md).
const MEASUREMENT_FIELDS = [
  { key: "bust", apiKey: "bust_in", label: "Bust (in)" },
  { key: "waist", apiKey: "waist_in", label: "Waist (in)" },
  { key: "hips", apiKey: "hips_in", label: "Hips (in)" },
  { key: "shoulder", apiKey: "shoulder_in", label: "Shoulder (in)" },
  { key: "sleeveLength", apiKey: "sleeve_length_in", label: "Sleeve Length (in)" },
  { key: "dressLength", apiKey: "dress_length_in", label: "Dress Length (in)" },
];

const MIN_MEASUREMENT = 0.1;
const MAX_MEASUREMENT = 100;

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

function whatsappHref(productName, values) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsappMessage(productName, values))}`;
}

export default function CustomizationModal({ productId, variantId, productName, token, onClose }) {
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
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Same StrictMode double-invoke pitfall fixed in ReturnReplaceModal: this
  // has to be reset to true inside the effect body on every mount, not just
  // declared via useRef(true), or a dev-mode double-invoke leaves it stuck
  // false and every submit after that hangs forever.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const setField = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: null }));
  };

  const validate = () => {
    const errors = {};

    if (!values.name.trim()) errors.name = "Required";
    else if (values.name.trim().length > 250) errors.name = "Must be 250 characters or fewer";

    if (!values.phone.trim()) errors.phone = "Required";
    else if (values.phone.trim().length < 7 || values.phone.trim().length > 50) {
      errors.phone = "Enter a valid phone number";
    }

    MEASUREMENT_FIELDS.forEach(({ key }) => {
      const raw = values[key];
      if (!String(raw).trim()) {
        errors[key] = "Required";
        return;
      }
      const num = Number(raw);
      if (!Number.isFinite(num) || num < MIN_MEASUREMENT || num > MAX_MEASUREMENT) {
        errors[key] = `Enter a value between ${MIN_MEASUREMENT} and ${MAX_MEASUREMENT}`;
      }
    });

    if (values.notes.length > 500) errors.notes = "Must be 500 characters or fewer";

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!productId || !variantId) {
      // Shouldn't be reachable — the "Request bespoke measurements" link is
      // disabled on the product page until a size/variant is selected —
      // but fail loudly instead of sending a request with a missing id.
      setFormError("Please select a size before requesting a custom fit.");
      return;
    }

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    setFormError("");

    const payload = {
      customer_name: values.name.trim(),
      customer_phone: values.phone.trim(),
      bust_in: Number(values.bust),
      waist_in: Number(values.waist),
      hips_in: Number(values.hips),
      shoulder_in: Number(values.shoulder),
      sleeve_length_in: Number(values.sleeveLength),
      dress_length_in: Number(values.dressLength),
      ...(values.notes.trim() ? { notes: values.notes.trim() } : {}),
    };

    try {
      const data = await submitCustomizationRequest(productId, variantId, payload, token);
      if (!mountedRef.current) return;
      setResult(data);
    } catch (err) {
      if (!mountedRef.current) return;
      // 404 here would mean the product/variant id sent doesn't match what
      // was actually on the page — a bug, not a normal user-facing state —
      // but still surface a safe generic message instead of a blank error.
      setFormError(err.message || "Something went wrong. Please try again.");
      if (err.fieldErrors) {
        const mapped = {};
        MEASUREMENT_FIELDS.forEach(({ key, apiKey }) => {
          if (err.fieldErrors[apiKey]) mapped[key] = err.fieldErrors[apiKey];
        });
        if (err.fieldErrors.customer_name) mapped.name = err.fieldErrors.customer_name;
        if (err.fieldErrors.customer_phone) mapped.phone = err.fieldErrors.customer_phone;
        if (err.fieldErrors.notes) mapped.notes = err.fieldErrors.notes;
        setFieldErrors(mapped);
      }
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  };

  return (
    <ModalShell title="Request a Custom Fit" onClose={onClose} closeDisabled={submitting}>
      {result ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <CheckCircleIcon width="40" height="40" className="text-emerald-600" />
          <p className="font-display text-xl text-ink">Request submitted</p>
          <p className="text-sm text-charcoal/70">
            Request #{result.vstitch_customization_request_id} for{" "}
            <span className="font-medium text-ink">{productName}</span> has been saved — our
            studio will reach out to confirm your custom fit.
          </p>
          <a
            href={whatsappHref(productName, values)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium tracking-wide text-ink underline underline-offset-2 hover:text-gold"
          >
            Message us on WhatsApp too
          </a>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 bg-ink px-6 py-2.5 text-sm font-medium tracking-[0.12em] text-cream uppercase hover:bg-charcoal"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <p className="text-sm text-charcoal/70">
            Tell us your measurements for <span className="font-medium text-ink">{productName}</span>{" "}
            and our tailoring team will confirm a bespoke fit with you.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    min={MIN_MEASUREMENT}
                    max={MAX_MEASUREMENT}
                    step="0.1"
                    inputMode="decimal"
                    value={values[f.key]}
                    onChange={(e) => setField(f.key, e.target.value)}
                    disabled={submitting}
                    className={inputClass(fieldErrors[f.key])}
                  />
                </FormField>
              ))}
            </div>
          </div>

          <FormField label="Additional Notes (optional)" error={fieldErrors.notes}>
            <textarea
              value={values.notes}
              onChange={(e) => setField("notes", e.target.value)}
              rows={3}
              maxLength={500}
              disabled={submitting}
              placeholder="Any specific alterations, fabric preferences, or occasion details?"
              className={inputClass(fieldErrors.notes)}
            />
          </FormField>

          {formError && (
            <p className="border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-ink py-3 text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-charcoal disabled:cursor-not-allowed disabled:bg-sand-dark disabled:text-charcoal/40"
          >
            {submitting ? "Submitting…" : "Submit Custom Fit Request"}
          </button>
        </form>
      )}
    </ModalShell>
  );
}
