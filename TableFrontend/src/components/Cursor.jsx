import { useEffect, useRef } from "react";

export default function Cursor() {
  const curRef = useRef(null);

  useEffect(() => {
    const cur = curRef.current;
    if (!cur) return;

    const onMove = (e) => {
      cur.style.left = e.clientX - 6 + "px";
      cur.style.top = e.clientY - 6 + "px";
    };

    const onOver = (e) => {
      if (e.target.closest("a, button, .num-cell, .bento-card")) {
        cur.style.width = "28px";
        cur.style.height = "28px";
        cur.style.transform = "translate(-8px,-8px)";
      } else {
        cur.style.width = "12px";
        cur.style.height = "12px";
        cur.style.transform = "none";
      }
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
    };
  }, []);

  return (
    <div
      ref={curRef}
      className="fixed pointer-events-none z-[9999] rounded-full mix-blend-multiply hidden md:block"
      style={{
        width: "12px",
        height: "12px",
        background: "#f4790b",
        top: 0,
        left: 0,
        transition: "width .2s, height .2s, transform .15s",
      }}
    />
  );
}
