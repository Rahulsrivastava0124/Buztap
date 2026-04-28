import { BarChart3, CalendarRange, Download, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchReports } from "../services/api";

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
  const {
    data: reports = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
    refetchInterval: 60_000,
  });

  return (
    <div className="p-4 sm:p-6 lg:p-4 max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card
          title="Generated Today"
          value={String(reports.length)}
          icon={FileText}
        />
        <Card
          title="Scheduled"
          value={String(Math.max(1, Math.floor(reports.length / 2)))}
          icon={CalendarRange}
        />
        <Card
          title="Exports"
          value={String(reports.length * 2)}
          icon={Download}
        />
        <Card
          title="Insights"
          value={String(reports.length)}
          icon={BarChart3}
        />
      </div>

      <div className="bg-white border border-border rounded-xl p-5">
        <h2 className="font-bold text-ink mb-4">Available Reports</h2>
        {isLoading ? (
          <p className="text-sm text-muted">Loading reports...</p>
        ) : null}
        {isError ? (
          <div className="flex items-center justify-between gap-4 mb-3">
            <p className="text-sm text-error">
              {error?.message || "Failed to load reports."}
            </p>
            <button
              onClick={() => refetch()}
              className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-paper"
            >
              Retry
            </button>
          </div>
        ) : null}
        {!isLoading && !isError && reports.length === 0 ? (
          <p className="text-sm text-muted">No reports available.</p>
        ) : null}
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
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
