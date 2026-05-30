import {
  BadgeCheck,
  CalendarDays,
  ClipboardCheck,
  Eye,
  Pencil,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  ArrowPathIcon,
  CalendarDaysIcon,
  CheckCircleIcon as HeroCheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon as HeroXCircleIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  fetchBusinessProfile,
  fetchStaff,
  createStaffMember,
  updateStaffMember,
  updateBusinessProfile,
  deleteStaffMember,
  punchInStaff,
  punchOutStaff,
  fetchStaffLeaveRequests,
  reviewStaffLeaveRequest,
} from "../services/api";
import StatCard from "../components/shared/StatCard";
import ErrorBoundary from "../components/shared/ErrorBoundary";
import PageShell from "../components/layout/PageShell";

// ─── Designation config ───────────────────────────────────────────────────────
const DESIGNATION_ROLE_MAP = {
  Admin: "admin",
  Manager: "manager",
  Receptionist: "cashier",
  Kitchen: "cashier",
  Waiter: "cashier",
  Employee: "cashier",
};

const DESIGNATIONS = [
  { value: "Manager", label: "Manager" },
  { value: "Receptionist", label: "Receptionist" },
  { value: "Kitchen", label: "Kitchen Staff" },
  { value: "Waiter", label: "Waiter" },
  { value: "Employee", label: "Employee" },
  { value: "Admin", label: "Admin" },
];

const DESIGNATION_PERMISSIONS = {
  Admin: [
    { label: "Full Access", color: "badge-error" },
    { label: "Manage Staff", color: "badge-warning" },
    { label: "Reports", color: "badge-info" },
    { label: "Settings", color: "badge-success" },
  ],
  Manager: [
    { label: "View Reports", color: "badge-info" },
    { label: "Manage Staff", color: "badge-warning" },
    { label: "Manage Menu", color: "badge-success" },
    { label: "View Inventory", color: "badge-ghost" },
  ],
  Receptionist: [
    { label: "POS / Billing", color: "badge-success" },
    { label: "Table Management", color: "badge-info" },
    { label: "View Orders", color: "badge-ghost" },
    { label: "Guest Check-in", color: "badge-warning" },
  ],
  Kitchen: [
    { label: "View KOT", color: "badge-warning" },
    { label: "Update Order Status", color: "badge-info" },
  ],
  Waiter: [
    { label: "Take Orders", color: "badge-success" },
    { label: "View KOT", color: "badge-info" },
    { label: "Request Bill", color: "badge-ghost" },
  ],
  Employee: [
    { label: "Basic Access", color: "badge-ghost" },
    { label: "View Schedule", color: "badge-info" },
  ],
};

// Shift timing is now handled via shiftTiming object

const ATTENDANCE_STYLES = {
  work: {
    label: "Work",
    badge: "bg-green-100 text-green-700 border-green-200",
  },
  absent: {
    label: "Absent",
    badge: "bg-red-100 text-red-700 border-red-200",
  },
  holiday: {
    label: "Holiday",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
  },
  weekOff: {
    label: "Week Off",
    badge: "bg-violet-100 text-violet-700 border-violet-200",
  },
  halfDay: {
    label: "Half Day",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
  },
  unmarked: {
    label: "No Record",
    badge: "bg-gray-100 text-gray-700 border-gray-200",
  },
};

function toDateKey(dateObj) {
  // Always use UTC to avoid timezone mismatches
  return [
    dateObj.getUTCFullYear(),
    String(dateObj.getUTCMonth() + 1).padStart(2, "0"),
    String(dateObj.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function getAttendanceStatus(
  recordsByDate,
  dateObj,
  weekOffDays = [0],
  joiningDate,
) {
  const directStatus = recordsByDate[toDateKey(dateObj)];
  if (directStatus) return directStatus;
  if (joiningDate) {
    const joinDate = new Date(joiningDate);
    const joinKey = toDateKey(joinDate);
    const dateKey = toDateKey(dateObj);
    if (dateKey < joinKey) return "unmarked";
  }
  if (weekOffDays.includes(dateObj.getDay())) return "weekOff";
  const todayKey = toDateKey(new Date());
  const dateKey = toDateKey(dateObj);
  if (dateKey < todayKey) return "absent";
  return "unmarked";
}

function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function formatHolidayDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatLeaveDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getLeaveDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.max(1, Math.floor((end - start) / 86400000) + 1);
}

const LEAVE_STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-700 border-gray-200",
};

function LeaveRequestsPanel({
  requests,
  isLoading,
  isError,
  onRetry,
  onReview,
  isReviewing,
}) {
  const [activeTab, setActiveTab] = useState("pending");
  const pending = requests.filter((request) => request.status === "pending");
  const history = requests.filter((request) => request.status !== "pending");
  const visibleRequests = activeTab === "pending" ? pending : history;

  function getStatusIcon(status) {
    if (status === "approved") return HeroCheckCircleIcon;
    if (status === "rejected") return HeroXCircleIcon;
    if (status === "pending") return ExclamationCircleIcon;
    return CalendarDaysIcon;
  }

  function handleReview(request, status) {
    const managerNote =
      status === "rejected" ? window.prompt("Reason for rejection?") || "" : "";

    onReview({
      staffId: request.staffId,
      requestId: request.id,
      status,
      managerNote,
    });
  }

  return (
    <div className="bg-white border border-border rounded-xl p-5 mt-4">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 className="font-bold text-ink text-lg">Leave Requests</h2>
          <p className="text-sm text-muted">
            Review employee leave requests and keep leave balances updated.
          </p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="btn btn-outline btn-sm gap-1.5"
        >
          <ArrowPathIcon className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="tabs tabs-boxed bg-paper/70 mb-4 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={`tab tab-sm ${activeTab === "pending" ? "tab-active" : ""}`}
        >
          Pending ({pending.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`tab tab-sm ${activeTab === "history" ? "tab-active" : ""}`}
        >
          History ({history.length})
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-md text-primary" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
          Failed to load leave requests.
        </div>
      )}

      {!isLoading && !isError && visibleRequests.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-paper/50 px-4 py-8 text-center">
          <CalendarDaysIcon className="mx-auto mb-2 h-7 w-7 text-muted opacity-40" />
          <p className="text-sm text-muted">
            {activeTab === "pending"
              ? "No pending leave requests."
              : "No leave history yet."}
          </p>
        </div>
      )}

      {!isLoading && !isError && visibleRequests.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-paper/30">
          {visibleRequests.map((request) => {
            const statusClass =
              LEAVE_STATUS_STYLES[request.status] ||
              LEAVE_STATUS_STYLES.pending;
            const leaveDays = getLeaveDays(request.startDate, request.endDate);
            const StatusIcon = getStatusIcon(request.status);

            return (
              <div
                key={`${request.staffId}-${request.id}`}
                className="border-b border-border p-4 last:border-b-0 sm:p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink">
                        {request.staffName || "Staff member"}
                      </p>
                      <span
                        className={`badge badge-sm gap-1 border capitalize ${statusClass}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {request.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {request.staffDesignation || "Employee"} ·{" "}
                      {request.leaveType} Leave
                    </p>

                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      <div className="rounded-lg border border-border bg-white px-3 py-2">
                        <p className="text-[11px] text-muted">From</p>
                        <p className="text-sm font-semibold text-ink">
                          {formatLeaveDate(request.startDate)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border bg-white px-3 py-2">
                        <p className="text-[11px] text-muted">To</p>
                        <p className="text-sm font-semibold text-ink">
                          {formatLeaveDate(request.endDate)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border bg-white px-3 py-2">
                        <p className="text-[11px] text-muted">Days</p>
                        <p className="text-sm font-semibold text-ink">
                          {leaveDays}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-slate-700">
                      {request.reason || "No reason provided."}
                    </p>
                    {request.managerNote ? (
                      <p className="mt-2 text-xs text-muted">
                        Manager note: {request.managerNote}
                      </p>
                    ) : null}
                  </div>

                  {request.status === "pending" && (
                    <div className="flex gap-2 self-end lg:self-center">
                      <button
                        type="button"
                        disabled={isReviewing || !request.staffId}
                        onClick={() => handleReview(request, "rejected")}
                        className="btn btn-outline btn-error btn-sm gap-1.5"
                      >
                        <HeroXCircleIcon className="h-4 w-4" /> Reject
                      </button>
                      <button
                        type="button"
                        disabled={isReviewing || !request.staffId}
                        onClick={() => handleReview(request, "approved")}
                        className="btn btn-success btn-sm gap-1.5 text-white"
                      >
                        <HeroCheckCircleIcon className="h-4 w-4" /> Approve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AttendanceCalendarModal({
  member,
  monthDate,
  attendanceOverrides,
  weekOffDays = [0],
  onPrevMonth,
  onNextMonth,
  onSetDayStatus,
  onPunchIn,
  onPunchOut,
  isPunchingIn,
  isPunchingOut,
  onClose,
}) {
  const [selectedDateKey, setSelectedDateKey] = useState(null);
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const monthEnd = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0,
  );
  const totalDays = monthEnd.getDate();
  const startWeekday = monthStart.getDay();
  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const storedRecordsByDate = (member?.attendanceRecords || []).reduce(
    (acc, record) => {
      const d = new Date(record.date);
      if (!Number.isNaN(d.getTime())) {
        acc[toDateKey(d)] = record.status;
      }
      return acc;
    },
    {},
  );
  const storedRecordDetailsByDate = (member?.attendanceRecords || []).reduce(
    (acc, record) => {
      const d = new Date(record.date);
      if (!Number.isNaN(d.getTime())) {
        acc[toDateKey(d)] = record;
      }
      return acc;
    },
    {},
  );
  const recordsByDate = {
    ...storedRecordsByDate,
    ...(attendanceOverrides || {}),
  };

  const cells = [];
  const monthStatusCount = {
    work: 0,
    absent: 0,
    holiday: 0,
    weekOff: 0,
    halfDay: 0,
    unmarked: 0,
  };
  const todayKey = toDateKey(new Date());
  for (let i = 0; i < startWeekday; i += 1) cells.push(null);
  for (let day = 1; day <= totalDays; day += 1) {
    const dateObj = new Date(
      Date.UTC(monthDate.getFullYear(), monthDate.getMonth(), day),
    );
    const key = toDateKey(dateObj);
    const status = getAttendanceStatus(
      recordsByDate,
      dateObj,
      weekOffDays,
      member?.joiningDate,
    );
    monthStatusCount[status] += 1;
    const record = storedRecordDetailsByDate[key];
    const showIncompleteWarning =
      key < todayKey && !!record?.punchIn && !record?.punchOut;
    const showLateMark =
      record?.isLate === true || Number(record?.lateMinutes || 0) > 0;
    cells.push({
      day,
      status,
      dateObj,
      showIncompleteWarning,
      showLateMark,
      lateMinutes: Number(record?.lateMinutes || 0),
    });
  }

  const selectedCell =
    cells.find((cell) => cell && toDateKey(cell.dateObj) === selectedDateKey) ||
    null;
  const selectedRecord = selectedDateKey
    ? storedRecordDetailsByDate[selectedDateKey]
    : null;
  const isTodaySelected =
    selectedCell && toDateKey(selectedCell.dateObj) === toDateKey(new Date());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <Motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="bg-white rounded-2xl p-5 sm:p-6 w-[min(960px,92vw)] shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-bold text-ink text-lg">Attendance Calendar</h3>
            <p className="text-sm text-muted">
              {member?.name} · {member?.designation}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
          <section className="rounded-xl border border-border bg-paper/40 p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onPrevMonth}
                  className="btn btn-xs btn-ghost border border-border"
                >
                  Prev
                </button>
                <p className="font-semibold text-ink min-w-37.5 text-center">
                  {monthDate.toLocaleString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <button
                  type="button"
                  onClick={onNextMonth}
                  className="btn btn-xs btn-ghost border border-border"
                >
                  Next
                </button>
              </div>

              <div className="text-xs text-muted font-medium">
                Week off:{" "}
                {(weekOffDays || [0])
                  .sort()
                  .map(
                    (d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d],
                  )
                  .join(", ")}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {Object.entries(ATTENDANCE_STYLES).map(([key, cfg]) => (
                <span
                  key={key}
                  className={`px-2 py-1 text-xs rounded-full border ${cfg.badge}`}
                >
                  {cfg.label}: {monthStatusCount[key]}
                </span>
              ))}
              <span className="px-2 py-1 text-xs rounded-full border bg-orange-50 text-orange-700 border-orange-200 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-orange-500" />
                Incomplete Punch
              </span>
              <span className="px-2 py-1 text-xs rounded-full border bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                Late Mark
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekdayLabels.map((label) => (
                <div
                  key={label}
                  className="text-xs font-semibold text-muted text-center py-1"
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {cells.map((cell, idx) => {
                if (!cell) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="h-11 sm:h-12 rounded-lg border border-dashed border-border/60 bg-paper/50"
                    />
                  );
                }
                const cfg = ATTENDANCE_STYLES[cell.status];
                const isSelected =
                  selectedDateKey &&
                  toDateKey(cell.dateObj) === selectedDateKey;
                return (
                  <button
                    key={`day-${cell.day}`}
                    type="button"
                    onClick={() => setSelectedDateKey(toDateKey(cell.dateObj))}
                    className={`h-11 sm:h-12 rounded-lg border px-1.5 flex items-center justify-center relative ${cfg.badge} ${isSelected ? "ring-2 ring-offset-1 ring-primary" : ""}`}
                  >
                    <span className="text-xs font-bold leading-none">
                      {cell.day}
                    </span>
                    {cell.showIncompleteWarning && (
                      <span
                        title="Punched in but not punched out"
                        className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-orange-500"
                      />
                    )}
                    {cell.showLateMark && (
                      <span
                        title={
                          cell.lateMinutes >= 30
                            ? `Late by ${cell.lateMinutes} mins (Half Day)`
                            : `Late by ${cell.lateMinutes} mins`
                        }
                        className="absolute top-0.5 left-0.5 w-2 h-2 rounded-full bg-red-500"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="space-y-3">
            <div className="rounded-xl border border-border bg-paper p-3">
              <p className="text-[11px] text-muted">Monthly Salary</p>
              <p className="font-bold text-ink mt-0.5">
                {formatCurrency(member?.salaryMonthly)}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-paper p-3">
              <p className="text-[11px] text-muted">Leave Balance</p>
              <p className="font-bold text-ink mt-0.5">
                {Math.max(
                  (member?.leaveAllowance || 0) - (member?.leavesTaken || 0),
                  0,
                )}{" "}
                days
              </p>
            </div>
            <div className="rounded-xl border border-border bg-paper p-3">
              <p className="text-[11px] text-muted">Holidays + Week Off</p>
              <p className="font-bold text-ink mt-0.5">
                {(monthStatusCount.holiday || 0) +
                  (monthStatusCount.weekOff || 0)}{" "}
                days
              </p>
            </div>
            <div className="rounded-xl border border-border bg-paper p-3">
              <p className="text-[11px] text-muted">Joining Date</p>
              <p className="font-bold text-ink mt-0.5">
                {member?.joiningDate
                  ? new Date(member.joiningDate).toLocaleDateString("en-IN")
                  : "-"}
              </p>
            </div>

            {selectedCell && (
              <div className="rounded-xl border border-border bg-white p-3">
                <p className="text-xs text-muted">
                  Selected Date:{" "}
                  {selectedCell.dateObj.toLocaleDateString("en-IN")}
                </p>

                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(ATTENDANCE_STYLES)
                    .filter(([key]) => key !== "unmarked")
                    .map(([key, cfg]) => {
                      const isActive = selectedCell.status === key;
                      return (
                        <button
                          key={`status-${key}`}
                          type="button"
                          onClick={() =>
                            onSetDayStatus(selectedCell.dateObj, key)
                          }
                          className={`btn btn-xs border ${isActive ? cfg.badge : "btn-ghost border-border"}`}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  <div className="rounded-lg border border-border bg-paper px-3 py-2">
                    <p className="text-[11px] text-muted">Punch In</p>
                    <p className="text-sm font-semibold text-ink mt-0.5">
                      {selectedRecord?.punchIn
                        ? new Date(selectedRecord.punchIn).toLocaleTimeString(
                            "en-IN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : "-"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-paper px-3 py-2">
                    <p className="text-[11px] text-muted">Punch Out</p>
                    <p className="text-sm font-semibold text-ink mt-0.5">
                      {selectedRecord?.punchOut
                        ? new Date(selectedRecord.punchOut).toLocaleTimeString(
                            "en-IN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : "-"}
                    </p>
                  </div>
                </div>

                {(selectedRecord?.isLate === true ||
                  Number(selectedRecord?.lateMinutes || 0) > 0) && (
                  <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                    <p className="text-[11px] text-red-600">Late Attendance</p>
                    <p className="text-sm font-semibold text-red-700 mt-0.5">
                      {Number(selectedRecord?.lateMinutes || 0) >= 30
                        ? `Late by ${Number(selectedRecord?.lateMinutes || 0)} mins (Half Day)`
                        : `Late by ${Number(selectedRecord?.lateMinutes || 0)} mins`}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={onPunchIn}
                    disabled={!isTodaySelected || isPunchingIn}
                    className="btn btn-info btn-xs"
                  >
                    {isPunchingIn ? "Punching..." : "Punch In"}
                  </button>
                  <button
                    type="button"
                    onClick={onPunchOut}
                    disabled={!isTodaySelected || isPunchingOut}
                    className="btn btn-warning btn-xs"
                  >
                    {isPunchingOut ? "Punching..." : "Punch Out"}
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      </Motion.div>
    </div>
  );
}

const SHIFT_TIMING_PRESETS = {
  Morning: { name: "Morning", startTime: "09:00", endTime: "17:00" },
  Evening: { name: "Evening", startTime: "17:00", endTime: "01:00" },
  Night: { name: "Night", startTime: "01:00", endTime: "09:00" },
  Custom: { name: "Custom", startTime: "09:00", endTime: "17:00" },
};

const SHIFT_COLORS = {
  Morning: "badge-warning",
  Evening: "badge-info",
  Night: "badge-ghost",
  Custom: "badge-secondary",
};

const EMPTY_FORM = {
  name: "",
  username: "",
  password: "",
  designation: "Employee",
  shiftTiming: { name: "Morning", startTime: "09:00", endTime: "17:00" },
  email: "",
  phone: "",
  salaryMonthly: "",
  leaveAllowance: "12",
  leavesTaken: "0",
  joiningDate: "",
  weekOffDays: [0],
};

// ─── Staff Form Panel ─────────────────────────────────────────────────────────
function StaffFormPanel({ mode, initial, onClose, onSave, isSaving }) {
  const [form, setForm] = useState(
    mode === "edit"
      ? {
          name: initial.name || "",
          username: initial.username || "",
          password: "",
          designation: initial.designation || "Employee",
          shiftTiming: initial.shiftTiming || {
            name: "Morning",
            startTime: "09:00",
            endTime: "17:00",
          },
          email: initial.email || "",
          phone: initial.phone || "",
          salaryMonthly:
            initial.salaryMonthly !== undefined &&
            initial.salaryMonthly !== null
              ? String(initial.salaryMonthly)
              : "",
          leaveAllowance:
            initial.leaveAllowance !== undefined &&
            initial.leaveAllowance !== null
              ? String(initial.leaveAllowance)
              : "12",
          leavesTaken:
            initial.leavesTaken !== undefined && initial.leavesTaken !== null
              ? String(initial.leavesTaken)
              : "0",
          joiningDate: initial.joiningDate
            ? new Date(initial.joiningDate).toISOString().slice(0, 10)
            : "",
          weekOffDays: initial.weekOffDays || [0],
        }
      : { ...EMPTY_FORM },
  );

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form };
    const trimmedPassword = String(form.password || "").trim();

    if (mode === "edit" && trimmedPassword && trimmedPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    payload.password = trimmedPassword;
    payload.salaryMonthly = Number(form.salaryMonthly || 0);
    payload.leaveAllowance = Number(form.leaveAllowance || 0);
    payload.leavesTaken = Number(form.leavesTaken || 0);
    // Always include role so older backend deployments don't fail with "role - Required"
    payload.role = DESIGNATION_ROLE_MAP[form.designation] || "cashier";
    if (form.joiningDate) {
      payload.joiningDate = form.joiningDate;
    } else {
      delete payload.joiningDate;
    }
    if (mode === "edit" && !payload.password) delete payload.password;
    if (!payload.email) delete payload.email;
    if (!payload.phone) delete payload.phone;
    onSave(payload);
  }

  const perms = DESIGNATION_PERMISSIONS[form.designation] || [];

  return (
    <Motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "tween", duration: 0.25 }}
      className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-white shadow-2xl flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="font-bold text-ink text-lg">
          {mode === "edit" ? "Edit Staff Member" : "Add Staff Member"}
        </h2>
        <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
          <X size={18} />
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
      >
        {/* Name */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Full Name *</span>
          </label>
          <input
            className="input input-bordered w-full"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Rahul Kumar"
            required
          />
        </div>

        {/* Username */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Username *</span>
          </label>
          <input
            className="input input-bordered w-full"
            value={form.username}
            onChange={(e) => set("username", e.target.value)}
            placeholder="e.g. rahul_waiter"
            required
            disabled={mode === "edit"}
          />
          {mode === "edit" && (
            <p className="text-xs text-muted mt-1">
              Username cannot be changed.
            </p>
          )}
        </div>

        {/* Password */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">
              Password {mode === "add" ? "*" : "(leave blank to keep current)"}
            </span>
          </label>
          <input
            className="input input-bordered w-full"
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder={
              mode === "add" ? "Min 6 characters" : "New password (optional)"
            }
            required={mode === "add"}
            minLength={6}
          />
        </div>

        {/* Designation */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">
              Designation / Role *
            </span>
          </label>
          <select
            className="select select-bordered w-full"
            value={form.designation}
            onChange={(e) => set("designation", e.target.value)}
            required
          >
            {DESIGNATIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Permissions preview */}
        {perms.length > 0 && (
          <div className="bg-paper rounded-lg p-3">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Eye size={12} /> Permissions for {form.designation}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {perms.map((p) => (
                <span key={p.label} className={`badge badge-sm ${p.color}`}>
                  {p.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Shift Timing */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Shift Timing</span>
          </label>
          <div className="flex gap-2 flex-wrap mb-2">
            {Object.entries(SHIFT_TIMING_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                type="button"
                onClick={() => set("shiftTiming", preset)}
                className={`btn btn-sm ${form.shiftTiming?.name === key ? "btn-primary" : "btn-ghost border border-border"}`}
              >
                {key}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">
                <span className="label-text text-xs">Start Time</span>
              </label>
              <input
                type="time"
                className="input input-bordered input-sm w-full"
                value={form.shiftTiming?.startTime || "09:00"}
                onChange={(e) =>
                  set("shiftTiming", {
                    ...form.shiftTiming,
                    startTime: e.target.value,
                    name:
                      form.shiftTiming?.name === "Custom" ? "Custom" : "Custom",
                  })
                }
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text text-xs">End Time</span>
              </label>
              <input
                type="time"
                className="input input-bordered input-sm w-full"
                value={form.shiftTiming?.endTime || "17:00"}
                onChange={(e) =>
                  set("shiftTiming", {
                    ...form.shiftTiming,
                    endTime: e.target.value,
                    name:
                      form.shiftTiming?.name === "Custom" ? "Custom" : "Custom",
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Week Off Days */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Week Off Days</span>
          </label>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 0, label: "Sun" },
              { value: 1, label: "Mon" },
              { value: 2, label: "Tue" },
              { value: 3, label: "Wed" },
              { value: 4, label: "Thu" },
              { value: 5, label: "Fri" },
              { value: 6, label: "Sat" },
            ].map((day) => {
              const isOff = (form.weekOffDays || [0]).includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => {
                    const current = form.weekOffDays || [0];
                    set(
                      "weekOffDays",
                      isOff
                        ? current.filter((d) => d !== day.value)
                        : [...current, day.value],
                    );
                  }}
                  className={`btn btn-sm ${
                    isOff ? "btn-primary" : "btn-ghost border border-border"
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted mt-1">
            Selected days are automatically marked as Week Off in attendance.
          </p>
        </div>

        {/* Phone */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Phone</span>
          </label>
          <input
            className="input input-bordered w-full"
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+91 98765 43210"
          />
        </div>

        {/* Email */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Email</span>
          </label>
          <input
            className="input input-bordered w-full"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="staff@restaurant.com"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Monthly Salary (INR)
              </span>
            </label>
            <input
              className="input input-bordered w-full"
              type="number"
              min={0}
              value={form.salaryMonthly}
              onChange={(e) => set("salaryMonthly", e.target.value)}
              placeholder="e.g. 22000"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Joining Date</span>
            </label>
            <input
              className="input input-bordered w-full"
              type="date"
              value={form.joiningDate}
              onChange={(e) => set("joiningDate", e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Leave Allowance</span>
            </label>
            <input
              className="input input-bordered w-full"
              type="number"
              min={0}
              value={form.leaveAllowance}
              onChange={(e) => set("leaveAllowance", e.target.value)}
              placeholder="e.g. 12"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Leaves Taken</span>
            </label>
            <input
              className="input input-bordered w-full"
              type="number"
              min={0}
              value={form.leavesTaken}
              onChange={(e) => set("leavesTaken", e.target.value)}
              placeholder="e.g. 2"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary w-full"
          >
            {isSaving ? (
              <span className="loading loading-spinner loading-sm" />
            ) : mode === "edit" ? (
              "Save Changes"
            ) : (
              "Add Staff Member"
            )}
          </button>
        </div>
      </form>
    </Motion.div>
  );
}

// ─── Holidays Modal ───────────────────────────────────────────────────────────
function HolidaysModal({ holidays, onSave, isSaving, onClose }) {
  const [holidayDate, setHolidayDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [holidayName, setHolidayName] = useState("");
  const [pendingHolidays, setPendingHolidays] = useState(() =>
    Array.isArray(holidays) ? holidays : [],
  );

  function addToPending() {
    if (!holidayDate) return;
    if (pendingHolidays.find((h) => h.date === holidayDate)) {
      toast.error("Holiday already added for this date.");
      return;
    }
    setPendingHolidays((prev) => [
      ...prev,
      { date: holidayDate, name: holidayName.trim() || "Holiday" },
    ]);
    setHolidayName("");
  }

  function removePending(date) {
    setPendingHolidays((prev) => prev.filter((h) => h.date !== date));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <Motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="bg-white rounded-2xl p-5 sm:p-6 w-[min(520px,92vw)] shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-bold text-ink text-lg">Manage Holidays</h3>
            <p className="text-sm text-muted">
              Add and manage the business holiday list used in staff attendance
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Pending list — shown above the add form so it's immediately visible */}
          {pendingHolidays.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">
                Holidays Added ({pendingHolidays.length})
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {pendingHolidays.map((h) => (
                  <div
                    key={h.date}
                    className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-ink">{h.name}</p>
                      <p className="text-xs text-muted">
                        {formatHolidayDate(h.date)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePending(h.date)}
                      className="btn btn-ghost btn-xs btn-circle text-error"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onSave(pendingHolidays)}
                disabled={isSaving}
                className="btn btn-warning btn-sm w-full gap-1.5"
              >
                {isSaving && (
                  <span className="loading loading-spinner loading-xs" />
                )}
                Save Holiday List
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <CalendarDays
                size={28}
                className="mx-auto text-muted opacity-40 mb-2"
              />
              <p className="text-sm text-muted">No holidays added yet.</p>
            </div>
          )}

          {/* Add holiday date form — always visible */}
          <div className="bg-paper rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide">
              Add Holiday Date
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs">Date *</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered input-sm w-full"
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs">Holiday Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-sm w-full"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  placeholder="e.g. Diwali"
                  onKeyDown={(e) => e.key === "Enter" && addToPending()}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={addToPending}
              disabled={!holidayDate}
              className="btn btn-primary btn-sm w-full gap-1.5"
            >
              <Plus size={14} /> Add to List
            </button>
          </div>
        </div>
      </Motion.div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ member, onConfirm, onCancel, isDeleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <Motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
      >
        <h3 className="font-bold text-ink text-lg mb-1">
          Remove Staff Member?
        </h3>
        <p className="text-sm text-muted mb-5">
          Are you sure you want to remove{" "}
          <span className="font-semibold text-ink">{member.name}</span>? This
          action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn btn-ghost flex-1">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="btn btn-error flex-1"
          >
            {isDeleting ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Remove"
            )}
          </button>
        </div>
      </Motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StaffPage() {
  const queryClient = useQueryClient();
  const [panelMode, setPanelMode] = useState(null); // "add" | "edit" | null
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [attendanceTarget, setAttendanceTarget] = useState(null);
  const [attendanceOverrides, setAttendanceOverrides] = useState({});
  const [attendanceMonth, setAttendanceMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [filterDesig, setFilterDesig] = useState("All");
  const [showHolidaysModal, setShowHolidaysModal] = useState(false);

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

  const {
    data: leaveRequests = [],
    isLoading: isLoadingLeaveRequests,
    isError: isLeaveRequestsError,
    refetch: refetchLeaveRequests,
  } = useQuery({
    queryKey: ["staff-leave-requests"],
    queryFn: fetchStaffLeaveRequests,
    refetchInterval: 60_000,
  });

  const { data: businessProfile } = useQuery({
    queryKey: ["business-profile"],
    queryFn: fetchBusinessProfile,
  });

  const createMutation = useMutation({
    mutationFn: createStaffMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setPanelMode(null);
      toast.success("Staff member added successfully.");
    },
    onError: (err) => toast.error(err?.message || "Failed to add staff."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateStaffMember(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setPanelMode(null);
      setEditTarget(null);
      toast.success("Staff member updated.");
    },
    onError: (err) => toast.error(err?.message || "Failed to update staff."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteStaffMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setDeleteTarget(null);
      toast.success("Staff member removed.");
    },
    onError: (err) => toast.error(err?.message || "Failed to remove staff."),
  });

  const attendanceMutation = useMutation({
    mutationFn: ({ id, payload }) => updateStaffMember(id, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setAttendanceTarget(updated);
      setAttendanceOverrides({});
      toast.success("Attendance updated.");
    },
    onError: (err) =>
      toast.error(err?.message || "Failed to update attendance."),
  });

  const punchInMutation = useMutation({
    mutationFn: (id) => punchInStaff(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setAttendanceTarget(updated);
      toast.success("Punch in recorded successfully.");
    },
    onError: (err) => toast.error(err?.message || "Failed to record punch in."),
  });

  const punchOutMutation = useMutation({
    mutationFn: (id) => punchOutStaff(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setAttendanceTarget(updated);
      toast.success("Punch out recorded successfully.");
    },
    onError: (err) =>
      toast.error(err?.message || "Failed to record punch out."),
  });

  const reviewLeaveMutation = useMutation({
    mutationFn: ({ staffId, requestId, status, managerNote }) =>
      reviewStaffLeaveRequest(staffId, requestId, { status, managerNote }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["staff-leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success(
        variables.status === "approved"
          ? "Leave request approved."
          : "Leave request rejected.",
      );
    },
    onError: (err) =>
      toast.error(err?.message || "Failed to review leave request."),
  });

  const applyHolidaysMutation = useMutation({
    mutationFn: (holidays) =>
      updateBusinessProfile({
        holidays: holidays.map((holiday) => ({
          date: holiday.date,
          name: holiday.name,
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-profile"] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setShowHolidaysModal(false);
      toast.success("Holiday list updated.");
    },
    onError: (err) => toast.error(err?.message || "Failed to apply holidays."),
  });

  function openAdd() {
    setEditTarget(null);
    setPanelMode("add");
  }

  function openEdit(member) {
    setEditTarget(member);
    setPanelMode("edit");
  }

  function openAttendance(member) {
    const now = new Date();
    setAttendanceMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setAttendanceOverrides({});
    setAttendanceTarget(member);
  }

  function setAttendanceDayStatus(dateObj, status) {
    if (!attendanceTarget) return;

    const selectedKey = toDateKey(dateObj);
    const nextOverrides = {
      ...(attendanceOverrides || {}),
      [selectedKey]: status,
    };
    setAttendanceOverrides(nextOverrides);

    const monthStart = new Date(
      attendanceMonth.getFullYear(),
      attendanceMonth.getMonth(),
      1,
    );
    const monthEnd = new Date(
      attendanceMonth.getFullYear(),
      attendanceMonth.getMonth() + 1,
      0,
    );
    const monthPrefix = `${attendanceMonth.getFullYear()}-${String(attendanceMonth.getMonth() + 1).padStart(2, "0")}`;

    const storedMap = (attendanceTarget.attendanceRecords || []).reduce(
      (acc, record) => {
        if (record.isBusinessHoliday) return acc;
        const d = new Date(record.date);
        if (!Number.isNaN(d.getTime())) {
          acc[toDateKey(d)] = record.status;
        }
        return acc;
      },
      {},
    );
    const storedDetailMap = (attendanceTarget.attendanceRecords || []).reduce(
      (acc, record) => {
        if (record.isBusinessHoliday) return acc;
        const d = new Date(record.date);
        if (!Number.isNaN(d.getTime())) {
          acc[toDateKey(d)] = record;
        }
        return acc;
      },
      {},
    );
    const effectiveMap = { ...storedMap, ...nextOverrides };

    const retainedRecords = (attendanceTarget.attendanceRecords || []).filter(
      (record) => {
        if (record.isBusinessHoliday) return false;
        const d = new Date(record.date);
        if (Number.isNaN(d.getTime())) return false;
        return !toDateKey(d).startsWith(monthPrefix);
      },
    );

    const monthRecords = [];
    for (let day = 1; day <= monthEnd.getDate(); day += 1) {
      const dateObj = new Date(
        Date.UTC(monthStart.getFullYear(), monthStart.getMonth(), day),
      );
      const status = getAttendanceStatus(
        effectiveMap,
        dateObj,
        attendanceTarget?.weekOffDays || [0],
        attendanceTarget?.joiningDate,
      );
      if (status === "unmarked") continue;
      const dateKey = toDateKey(dateObj);
      const existingRecord = storedDetailMap[dateKey];
      monthRecords.push({
        date: dateObj.toISOString(),
        status,
        ...(existingRecord?.punchIn ? { punchIn: existingRecord.punchIn } : {}),
        ...(existingRecord?.punchOut
          ? { punchOut: existingRecord.punchOut }
          : {}),
      });
    }

    attendanceMutation.mutate({
      id: attendanceTarget.id,
      payload: {
        attendanceRecords: [...retainedRecords, ...monthRecords],
      },
    });
  }

  function handleSave(payload) {
    if (panelMode === "add") {
      createMutation.mutate(payload);
    } else if (panelMode === "edit" && editTarget) {
      updateMutation.mutate({ id: editTarget.id, payload });
    }
  }

  const activeCount = team.filter((m) => m.isActive).length;
  const pendingLeaveCount = leaveRequests.filter(
    (request) => request.status === "pending",
  ).length;
  const holidayList = businessProfile?.holidays || [];
  const upcomingHolidays = holidayList.filter((holiday) => {
    const holidayDate = new Date(holiday.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !Number.isNaN(holidayDate.getTime()) && holidayDate >= today;
  });
  const holidayPreview =
    upcomingHolidays.length > 0
      ? upcomingHolidays.slice(0, 4)
      : holidayList.slice(0, 4);
  const filteredTeam =
    filterDesig === "All"
      ? team
      : team.filter((m) => m.designation === filterDesig);

  const isSaving = createMutation.isPending || updateMutation.isPending;
  // Admin = can manage staff (simplified: always true in panel since route requires manager+)
  const canManage = true;

  return (
    <PageShell>
      <ErrorBoundary label="Staff">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Staff"
            value={String(team.length)}
            icon={Users}
          />
          <StatCard
            title="Active"
            value={String(activeCount)}
            icon={BadgeCheck}
          />
          <StatCard
            title="Pending Leave"
            value={String(pendingLeaveCount)}
            icon={ClipboardCheck}
          />
          <StatCard
            title="Holidays"
            value={String(holidayList.length)}
            icon={CalendarDays}
          />
        </div>

        <LeaveRequestsPanel
          requests={leaveRequests}
          isLoading={isLoadingLeaveRequests}
          isError={isLeaveRequestsError}
          onRetry={refetchLeaveRequests}
          onReview={(payload) => reviewLeaveMutation.mutate(payload)}
          isReviewing={reviewLeaveMutation.isPending}
        />

        <div className="bg-white border border-border rounded-xl p-5 mt-4">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div>
              <h2 className="font-bold text-ink text-lg">Holiday List</h2>
              <p className="text-sm text-muted">
                These holidays are applied globally in staff attendance.
              </p>
            </div>
            <button
              onClick={() => setShowHolidaysModal(true)}
              className="btn btn-outline btn-sm gap-1.5"
            >
              <CalendarDays size={15} /> Manage Holidays
            </button>
          </div>

          {holidayList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-paper/50 px-4 py-8 text-center">
              <CalendarDays
                size={28}
                className="mx-auto text-muted opacity-40 mb-2"
              />
              <p className="text-sm text-muted">No holidays added yet.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {holidayPreview.map((holiday) => (
                <div
                  key={holiday.date}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-ink">
                    {holiday.name}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {formatHolidayDate(holiday.date)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team section */}
        <div className="bg-white border border-border rounded-xl p-5 mt-4">
          {/* Header row */}
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <h2 className="font-bold text-ink text-lg">Staff Members</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Filter tabs */}
              <div className="flex gap-1 flex-wrap">
                {["All", ...DESIGNATIONS.map((d) => d.value)].map((d) => (
                  <button
                    key={d}
                    onClick={() => setFilterDesig(d)}
                    className={`btn btn-xs ${filterDesig === d ? "btn-primary" : "btn-ghost border border-border"}`}
                  >
                    {d === "Kitchen" ? "Kitchen" : d}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowHolidaysModal(true)}
                className="btn btn-outline btn-sm gap-1.5"
              >
                <CalendarDays size={15} /> Holidays ({holidayList.length})
              </button>
              <button
                onClick={openAdd}
                className="btn btn-primary btn-sm gap-1.5"
              >
                <Plus size={15} /> Add Staff
              </button>
            </div>
          </div>

          {/* States */}
          {isLoading && (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner loading-md text-primary" />
            </div>
          )}
          {isError && (
            <div className="flex items-center justify-between gap-4 mb-3">
              <p className="text-sm text-error">
                {error?.message || "Failed to load staff."}
              </p>
              <button
                onClick={() => refetch()}
                className="btn btn-xs btn-ghost border border-border"
              >
                Retry
              </button>
            </div>
          )}
          {!isLoading && !isError && filteredTeam.length === 0 && (
            <div className="text-center py-12">
              <Users size={36} className="mx-auto text-muted opacity-40 mb-3" />
              <p className="text-sm text-muted">
                {filterDesig === "All"
                  ? "No staff members yet. Add one to get started."
                  : `No ${filterDesig} staff members found.`}
              </p>
              {filterDesig === "All" && (
                <button
                  onClick={openAdd}
                  className="btn btn-primary btn-sm mt-4 gap-1.5"
                >
                  <Plus size={14} /> Add First Staff Member
                </button>
              )}
            </div>
          )}

          {/* List */}
          {!isLoading && !isError && filteredTeam.length > 0 && (
            <div className="overflow-x-auto border border-border rounded-xl">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Shift</th>
                    <th className="hidden md:table-cell">Phone</th>
                    <th className="hidden md:table-cell">Email</th>
                    <th>Status</th>
                    <th>Permissions</th>
                    {canManage && <th className="text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredTeam.map((member) => {
                    const perms =
                      DESIGNATION_PERMISSIONS[member.designation] || [];
                    return (
                      <tr
                        key={member.id}
                        className={!member.isActive ? "opacity-60" : ""}
                      >
                        <td className="font-semibold text-ink whitespace-nowrap">
                          {member.name}
                          <div className="md:hidden mt-1 space-y-0.5">
                            <p className="text-xs text-muted">
                              Phone: {member.phone || "-"}
                            </p>
                            <p className="text-xs text-muted">
                              Email: {member.email || "-"}
                            </p>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-sm badge-ghost whitespace-nowrap">
                            {member.designation}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge badge-sm ${SHIFT_COLORS[member.shiftTiming?.name] || "badge-ghost"}`}
                          >
                            {member.shiftTiming?.name || "Morning"}
                          </span>
                          <p className="text-xs text-muted mt-1">
                            {member.shiftTiming?.startTime || "09:00"} -{" "}
                            {member.shiftTiming?.endTime || "17:00"}
                          </p>
                        </td>
                        <td className="text-sm whitespace-nowrap hidden md:table-cell">
                          {member.phone || "-"}
                        </td>
                        <td className="text-sm whitespace-nowrap hidden md:table-cell">
                          {member.email || "-"}
                        </td>
                        <td>
                          <span
                            className={`badge badge-sm ${member.isActive ? "badge-success" : "badge-ghost"}`}
                          >
                            {member.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-1 max-w-65">
                            {perms.length > 0 ? (
                              perms.map((p) => (
                                <span
                                  key={p.label}
                                  className={`badge badge-xs ${p.color}`}
                                >
                                  {p.label}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted">-</span>
                            )}
                          </div>
                        </td>
                        {canManage && (
                          <td>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openAttendance(member)}
                                className="btn btn-ghost btn-xs btn-circle"
                                title="View Attendance"
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                onClick={() => openEdit(member)}
                                className="btn btn-ghost btn-xs btn-circle"
                                title="Edit"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(member)}
                                className="btn btn-ghost btn-xs btn-circle text-error"
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Form panel overlay */}
        <AnimatePresence>
          {panelMode && (
            <>
              <Motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-30 bg-black/30"
                onClick={() => setPanelMode(null)}
              />
              <StaffFormPanel
                key={panelMode === "edit" ? `edit-${editTarget?.id}` : "add"}
                mode={panelMode}
                initial={editTarget || {}}
                onClose={() => setPanelMode(null)}
                onSave={handleSave}
                isSaving={isSaving}
              />
            </>
          )}
        </AnimatePresence>

        {/* Attendance modal */}
        <AnimatePresence>
          {attendanceTarget && (
            <AttendanceCalendarModal
              member={attendanceTarget}
              monthDate={attendanceMonth}
              attendanceOverrides={attendanceOverrides}
              weekOffDays={attendanceTarget.weekOffDays || [0]}
              onPrevMonth={() =>
                setAttendanceMonth(
                  (prev) =>
                    new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                )
              }
              onNextMonth={() =>
                setAttendanceMonth(
                  (prev) =>
                    new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                )
              }
              onSetDayStatus={setAttendanceDayStatus}
              onPunchIn={() =>
                attendanceTarget && punchInMutation.mutate(attendanceTarget.id)
              }
              onPunchOut={() =>
                attendanceTarget && punchOutMutation.mutate(attendanceTarget.id)
              }
              isPunchingIn={punchInMutation.isPending}
              isPunchingOut={punchOutMutation.isPending}
              onClose={() => setAttendanceTarget(null)}
            />
          )}
        </AnimatePresence>

        {/* Holidays modal */}
        <AnimatePresence>
          {showHolidaysModal && (
            <HolidaysModal
              holidays={holidayList}
              onSave={(holidays) => applyHolidaysMutation.mutate(holidays)}
              isSaving={applyHolidaysMutation.isPending}
              onClose={() => setShowHolidaysModal(false)}
            />
          )}
        </AnimatePresence>

        {/* Delete modal */}
        <AnimatePresence>
          {deleteTarget && (
            <DeleteModal
              member={deleteTarget}
              onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
              onCancel={() => setDeleteTarget(null)}
              isDeleting={deleteMutation.isPending}
            />
          )}
        </AnimatePresence>
      </ErrorBoundary>
    </PageShell>
  );
}
