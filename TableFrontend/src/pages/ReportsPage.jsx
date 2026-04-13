import { BarChart3, CalendarRange, Download, FileText } from "lucide-react";

const REPORTS = [
  { name: "Daily Sales Summary", period: "Today", owner: "System" },
  { name: "Category Mix Report", period: "Last 7 days", owner: "Manager" },
  { name: "Tax & GST Ledger", period: "This month", owner: "Finance" },
  { name: "Cancellation Analysis", period: "Last 30 days", owner: "Ops" },
];

function Card(props) {
  const Icon = props.icon;
  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <div className="flex justify-between items-center">
        <span className="text-xs uppercase tracking-wide font-bold text-muted">
          {props.title}
        </span>
        <Icon size={16} className="text-muted2" />
      </div>
      <p className="text-3xl font-roboto font-black mt-3 text-ink">
        {props.value}
      </p>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card title="Generated Today" value="12" icon={FileText} />
        <Card title="Scheduled" value="6" icon={CalendarRange} />
        <Card title="Exports" value="29" icon={Download} />
        <Card title="Insights" value="18" icon={BarChart3} />
      </div>

      <div className="bg-white border border-border rounded-xl p-5">
        <h2 className="font-bold text-ink mb-4">Available Reports</h2>
        <div className="space-y-3">
          {REPORTS.map((report) => (
            <div
              key={report.name}
              className="border border-cream rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-ink">{report.name}</p>
                <p className="text-xs text-muted">
                  Period: {report.period} • Owner: {report.owner}
                </p>
              </div>
              <button className="text-sm px-3 py-1.5 rounded-md bg-paper border border-border hover:bg-cream transition-colors">
                Open
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
