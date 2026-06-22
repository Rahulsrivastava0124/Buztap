import { useEffect, useState, useCallback } from "react";
import { Loader2, Search, FileText, Globe, AlertCircle } from "lucide-react";
import { fetchAuditLogs } from "../services/superadminApi";
import { motion as Motion } from "framer-motion";

export default function SuperAdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadLogs = useCallback(() => {
    setLoading(true);
    fetchAuditLogs({ search })
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(loadLogs, 300);
    return () => clearTimeout(timer);
  }, [loadLogs]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink">Global Audit Logs</h2>
          <p className="text-sm text-muted mt-0.5">
            Monitor API requests and system events
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs by action, IP, or user ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm text-ink placeholder-muted2 focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-saffron" />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-border">
          <div className="w-16 h-16 rounded-2xl bg-paper flex items-center justify-center mb-4">
            <FileText size={28} className="text-muted2" />
          </div>
          <p className="text-sm font-semibold text-ink">No logs found</p>
          <p className="text-xs text-muted mt-1">Adjust your search filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_2fr_1fr_1.5fr] gap-3 px-5 py-3 bg-paper border-b border-border">
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Time</p>
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Action</p>
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">User/IP</p>
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Details</p>
          </div>

          <div className="divide-y divide-border/60">
            {logs.map((log, i) => (
              <Motion.div
                key={log._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="group px-5 py-4 md:grid md:grid-cols-[1fr_2fr_1fr_1.5fr] md:gap-3 md:items-center hover:bg-paper/50 transition-colors"
              >
                <div className="mb-2 md:mb-0">
                  <p className="text-xs font-medium text-ink">
                    {new Date(log.timestamp).toLocaleDateString("en-IN", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                </div>
                
                <div className="mb-2 md:mb-0 flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    log.method === 'GET' ? 'bg-blue-50 text-blue-600' :
                    log.method === 'POST' ? 'bg-emerald-50 text-emerald-600' :
                    log.method === 'PUT' ? 'bg-amber-50 text-amber-600' :
                    log.method === 'DELETE' ? 'bg-red-50 text-red-600' :
                    'bg-paper text-muted'
                  }`}>
                    {log.method}
                  </span>
                  <p className="text-sm text-ink truncate font-mono text-xs">{log.endpoint}</p>
                </div>

                <div className="mb-2 md:mb-0">
                  <div className="flex items-center gap-1">
                    <Globe size={12} className="text-muted2" />
                    <p className="text-xs text-muted">{log.ipAddress}</p>
                  </div>
                  {log.userId && (
                    <p className="text-[10px] text-muted truncate mt-0.5">User: {log.userId}</p>
                  )}
                </div>

                <div className="mb-2 md:mb-0">
                  {log.statusCode >= 400 ? (
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertCircle size={12} />
                      <p className="text-xs font-medium">{log.statusCode} Error</p>
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-600 font-medium">{log.statusCode} OK</p>
                  )}
                  {log.businessId && (
                     <p className="text-[10px] text-muted mt-0.5 truncate">Biz: {log.businessId}</p>
                  )}
                </div>
              </Motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
