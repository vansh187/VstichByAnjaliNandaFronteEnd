import { useEffect } from "react";

export function useClickOutside(ref, isActive, onOutside) {
  useEffect(() => {
    if (!isActive) return undefined;
    const handlePointer = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onOutside();
    };
    const handleKey = (e) => e.key === "Escape" && onOutside();
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [ref, isActive, onOutside]);
}
