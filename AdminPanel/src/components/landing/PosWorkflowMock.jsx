import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Utensils, CheckCircle2, FileText } from "lucide-react";
import { DesktopFrame } from "./DesktopScreens";

const Motion = motion;

const POS_WORKFLOW_STEPS = [
  {
    step: "Step 1",
    title: "Menu list",
    description:
      "Browse items, choose categories, build the order and send it to the kitchen instantly.",
    icon: null, // Will be Menu from lucide
    status: "Live",
    rows: [
      { label: "Paneer Butter Masala", value: "₹280" },
      { label: "Dal Makhani", value: "₹220" },
      { label: "Garlic Naan", value: "₹60" },
    ],
    sideTitle: "Selected Items",
    sideBody: "3 items selected and pushed to kitchen queue.",
    sideMeta: [
      { key: "Table", value: "04" },
      { key: "Order", value: "#0051" },
    ],
  },
  {
    step: "Step 2",
    title: "Checkout",
    description:
      "Review cart totals, apply taxes, and complete guest payment with fast, clear checkout.",
    icon: FileText,
    status: "Ready",
    rows: [
      { label: "Items", value: "3" },
      { label: "Subtotal", value: "₹560" },
      { label: "GST", value: "₹50" },
      { label: "Total", value: "₹610" },
    ],
    sideTitle: "Checkout Summary",
    sideBody: "Totals are calculated and ready for payment confirmation.",
    sideMeta: [
      { key: "Method", value: "UPI / Card" },
      { key: "Status", value: "Pending" },
    ],
  },
  {
    step: "Step 3",
    title: "Invoice & payment",
    description:
      "Generate invoices, collect payment and send receipts in one smooth step.",
    icon: CheckCircle2,
    status: "Paid",
    rows: [
      { label: "Invoice", value: "INV-0051" },
      { label: "Amount", value: "₹610" },
      { label: "Payment", value: "UPI" },
      { label: "Receipt", value: "Sent" },
    ],
    sideTitle: "Invoice Generated",
    sideBody: "Payment captured and digital receipt shared with the guest.",
    sideMeta: [
      { key: "Time", value: "12:42 PM" },
      { key: "Desk", value: "Front POS" },
    ],
  },
];

export function PosWorkflowMock() {
  const [activeStep, setActiveStep] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % POS_WORKFLOW_STEPS.length);
    }, 1800);

    return () => clearInterval(timer);
  }, [isHovered]);

  const current = POS_WORKFLOW_STEPS[activeStep];
  const menuItems = [
    {
      name: "Paneer Butter Masala",
      price: 280,
      qty: 1,
      img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=160&q=70",
    },
    {
      name: "Dal Makhani",
      price: 220,
      qty: 1,
      img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=160&q=70",
    },
    {
      name: "Garlic Naan",
      price: 60,
      qty: 2,
      img: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=160&q=70",
    },
  ];
  const posCatalog = [
    {
      name: "Paneer Butter Masala",
      price: 280,
      img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=320&q=70",
      selected: false,
    },
    {
      name: "Garlic Naan",
      price: 60,
      img: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=320&q=70",
      selected: false,
    },
    {
      name: "Dal Makhani",
      price: 220,
      img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=320&q=70",
      selected: false,
    },
    {
      name: "Chicken Tikka",
      price: 320,
      img: "https://images.unsplash.com/photo-1604908177225-4400f9f0f39b?w=320&q=70",
      selected: false,
    },
    {
      name: "Mango Lassi",
      price: 120,
      img: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=320&q=70",
      selected: false,
    },
    {
      name: "Veg Samosa (2pcs)",
      price: 80,
      img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=320&q=70",
      selected: false,
    },
    {
      name: "Butter Chicken",
      price: 380,
      img: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=320&q=70",
      selected: false,
    },
    {
      name: "Tandoori Roti",
      price: 30,
      img: "https://images.unsplash.com/photo-1551782450-17144efb9c50?w=320&q=70",
      selected: true,
    },
  ];

  return (
    <div
      className="space-y-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-wrap gap-2 justify-center">
        {POS_WORKFLOW_STEPS.map((item, index) => (
          <button
            key={item.step}
            type="button"
            onClick={() => setActiveStep(index)}
            className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] transition-all ${
              activeStep === index
                ? "bg-saffron text-white"
                : "bg-white text-muted border border-border"
            }`}
          >
            {item.step}
          </button>
        ))}
      </div>

      <DesktopFrame className="max-w-none">
        <div className="h-full bg-white flex flex-col">
          <div className="flex-1 p-2 bg-paper overflow-hidden">
            <AnimatePresence mode="wait">
              <Motion.div
                key={current.step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28 }}
                className={`h-full min-h-0 grid gap-4 ${
                  activeStep === 0
                    ? "md:grid-cols-[1.8fr_0.82fr]"
                    : "md:grid-cols-[1.2fr_0.8fr]"
                }`}
              >
                <div className="bg-white rounded-3xl border border-border p-5 shadow-sm min-h-0 overflow-hidden">
                  {activeStep === 0 && (
                    <div className="h-full min-h-0 flex flex-col">
                      <div className="relative mb-3">
                        <Search
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted2"
                        />
                        <input
                          readOnly
                          value="Search items by name..."
                          className="w-full bg-paper border border-border rounded-xl pl-10 pr-3 h-10 text-[14px] text-muted"
                        />
                      </div>

                      <div className="flex gap-2 mb-3 overflow-x-auto scroller">
                        {[
                          "All",
                          "Starters",
                          "Mains",
                          "Breads",
                          "Desserts",
                          "Beverages",
                        ].map((cat, idx) => (
                          <button
                            key={cat}
                            type="button"
                            className={`px-4 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap ${
                              idx === 0
                                ? "bg-saffron text-white"
                                : "bg-cream text-muted"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      <div className="flex-1 min-h-0 overflow-y-auto scroller pr-1">
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                          {posCatalog.map((item) => (
                            <div
                              key={item.name}
                              className={`rounded-2xl overflow-hidden border bg-white ${
                                item.selected
                                  ? "border-saffron shadow-[0_8px_24px_rgba(232,114,12,0.15)]"
                                  : "border-border"
                              }`}
                            >
                              <img
                                src={item.img}
                                alt={item.name}
                                className="w-full h-24 object-cover"
                              />
                              <div className="p-3">
                                <p className="text-[13px] font-semibold text-ink leading-tight truncate">
                                  {item.name}
                                </p>
                                <p className="text-saffron text-[13px] font-bold mt-1">
                                  ₹{item.price}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 1 && (
                    <div className="h-full min-h-0 overflow-y-auto scroller pr-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-saffron-lt text-saffron flex items-center justify-center">
                            <current.icon size={18} />
                          </div>
                          <div>
                            <p className="text-[10px] text-muted uppercase tracking-[0.2em] font-semibold">
                              {current.step}
                            </p>
                            <h3 className="text-xl font-bold text-ink">
                              {current.title}
                            </h3>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-saffron/10 text-saffron">
                          {current.status}
                        </span>
                      </div>

                      <p className="text-sm text-muted mb-4 max-w-xl">
                        {current.description}
                      </p>

                      <div className="space-y-3">
                        {menuItems.map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center justify-between border-b border-[#f0ebe0] pb-2 text-sm"
                          >
                            <span className="text-muted">
                              {item.name} × {item.qty}
                            </span>
                            <span className="font-semibold text-ink">
                              ₹{item.price * item.qty}
                            </span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between border-b border-[#f0ebe0] pb-2 text-sm">
                          <span className="text-muted">Subtotal</span>
                          <span className="font-semibold text-ink">₹620</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-[#f0ebe0] pb-2 text-sm">
                          <span className="text-muted">GST</span>
                          <span className="font-semibold text-ink">₹56</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 text-sm">
                          <span className="font-bold text-ink">Total</span>
                          <span className="font-bold text-ink">₹676</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div className="h-full min-h-0 overflow-y-auto scroller pr-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-saffron-lt text-saffron flex items-center justify-center">
                            <current.icon size={18} />
                          </div>
                          <div>
                            <p className="text-[10px] text-muted uppercase tracking-[0.2em] font-semibold">
                              {current.step}
                            </p>
                            <h3 className="text-xl font-bold text-ink">
                              {current.title}
                            </h3>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-saffron/10 text-saffron">
                          {current.status}
                        </span>
                      </div>

                      <p className="text-sm text-muted mb-4 max-w-xl">
                        {current.description}
                      </p>

                      <div className="rounded-2xl border border-[#f0ebe0] p-4 bg-paper">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-bold text-ink">
                            Invoice #INV-0051
                          </p>
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-sage-lt text-sage">
                            Payment Success
                          </span>
                        </div>
                        <div className="space-y-2 mb-3">
                          {[
                            "Items added to order",
                            "Checkout confirmed",
                            "Payment received",
                            "Receipt sent to guest",
                          ].map((line) => (
                            <div
                              key={line}
                              className="flex items-center gap-2 text-sm"
                            >
                              <CheckCircle2 size={14} className="text-sage" />
                              <span className="text-muted">{line}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                          <span className="font-semibold text-muted">
                            Amount Paid
                          </span>
                          <span className="font-bold text-ink">₹676</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {activeStep === 0 ? (
                  <div className="bg-white rounded-3xl border border-border p-0 shadow-sm flex flex-col overflow-hidden min-h-0">
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Utensils size={14} className="text-saffron" />
                        <h4 className="text-lg font-bold text-ink">
                          Current Order
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted">Table</span>
                        <span className="px-2.5 py-1 rounded-lg border border-border font-semibold text-xs text-saffron">
                          01
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center text-center px-6">
                      <div>
                        <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center mx-auto mb-4">
                          <Utensils size={24} className="text-muted2" />
                        </div>
                        <p className="text-lg font-bold text-muted mb-2">
                          No items in order.
                        </p>
                        <p className="text-xs text-muted2">
                          Tap an item on the left to add it.
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-border p-4 space-y-3">
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between text-muted">
                          <span>Subtotal</span>
                          <span className="font-semibold text-ink">₹0.00</span>
                        </div>
                        <div className="flex justify-between text-muted">
                          <span>Tax (5% GST)</span>
                          <span className="font-semibold text-ink">₹0.00</span>
                        </div>
                      </div>
                      <div className="flex justify-between border-t border-border pt-3 text-xl font-bold">
                        <span className="text-ink">Total</span>
                        <span className="text-saffron">₹0.00</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          className="h-8 rounded-xl border border-[#f0c49c] text-saffron text-sm font-semibold bg-white"
                        >
                          Cash
                        </button>
                        <button
                          type="button"
                          className="h-8 rounded-xl border border-[#f0c49c] text-saffron text-sm font-semibold bg-[#f8d8b7]"
                        >
                          Card
                        </button>
                      </div>
                      <button
                        type="button"
                        className="w-full h-10 rounded-xl bg-sage text-white text-sm font-bold"
                      >
                        Send to Kitchen
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-border p-5 shadow-sm flex flex-col min-h-0 overflow-y-auto scroller">
                    <h4 className="text-base font-bold text-ink mb-2">
                      {current.sideTitle}
                    </h4>
                    <p className="text-sm text-muted leading-relaxed mb-4">
                      {current.sideBody}
                    </p>

                    <div className="mt-auto space-y-2">
                      {current.sideMeta.map((meta) => (
                        <div
                          key={meta.key}
                          className="flex justify-between text-sm border-b border-[#f0ebe0] pb-2"
                        >
                          <span className="text-muted">{meta.key}</span>
                          <span className="font-semibold text-ink">
                            {meta.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Motion.div>
            </AnimatePresence>
          </div>
        </div>
      </DesktopFrame>

      <div className="flex items-center justify-center gap-2">
        {POS_WORKFLOW_STEPS.map((item, index) => (
          <button
            key={item.step}
            type="button"
            onClick={() => setActiveStep(index)}
            className={`h-2.5 rounded-full transition-all ${
              index === activeStep ? "w-8 bg-saffron" : "w-2.5 bg-border"
            }`}
            aria-label={`Go to ${item.step}`}
          />
        ))}
      </div>
    </div>
  );
}
