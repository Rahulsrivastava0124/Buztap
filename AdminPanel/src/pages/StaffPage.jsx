import { BadgeCheck, ClipboardCheck, UserRound, Users } from "lucide-react";

const TEAM = [
  { name: "Aman", role: "Captain", shift: "Morning", score: 92 },
  { name: "Neha", role: "Server", shift: "Evening", score: 88 },
  { name: "Ravi", role: "Chef", shift: "Morning", score: 95 },
  { name: "Salma", role: "Cashier", shift: "Evening", score: 90 },
];

function Tile(props) {
  const Icon = props.icon;
  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">
          {props.title}
        </p>
        <Icon size={16} className="text-muted2" />
      </div>
      <p className="text-3xl font-roboto font-black mt-3 text-ink">
        {props.value}
      </p>
    </div>
  );
}

export default function StaffPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Tile title="On Shift" value="18" icon={Users} />
        <Tile title="Attendance" value="96%" icon={BadgeCheck} />
        <Tile title="Tasks Done" value="74" icon={ClipboardCheck} />
        <Tile title="Avg Rating" value="4.7" icon={UserRound} />
      </div>

      <div className="bg-white border border-border rounded-xl p-5">
        <h2 className="font-bold text-ink mb-4">Shift Performance</h2>
        <div className="space-y-3">
          {TEAM.map((member) => (
            <div
              key={member.name}
              className="border border-cream rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-ink">{member.name}</p>
                <p className="text-xs text-muted">
                  {member.role} • {member.shift} shift
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted">Service Score</p>
                <p className="font-bold text-saffron">{member.score}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
