import { AnimatePresence, motion } from "framer-motion";
import { PhoneScreen } from "./PhoneScreen";
import { PhoneFrame } from "./PhoneFrame";
import { HOW_STEPS } from "../../data/database";

const Motion = motion;

export function AnimatedPhone({ activeStep }) {
  return (
    <PhoneFrame>
      {/* app bar */}
      <div className=" px-4 py-2 flex items-center justify-center shrink-0">
        <span className="text-black text-[10px] font-semibold tracking-widest">
          restroMenu
        </span>
      </div>
      {/* animated content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <Motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0"
          >
            <PhoneScreen screen={HOW_STEPS[activeStep].screen} />
          </Motion.div>
        </AnimatePresence>
      </div>
    </PhoneFrame>
  );
}
