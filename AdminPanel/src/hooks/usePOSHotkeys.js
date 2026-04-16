import { useEffect } from "react";

export default function usePOSHotkeys({ onFocusSearch, onCheckout, onClear }) {
  useEffect(() => {
    const handler = (event) => {
      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        onFocusSearch?.();
      }
      if (event.code === "Space") {
        event.preventDefault();
        onCheckout?.();
      }
      if (event.key === "Escape") {
        onClear?.();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onFocusSearch, onCheckout, onClear]);
}
