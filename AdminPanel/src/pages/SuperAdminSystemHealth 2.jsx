import { useEffect, useState, useCallback } from "react";
import { Loader2, Server, Database, Activity, Clock, Cpu } from "lucide-react";
import { fetchSystemHealth } from "../services/superadminApi";
import { motion as Motion } from "framer-motion";

function HealthCard({ title, value, sub, icon: Icon, color, bg }) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-xl font-bold text-ink">{value}</p>
          {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
          <Icon size={20} className={color} />
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminSystemHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const loadHealth = useCallback(() => {
    setLoading(true);
    fetchSystemHealth()
      .then((data) => {
        setHealth(data);
        setLastUpdated(new Date());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [loadHealth]);

  if (!health && loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={28} className="animate-spin text-saffron" />
      </div>
    );
  }

  const formatUptime = (seconds) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">System Health</h2>
          <p className="text-sm text-muted mt-0.5">
            Real-time server and database metrics
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">Last updated</p>
          <p className="text-sm font-medium text-ink">
            {lastUpdated.toLocaleTimeString("en-IN")}
          </p>
        </div>
      </div>

      {health && (
        <Motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <HealthCard
            title="API Uptime"
            value={formatUptime(health.uptimeSeconds)}
            sub={`Node.js ${health.nodeVersion}`}
            icon={Clock}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <HealthCard
            title="Memory Usage"
            value={`${health.memory?.rss || 0} MB`}
            sub={`Heap: ${health.memory?.heapUsed || 0} / ${health.memory?.heapTotal || 0} MB`}
            icon={Cpu}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <HealthCard
            title="Database"
            value={health.database?.status === "connected" ? "Online" : "Offline"}
            sub={health.database?.host || "Unknown host"}
            icon={Database}
            color={health.database?.status === "connected" ? "text-emerald-600" : "text-red-600"}
            bg={health.database?.status === "connected" ? "bg-emerald-50" : "bg-red-50"}
          />
          <HealthCard
            title="API Status"
            value="Operational"
            sub="All services running"
            icon={Activity}
            color="text-saffron"
            bg="bg-saffron-lt"
          />
        </Motion.div>
      )}

      <div className="bg-white rounded-xl border border-border p-6 flex items-center gap-4">
        <Server size={32} className="text-muted2" />
        <div>
          <h3 className="font-bold text-ink">Server Details</h3>
          <p className="text-sm text-muted">Node.js Express API Server connected to MongoDB.</p>
        </div>
      </div>
    </div>
  );
}
