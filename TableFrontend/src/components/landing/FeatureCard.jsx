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
      className="relative bg-white rounded-2xl p-6 overflow-hidden cursor-default shadow-[0_1px_4px_rgba(15,14,11,0.07)] hover:shadow-[0_8px_32px_rgba(15,14,11,0.12)] transition-shadow duration-300"
      style={{
        background: hovered
          ? `radial-gradient(260px circle at ${pos.x}px ${pos.y}px, ${feature.glow}, #ffffff 65%)`
          : "#ffffff",
        transition: "background 0.08s, box-shadow 0.3s",
      }}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
        style={{ backgroundColor: feature.iconBg }}
      >
        <feature.icon
          size={24}
          strokeWidth={1.8}
          style={{ color: feature.accent }}
        />
      </div>
      <h3 className="font-bold text-[#0f0e0b] text-[15px] mb-2">
        {feature.title}
      </h3>
      <p className="text-sm text-[#857c6e] leading-relaxed">{feature.body}</p>
    </Motion.div>
  );
}
