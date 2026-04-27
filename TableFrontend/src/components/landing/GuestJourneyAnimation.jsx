import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QrCode, CheckCircle2, ArrowRight } from "lucide-react";
import { PhoneFrame } from "./PhoneFrame";

const Motion = motion;

export function GuestJourneyAnimation() {
  const [phase, setPhase] = useState("idle");

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      while (isMounted) {
        setPhase("idle");
        await new Promise((r) => setTimeout(r, 1000));
        if (!isMounted) break;
        setPhase("scan");
        await new Promise((r) => setTimeout(r, 2200));
        if (!isMounted) break;
        setPhase("menu");
        await new Promise((r) => setTimeout(r, 1500));
        if (!isMounted) break;
        setPhase("add");
        await new Promise((r) => setTimeout(r, 1200));
        if (!isMounted) break;
        setPhase("pay");
        await new Promise((r) => setTimeout(r, 800));
        if (!isMounted) break;
        setPhase("status");
        await new Promise((r) => setTimeout(r, 4500));
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="relative w-full h-[580px] flex items-center justify-center overflow-visible">
      {/* QR Stand */}
      <div
        className={`absolute top-1/2 -mt-24 left-1/2 -ml-20 w-40 bg-white border border-border rounded-xl shadow-xl flex flex-col items-center p-5 transition-all duration-1000 ${phase === "scan" ? "scale-105 shadow-2xl opacity-50 z-20" : "scale-100 opacity-100 z-0"}`}
      >
        <p className="text-[14px] font-bold text-ink mb-4">Table 04</p>
        <QrCode size={90} className="text-ink" strokeWidth={1.5} />
        <p className="text-[10px] text-muted mt-4 font-semibold text-center leading-tight">
          Scan for
          <br />
          Spice Garden
        </p>
      </div>

      {/* The Phone */}
      <AnimatePresence>
        {phase !== "idle" && (
          <Motion.div
            key="phone"
            initial={{ x: 250, opacity: 0, rotate: 6 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            exit={{ x: 250, opacity: 0, rotate: 6 }}
            transition={{ duration: 0.65, type: "spring", bounce: 0.2 }}
            className="absolute left-1/2 -ml-[150px] z-30 shadow-full origin-bottom"
          >
            <PhoneFrame>
              <div className="w-full flex-1 bg-white relative overflow-hidden flex flex-col">
                <AnimatePresence mode="wait">
                  {phase === "scan" && (
                    <Motion.div
                      key="scan"
                      className="absolute inset-0 flex items-center justify-center overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {/* camera feed — blurred restaurant photo */}
                      <img
                        src="https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=400&q=60"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ filter: "brightness(0.28) blur(1.5px)" }}
                      />
                      {/* vignette */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.55) 100%)",
                        }}
                      />

                      {/* scanner viewfinder */}
                      <div className="relative z-10 flex flex-col items-center gap-3">
                        {/* corner-bracket outer guides */}
                        <div className="relative w-52 h-52 flex items-center justify-center">
                          {/* top-left bracket */}
                          <span className="absolute top-0 left-0 w-6 h-6 border-t-[3px] border-l-[3px] border-[#27c93f] rounded-tl-lg" />
                          {/* top-right bracket */}
                          <span className="absolute top-0 right-0 w-6 h-6 border-t-[3px] border-r-[3px] border-[#27c93f] rounded-tr-lg" />
                          {/* bottom-left bracket */}
                          <span className="absolute bottom-0 left-0 w-6 h-6 border-b-[3px] border-l-[3px] border-[#27c93f] rounded-bl-lg" />
                          {/* bottom-right bracket */}
                          <span className="absolute bottom-0 right-0 w-6 h-6 border-b-[3px] border-r-[3px] border-[#27c93f] rounded-br-lg" />

                          {/* QR card visible through camera — bright, clean, real */}
                          <div className="w-40 h-40 bg-white rounded-2xl flex flex-col items-center justify-center shadow-[0_0_32px_rgba(39,201,63,0.25)] relative overflow-hidden p-3">
                            <p className="text-[8px] font-bold text-ink mb-2 tracking-wide">
                              TABLE 04
                            </p>
                            <QrCode
                              size={88}
                              className="text-ink"
                              strokeWidth={1.2}
                            />
                            {/* green scan line sweeping across the QR */}
                            <Motion.div
                              initial={{ y: -44 }}
                              animate={{ y: 104 }}
                              transition={{
                                repeat: Infinity,
                                duration: 1.3,
                                ease: "linear",
                              }}
                              className="absolute left-0 right-0 h-[2px] bg-[#27c93f] shadow-[0_0_10px_3px_rgba(39,201,63,0.7)]"
                            />
                          </div>
                        </div>

                        <p className="text-white/75 text-[10px] tracking-[0.18em] font-semibold uppercase">
                          Scanning QR...
                        </p>
                      </div>
                    </Motion.div>
                  )}

                  {(phase === "menu" || phase === "add" || phase === "pay") && (
                    <Motion.div
                      key="menu"
                      className="absolute inset-0 bg-paper flex flex-col"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <div className="px-4 py-1.5 flex items-center justify-center bg-white border-b border-[#f0ebe0]">
                        <span className="text-[9px] font-bold tracking-widest text-ink">
                          BuzTap
                        </span>
                      </div>
                      <div className="relative h-32 shrink-0">
                        <img
                          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=70"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-3 left-4">
                          <p className="text-white text-[15px] font-bold">
                            Spice Garden
                          </p>
                          <p className="text-white/80 text-[9px]">Table 04</p>
                        </div>
                      </div>
                      <div className="flex-1 p-3 space-y-3 overflow-y-auto scroller">
                        {[
                          {
                            name: "Paneer Butter Masala",
                            price: "280",
                            img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=120&q=70",
                          },
                          {
                            name: "Dal Makhani",
                            price: "220",
                            img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=120&q=70",
                          },
                        ].map((item, i) => (
                          <div
                            key={item.name}
                            className="bg-white p-2.5 border border-border rounded-2xl flex gap-3 shadow-sm relative"
                          >
                            <img
                              src={item.img}
                              className="w-14 h-14 rounded-xl object-cover"
                            />
                            <div className="flex-1 flex flex-col justify-center">
                              <p className="text-[11px] font-bold text-ink leading-tight mb-1">
                                {item.name}
                              </p>
                              <p className="text-[10px] font-bold text-saffron">
                                ₹{item.price}
                              </p>
                            </div>
                            <div className="flex items-center justify-end">
                              <div
                                className={`border rounded-lg text-[9px] px-2.5 py-1.5 font-bold transition-colors ${phase !== "menu" && i === 0 ? "bg-saffron-lt text-saffron border-saffron" : "text-muted border-border"}`}
                              >
                                {phase !== "menu" && i === 0 ? "1" : "+ Add"}
                              </div>
                            </div>
                            {phase === "add" && i === 0 && (
                              <Motion.div
                                initial={{ scale: 2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="absolute right-3 top-8 w-6 h-6 bg-saffron/30 rounded-full flex items-center justify-center pointer-events-none z-10"
                              >
                                <div className="w-2 h-2 bg-saffron rounded-full" />
                              </Motion.div>
                            )}
                          </div>
                        ))}
                      </div>

                      <AnimatePresence>
                        {(phase === "add" || phase === "pay") && (
                          <Motion.div
                            initial={{ y: 60 }}
                            animate={{ y: 0 }}
                            exit={{ y: 60 }}
                            className="bg-white p-3 border-t border-border shadow-[0_-4px_10px_rgba(0,0,0,0.03)] relative"
                          >
                            <div className="w-full py-3 bg-saffron text-white rounded-xl flex items-center justify-between px-4 shadow-md">
                              <div className="flex flex-col">
                                <span className="text-[8px] text-white/80 uppercase tracking-wide">
                                  1 Item
                                </span>
                                <span className="text-[11px] font-bold">
                                  ₹280
                                </span>
                              </div>
                              <span className="text-[11px] font-bold flex items-center gap-1">
                                Checkout <ArrowRight size={12} />
                              </span>
                            </div>
                            {phase === "pay" && (
                              <Motion.div
                                initial={{
                                  scale: 2,
                                  opacity: 0,
                                  y: 10,
                                  x: -20,
                                }}
                                animate={{ scale: 1, opacity: 1, y: 0, x: 0 }}
                                className="absolute right-10 top-7 w-6 h-6 bg-black/30 rounded-full flex items-center justify-center"
                              >
                                <div className="w-2 h-2 bg-black rounded-full" />
                              </Motion.div>
                            )}
                          </Motion.div>
                        )}
                      </AnimatePresence>
                    </Motion.div>
                  )}

                  {phase === "status" && (
                    <Motion.div
                      key="status"
                      className="absolute inset-0 bg-sage-lt/60 flex flex-col items-center justify-center p-6 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="w-20 h-20 bg-[#27c93f] text-white rounded-full flex items-center justify-center mb-5 shadow-[0_4px_20px_rgba(39,201,63,0.3)]"
                      >
                        <CheckCircle2 size={40} />
                      </Motion.div>
                      <p className="text-[20px] font-bold text-sage">
                        Order Confirmed!
                      </p>
                      <p className="text-[12px] text-sage mt-1 mb-8 opacity-80">
                        Kitchen is preparing your food.
                      </p>

                      <div className="bg-white w-full rounded-2xl p-4 shadow-sm border border-[#27c93f]/20">
                        <div className="flex justify-between items-center border-b border-[#f0ebe0] pb-3 mb-3">
                          <span className="text-[11px] text-muted font-medium">
                            Table No.
                          </span>
                          <span className="text-[16px] font-black text-ink">
                            04
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-1">
                          <span className="text-[11px] text-muted font-medium">
                            Status
                          </span>
                          <span className="text-[10px] font-bold text-saffron bg-saffron-lt px-2.5 py-1 rounded-md tracking-wide">
                            PREPARING
                          </span>
                        </div>
                      </div>

                      <div className="mt-8 flex flex-col items-center gap-2">
                        <div className="w-3 h-3 bg-[#27c93f] rounded-full pulse-dot" />
                        <p className="text-[9px] font-bold text-sage uppercase tracking-widest opacity-80">
                          Live Tracking
                        </p>
                      </div>
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>
            </PhoneFrame>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
