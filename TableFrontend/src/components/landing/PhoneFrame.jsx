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
