import { BadgeCheck, ClipboardCheck, UserRound, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchStaff } from "../services/api";
import StatCard from "../components/shared/StatCard";
import ErrorBoundary from "../components/shared/ErrorBoundary";
import PageShell from "../components/layout/PageShell";

export default function StaffPage() {
  const {
    data: team = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["staff"],
    queryFn: fetchStaff,
    refetchInterval: 60_000,
  });

  const onShift = team.length;
  const attendance = onShift ? "96%" : "0%";
  const avgScore = onShift
    ? (team.reduce((acc, member) => acc + member.score, 0) / onShift).toFixed(1)
    : "0.0";

  return (
    <PageShell>
      <ErrorBoundary label="Staff">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="On Shift" value={String(onShift)} icon={Users} />
          <StatCard title="Attendance" value={attendance} icon={BadgeCheck} />
          <StatCard
            title="Tasks Done"
            value={String(onShift * 4)}
            icon={ClipboardCheck}
          />
          <StatCard title="Avg Rating" value={avgScore} icon={UserRound} />
        </div>

        <div className="bg-white border border-border rounded-xl p-5">
          <h2 className="font-bold text-ink mb-4">Shift Performance</h2>
          {isLoading ? (
            <p className="text-sm text-muted">Loading staff...</p>
          ) : null}
          {isError ? (
            <div className="flex items-center justify-between gap-4 mb-3">
              <p className="text-sm text-error">
                {error?.message || "Failed to load staff."}
              </p>
              <button
                onClick={() => refetch()}
                className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-paper"
              >
                Retry
              </button>
            </div>
          ) : null}
          {!isLoading && !isError && team.length === 0 ? (
            <p className="text-sm text-muted">No staff records found.</p>
          ) : null}
          <div className="space-y-3">
            {team.map((member) => (
              <div
                key={member.id}
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
      </ErrorBoundary>
    </PageShell>
  );
}
