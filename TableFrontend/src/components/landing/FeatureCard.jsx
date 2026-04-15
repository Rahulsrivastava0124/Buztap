import { useState } from "react";
import { motion } from "framer-motion";

const Motion = motion;

export function FeatureCard({ feature }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  return (
    <Motion.div
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative bg-white rounded-[26px] p-5 overflow-hidden cursor-default border border-[#eee5d8] shadow-[0_10px_28px_rgba(15,14,11,0.05)] hover:shadow-[0_16px_38px_rgba(15,14,11,0.08)] hover:-translate-y-1 transition-all duration-300"
      style={{
        background: hovered
          ? `radial-gradient(240px circle at ${pos.x}px ${pos.y}px, ${feature.glow}, #ffffff 60%)`
          : "#ffffff",
        transition: "background 0.08s, box-shadow 0.3s, transform 0.3s",
      }}
    >
      <div className="absolute inset-x-5 bottom-0 h-px bg-linear-to-r from-transparent via-[#efe4d6] to-transparent" />
      <div
        className="w-13 h-13 rounded-[18px] flex items-center justify-center mb-4 ring-1 ring-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
        style={{ backgroundColor: feature.iconBg }}
      >
        <feature.icon
          size={20}
          strokeWidth={2.1}
          style={{ color: feature.accent }}
        />
      </div>
      <h3 className="font-bold text-ink text-[15px] tracking-tight mb-2.5 group-hover:text-[#1e1c18]">
        {feature.title}
      </h3>
      <p className="text-[13px] text-muted leading-7">{feature.body}</p>
    </Motion.div>
  );
}
