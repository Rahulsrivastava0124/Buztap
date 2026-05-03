const NAVIGATION_HISTORY_KEY = "tablefrontend_navigation_history_v1";
const MAX_HISTORY_ENTRIES = 60;

function readHistory() {
  try {
    const raw = sessionStorage.getItem(NAVIGATION_HISTORY_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeHistory(entries) {
  try {
    sessionStorage.setItem(NAVIGATION_HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // storage blocked/full — back fallback still works via router history
  }
}

function getLocationKey(location) {
  const pathname = String(location?.pathname || "").trim();
  const search = String(location?.search || "").trim();
  if (!pathname) return "";
  return `${pathname}${search}`;
}

export function recordNavigation(location) {
  const currentKey = getLocationKey(location);
  if (!currentKey) return;

  const history = readHistory();
  if (history[history.length - 1] === currentKey) return;

  const nextHistory = [...history, currentKey].slice(-MAX_HISTORY_ENTRIES);
  writeHistory(nextHistory);
}

export function getPreviousNavigation(location) {
  const currentKey = getLocationKey(location);
  if (!currentKey) return "";

  const history = readHistory();
  if (history.length < 2) return "";

  for (let i = history.length - 1; i >= 0; i -= 1) {
    if (history[i] !== currentKey) continue;
    for (let j = i - 1; j >= 0; j -= 1) {
      if (history[j] !== currentKey) return history[j];
    }
    return "";
  }

  const fallback = history[history.length - 2] || "";
  return fallback !== currentKey ? fallback : "";
}
