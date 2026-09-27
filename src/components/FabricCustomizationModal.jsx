import { useEffect, useMemo, useState } from "react";
import { FRONTEND_BASE_URL } from "../lib/apiConfig";
import { whatsappHref } from "../utils/contact";
import { inputClass } from "../utils/inputClass";
import FormField from "./FormField";
import ModalShell from "./ModalShell";
import { CheckCircleIcon, WhatsappGlyphIcon } from "./Icons";

// Fabrics aren't sold through the cart - they're the starting point for a
// custom dress, so this collects the brief and hands the conversation off
// to the studio on WhatsApp. There's no backend upload endpoint, and wa.me
// links can only carry text, so: the fabric photo goes in as a link
// (WhatsApp renders a preview for it), and the customer's own design image
// is sent separately - via the native share sheet where the browser can
// share files (most phones), otherwise by attaching it in the opened chat.
const MAX_DESIGN_BYTES = 10 * 1024 * 1024;

function canShareFile(file) {
  try {
    return Boolean(file && navigator.canShare && navigator.canShare({ files: [file] }));
  } catch {
    return false;
  }
}

function buildMessage({ productName, productId, color, priceLabel, imageUrl }, values, hasDesign) {
  const lines = [
    "Hi VStitch by Anjali Nanda!",
    "I'd like to get a customized dress made with this fabric.",
    "",
    `*Fabric:* ${productName}`,
  ];
  if (color) lines.push(`*Colour:* ${color}`);
  if (priceLabel) lines.push(`*Fabric price:* ${priceLabel}`);
  if (productId) lines.push(`*Fabric link:* ${FRONTEND_BASE_URL}/product/${productId}`);
  if (imageUrl) lines.push(`*Fabric image:* ${imageUrl}`);
  lines.push("", `*Name:* ${values.name.trim()}`);
  if (values.phone.trim()) lines.push(`*Phone:* ${values.phone.trim()}`);
  if (values.dressType.trim()) lines.push(`*Dress I'd like:* ${values.dressType.trim()}`);
  lines.push(`*Metres needed:* ${values.metres.trim() || "Please advise"}`);
  if (values.notes.trim()) lines.push(`*Notes:* ${values.notes.trim()}`);
  lines.push(
    `*My design:* ${hasDesign ? "Sharing my design image in this chat" : "No design yet - open to your suggestions"}`,
    "",
    "Please share a customization quote (fabric + stitching) and the delivery timeline. Thank you!",
  );
  return lines.join("\n");
}

export default function FabricCustomizationModal({ productId, productName, color, priceLabel, imageUrl, onClose }) {
  const [values, setValues] = useState({ name: "", phone: "", dressType: "", metres: "", notes: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [design, setDesign] = useState(null);
  const [designError, setDesignError] = useState("");
  const [designInputKey, setDesignInputKey] = useState(0);
  const [sent, setSent] = useState(false);
  const [shareError, setShareError] = useState("");
  const [designShared, setDesignShared] = useState(false);

  const designPreview = useMemo(() => (design ? URL.createObjectURL(design) : null), [design]);
  useEffect(() => () => designPreview && URL.revokeObjectURL(designPreview), [designPreview]);

  const setField = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleDesignChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setDesignError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setDesignError("Please choose an image file (JPG, PNG, WEBP…)");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_DESIGN_BYTES) {
      setDesignError("Image must be 10 MB or smaller");
      e.target.value = "";
      return;
    }
    setDesign(file);
  };

  const validate = () => {
    const errors = {};
    if (!values.name.trim()) errors.name = "Required";
    else if (values.name.trim().length > 250) errors.name = "Must be 250 characters or fewer";
    const phone = values.phone.trim();
    if (phone && (phone.length < 7 || phone.length > 50)) errors.phone = "Enter a valid phone number";
    const metres = values.metres.trim();
    if (metres && !(Number(metres) > 0 && Number(metres) <= 100)) errors.metres = "Enter a value between 0.1 and 100";
    if (values.notes.length > 500) errors.notes = "Must be 500 characters or fewer";
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    const href = whatsappHref(
      buildMessage({ productName, productId, color, priceLabel, imageUrl }, values, Boolean(design)),
    );
    // Opened synchronously inside the click so popup blockers allow it;
    // in-app browsers that refuse new windows fall back to navigating.
    const win = window.open(href, "_blank", "noopener,noreferrer");
    if (!win) window.location.href = href;
    setSent(true);
  };

  const handleShareDesign = async () => {
    setShareError("");
    try {
      await navigator.share({
        files: [design],
        title: `My design for ${productName}`,
        text: `My design for the ${productName} fabric`,
      });
      setDesignShared(true);
    } catch (err) {
      if (err?.name !== "AbortError") {
        setShareError("Couldn't open sharing - please attach the image directly in the WhatsApp chat.");
      }
    }
  };

  const shareSupported = canShareFile(design);

  return (
    <ModalShell title="Request Customization" onClose={onClose}>
      {sent ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircleIcon width="40" height="40" className="text-emerald-600" />
          <p className="font-display text-xl text-ink">WhatsApp is opening</p>
          <p className="text-sm text-charcoal/70">
            Your request for <span className="font-medium text-ink">{productName}</span> is ready in the chat -
            just press send and our studio will reply with your customization quote.
          </p>

          {design && (
            <div className="mt-2 w-full border border-sand-dark bg-sand/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-charcoal/60">
                Now send your design
              </p>
              <img src={designPreview} alt="Your design" className="mx-auto mt-3 h-32 w-auto object-contain" />
              {shareSupported ? (
                <>
                  <button
                    type="button"
                    onClick={handleShareDesign}
                    className="mt-3 inline-flex items-center gap-2 bg-ink px-5 py-2.5 text-xs font-medium tracking-[0.12em] text-cream uppercase hover:bg-charcoal"
                  >
                    <WhatsappGlyphIcon width="16" height="16" />
                    {designShared ? "Shared ✓ - share again" : "Share design on WhatsApp"}
                  </button>
                  <p className="mt-2 text-xs text-charcoal/60">Pick WhatsApp, then the VStitch chat.</p>
                </>
              ) : (
                <p className="mt-3 text-xs text-charcoal/70">
                  Attach this image in the WhatsApp chat (📎 → Gallery / Photos) so we can quote your design.
                </p>
              )}
              {shareError && <p className="mt-2 text-xs text-red-700">{shareError}</p>}
            </div>
          )}

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setSent(false)}
              className="border border-ink px-6 py-2.5 text-sm font-medium tracking-[0.12em] text-ink uppercase hover:bg-ink hover:text-cream"
            >
              Edit Request
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-ink px-6 py-2.5 text-sm font-medium tracking-[0.12em] text-cream uppercase hover:bg-charcoal"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex gap-4">
            {imageUrl && (
              <img src={imageUrl} alt={productName} className="h-20 w-16 shrink-0 object-cover" />
            )}
            <div className="text-sm">
              <p className="font-medium text-ink">{productName}</p>
              {color && <p className="text-charcoal/70">Colour: {color}</p>}
              {priceLabel && <p className="text-charcoal/70">{priceLabel}</p>}
            </div>
          </div>
          <p className="text-sm text-charcoal/70">
            Tell us what you'd like made from this fabric. We'll open WhatsApp with your request so our studio can
            send you a quote and take it from there.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Full Name" required error={fieldErrors.name}>
              <input
                type="text"
                value={values.name}
                onChange={(e) => setField("name", e.target.value)}
                className={inputClass(fieldErrors.name)}
              />
            </FormField>
            <FormField label="Phone (optional)" error={fieldErrors.phone}>
              <input
                type="tel"
                value={values.phone}
                onChange={(e) => setField("phone", e.target.value)}
                className={inputClass(fieldErrors.phone)}
              />
            </FormField>
            <FormField label="Dress you'd like (optional)" error={fieldErrors.dressType}>
              <input
                type="text"
                value={values.dressType}
                maxLength={120}
                onChange={(e) => setField("dressType", e.target.value)}
                placeholder="e.g. Anarkali, gown, co-ord set"
                className={inputClass(fieldErrors.dressType)}
              />
            </FormField>
            <FormField label="Metres needed (optional)" error={fieldErrors.metres}>
              <input
                type="number"
                min="0.1"
                max="100"
                step="0.1"
                inputMode="decimal"
                value={values.metres}
                onChange={(e) => setField("metres", e.target.value)}
                placeholder="Not sure? Leave blank"
                className={inputClass(fieldErrors.metres)}
              />
            </FormField>
          </div>

          <FormField label="Upload your design (optional)" error={designError}>
            <input
              key={designInputKey}
              type="file"
              accept="image/*"
              onChange={handleDesignChange}
              className="block w-full text-sm text-charcoal/70 file:mr-3 file:border file:border-ink file:bg-transparent file:px-4 file:py-2 file:text-xs file:font-medium file:uppercase file:tracking-[0.12em] file:text-ink hover:file:bg-ink hover:file:text-cream"
            />
          </FormField>
          {designPreview && (
            <div className="flex items-center gap-3">
              <img src={designPreview} alt="Your design" className="h-20 w-20 border border-sand-dark object-cover" />
              <button
                type="button"
                onClick={() => {
                  setDesign(null);
                  // Remount the file input so re-picking the same file still fires onChange.
                  setDesignInputKey((k) => k + 1);
                }}
                className="text-xs font-medium tracking-wide text-ink underline underline-offset-2 hover:text-gold"
              >
                Remove
              </button>
            </div>
          )}

          <FormField label="Notes (optional)" error={fieldErrors.notes}>
            <textarea
              value={values.notes}
              onChange={(e) => setField("notes", e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Occasion, neckline, sleeves, lining, deadline…"
              className={inputClass(fieldErrors.notes)}
            />
          </FormField>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 bg-ink py-3 text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-charcoal"
          >
            <WhatsappGlyphIcon width="18" height="18" />
            Send Request on WhatsApp
          </button>
        </form>
      )}
    </ModalShell>
  );
}
