import { useNavigate } from "react-router-dom";
import { useOverlay } from "../hooks/useOverlay";
import { CloseIcon } from "../components/Icons";
import AuthCard from "../components/AuthCard";

export default function AuthModal() {
  const navigate = useNavigate();
  const close = () => navigate(-1);

  useOverlay(true, close);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/55 px-5 py-10 backdrop-blur-sm sm:items-center"
      onClick={close}
    >
      <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="absolute -top-11 right-0 text-cream/90 transition-colors hover:text-cream"
        >
          <CloseIcon />
        </button>
        <AuthCard />
      </div>
    </div>
  );
}
