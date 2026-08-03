import { useOverlay } from "../hooks/useOverlay";
import { CloseIcon } from "./Icons";

// Shared fixed-overlay/backdrop/header shell used by every modal
// (ReturnReplaceModal, SizeGuideModal, CustomizationModal, ...) so the
// overlay behavior (Escape/backdrop-click/close-button, scroll lock,
// blocking close mid-submit) only needs to be gotten right in one place.
export default function ModalShell({ title, onClose, closeDisabled = false, children }) {
  const guardedClose = () => {
    if (closeDisabled) return;
    onClose();
  };

  useOverlay(true, guardedClose);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/55 px-5 py-10 backdrop-blur-sm sm:items-center"
      onClick={guardedClose}
    >
      <div
        className="w-full max-w-lg border border-sand-dark bg-cream shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-sand-dark px-6 py-5">
          <h2 className="font-display text-xl text-ink">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={guardedClose}
            disabled={closeDisabled}
            className="text-charcoal/60 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CloseIcon width="20" height="20" />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
