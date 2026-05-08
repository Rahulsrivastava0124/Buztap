function toUtcDateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function normalizeAttendanceRecord(record, fallbackDate) {
  const dateValue = record?.date || fallbackDate;
  const key = toUtcDateKey(dateValue);
  if (!key) return null;

  const resolvedDate = new Date(dateValue);

  return {
    date: resolvedDate.toISOString(),
    status: record?.status,
    note: record?.note || "",
    punchIn: record?.punchIn || null,
    punchOut: record?.punchOut || null,
    isLate: record?.isLate === true,
    lateMinutes: Number(record?.lateMinutes || 0),
    ...(record?.isBusinessHoliday ? { isBusinessHoliday: true } : {}),
  };
}

function mergeAttendanceRecords(existingRecords = [], incomingRecords = []) {
  const byDate = new Map();

  for (const record of existingRecords) {
    const normalized = normalizeAttendanceRecord(record);
    if (!normalized) continue;
    byDate.set(toUtcDateKey(normalized.date), normalized);
  }

  for (const record of incomingRecords) {
    const normalized = normalizeAttendanceRecord(record);
    if (!normalized) continue;

    const key = toUtcDateKey(normalized.date);
    const previous = byDate.get(key) || {
      date: normalized.date,
      status: undefined,
      note: "",
      punchIn: null,
      punchOut: null,
      isLate: false,
      lateMinutes: 0,
    };

    const merged = {
      date: normalized.date || previous.date,
      status: normalized.status || previous.status,
      note: normalized.note ?? previous.note,
      punchIn: normalized.punchIn || previous.punchIn || null,
      punchOut: normalized.punchOut || previous.punchOut || null,
      isLate: normalized.isLate || previous.isLate || false,
      lateMinutes: Math.max(
        Number(normalized.lateMinutes || 0),
        Number(previous.lateMinutes || 0),
      ),
    };

    byDate.set(key, merged);
  }

  return Array.from(byDate.values());
}

function normalizeHolidayList(holidays = []) {
  const byDate = new Map();

  for (const holiday of holidays) {
    const key = toUtcDateKey(holiday?.date);
    if (!key) continue;

    byDate.set(key, {
      date: new Date(`${key}T00:00:00.000Z`).toISOString(),
      name: String(holiday?.name || "Holiday").trim() || "Holiday",
    });
  }

  return Array.from(byDate.values()).sort((left, right) =>
    left.date.localeCompare(right.date),
  );
}

function applyBusinessHolidays(attendanceRecords = [], holidays = []) {
  const mergedRecords = mergeAttendanceRecords([], attendanceRecords);
  const byDate = new Map(
    mergedRecords.map((record) => [toUtcDateKey(record.date), record]),
  );

  for (const holiday of normalizeHolidayList(holidays)) {
    const key = toUtcDateKey(holiday.date);
    if (!key || byDate.has(key)) continue;

    byDate.set(key, {
      date: holiday.date,
      status: "holiday",
      note: holiday.name,
      punchIn: null,
      punchOut: null,
      isBusinessHoliday: true,
    });
  }

  return Array.from(byDate.values()).sort((left, right) =>
    left.date.localeCompare(right.date),
  );
}

module.exports = {
  applyBusinessHolidays,
  mergeAttendanceRecords,
  normalizeHolidayList,
  toUtcDateKey,
};
