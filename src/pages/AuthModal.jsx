import { useNavigate } from "react-router-dom";
import { useOverlay } from "../hooks/useOverlay";
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
      <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <AuthCard onClose={close} />
      </div>
    </div>
  );
}
