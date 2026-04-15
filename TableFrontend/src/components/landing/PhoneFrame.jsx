import { Signal, Wifi } from "lucide-react";

export function PhoneFrame({ children, className = "" }) {
  return (
    <div className={`relative w-[300px] shrink-0 ${className}`}>
      {/* outer shell */}
      <div className="relative bg-[#141210] rounded-[52px] p-3 shadow-[0_40px_90px_rgba(15,14,11,0.28),inset_0_1px_0_rgba(255,255,255,0.07)]">
        {/* volume buttons */}
        <div className="absolute -left-[3px] top-[80px] w-[3px] h-8 bg-[#1e1c18] rounded-l-sm" />
        <div className="absolute -left-[3px] top-[122px] w-[3px] h-8 bg-[#1e1c18] rounded-l-sm" />
        {/* power button */}
        <div className="absolute -right-[3px] top-[100px] w-[3px] h-14 bg-[#1e1c18] rounded-r-sm" />
        {/* dynamic island */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[90px] h-7 bg-[#141210] rounded-full z-10 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#2a2722]" />
          <div className="w-[5px] h-[5px] rounded-full bg-[#232120]" />
        </div>
        <div className="absolute top-6 left-7 right-7 mx-1 z-10 flex items-center justify-between pointer-events-none text-black">
          <span className="text-[11px] font-semibold tracking-wide">9:41</span>
          <div className="flex items-center gap-1.5">
            <Signal size={12.5} strokeWidth={2.6} />
            <Wifi size={12.5} strokeWidth={2.6} />
            <div className="relative w-5.5 h-3.25 rounded-sm border-[1.8px] border-current">
              <div className="absolute left-0.5 top-0.5 bottom-0.5 right-1 rounded-xs bg-current" />
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-0.75 h-1.5 rounded-r-sm bg-current" />
            </div>
          </div>
        </div>
        {/* screen */}
        <div
          className="w-full rounded-[40px] overflow-hidden flex flex-col bg-paper"
          style={{ minHeight: 580 }}
        >
          {/* island spacer */}
          <div className="h-9 shrink-0 " />
          {children}
        </div>
      </div>
    </div>
  );
}
