import { Bell, Building2, Globe2, ShieldCheck } from "lucide-react";

const SETTINGS = [
  {
    title: "Restaurant Profile",
    desc: "Brand name, contact details, tax information",
    icon: Building2,
  },
  {
    title: "Notifications",
    desc: "Kitchen alerts, order SLA, and payout messages",
    icon: Bell,
  },
  {
    title: "Access & Security",
    desc: "Roles, PIN lock, and device permissions",
    icon: ShieldCheck,
  },
  {
    title: "Regional Preferences",
    desc: "Timezone, language, currency and taxes",
    icon: Globe2,
  },
];

export default function SettingsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="bg-white border border-border rounded-xl p-5">
        <h2 className="font-bold text-ink">Admin Settings</h2>
        <p className="text-sm text-muted mt-1">
          Manage store, users, and operational configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SETTINGS.map((item) => (
          <div
            key={item.title}
            className="bg-white border border-border rounded-xl p-5"
          >
            <div className="w-10 h-10 rounded-lg bg-paper border border-border flex items-center justify-center mb-3">
              <item.icon size={18} className="text-saffron" />
            </div>
            <h3 className="font-semibold text-ink">{item.title}</h3>
            <p className="text-sm text-muted mt-1">{item.desc}</p>
            <button className="mt-4 text-sm px-3 py-1.5 rounded-md bg-saffron text-white hover:bg-saffron2 transition-colors">
              Configure
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
