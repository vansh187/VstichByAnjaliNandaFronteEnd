import { useLocation, useNavigate } from "react-router-dom";

const STATE_KEY = "openModal";

// Keeps a modal's open state in the router's history instead of component
// state, so the phone/browser Back button closes it rather than leaving the
// page underneath. Opening pushes a same-URL router entry tagged with `id`;
// closing (X, Done, Escape, backdrop) steps back off it; Back pops it; and
// Forward or a reload on that entry simply shows the modal again - so every
// history entry always matches what's on screen. Going through the router
// (not raw history.pushState) keeps its navigation bookkeeping, e.g.
// BackButton's history tracking, in step.
//
// `id` must be unique among modals that can be open on the same page (e.g.
// include the product id when every card has its own modal).
export function useHistoryModal(id) {
  const location = useLocation();
  const navigate = useNavigate();
  const isOpen = location.state?.[STATE_KEY] === id;

  const open = () => {
    if (isOpen) return;
    navigate(
      { pathname: location.pathname, search: location.search, hash: location.hash },
      { state: { ...location.state, [STATE_KEY]: id }, preventScrollReset: true },
    );
  };

  const close = () => {
    if (isOpen) navigate(-1);
  };

  return [isOpen, open, close];
}
