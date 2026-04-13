import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const Motion = motion;

export function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className="border-b border-border">
      <button
        className="w-full flex items-center justify-between py-4 text-left gap-4"
        onClick={onToggle}
      >
        <span className="text-sm font-semibold text-ink">{q}</span>
        <Motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-saffron shrink-0"
        >
          <ChevronDown size={18} />
        </Motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <Motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-muted leading-relaxed">{a}</p>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
