import { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import {
  User,
  Mail,
  Loader2,
  Shield,
  Calendar,
  Lock,
} from "lucide-react";
import { fetchSuperAdminProfile } from "../services/superadminApi";
import toast from "react-hot-toast";

export default function SuperAdminProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuperAdminProfile()
      .then((data) => {
        setProfile(data);
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={28} className="animate-spin text-saffron" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-ink">My Profile</h2>
        <p className="text-sm text-muted mt-0.5">
          Your Super Admin credentials are managed securely via environment variables
        </p>
      </div>

      {/* Profile Card */}
      <Motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-border overflow-hidden"
      >
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-saffron to-saffron2 px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Shield size={28} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {profile?.name || "Super Admin"}
              </h3>
              <p className="text-sm text-white/80">{profile?.email}</p>
              {profile?.createdAt && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Calendar size={12} className="text-white/60" />
                  <p className="text-xs text-white/60">
                    Member since{" "}
                    {new Date(profile.createdAt).toLocaleDateString("en-IN", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Details (Read Only) */}
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
              <User size={14} className="text-saffron" />
              Account Details
            </h4>
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-600 rounded-md border border-amber-200/50">
              <Lock size={12} />
              Managed via ENV
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5 block">
                Full Name
              </label>
              <div className="relative opacity-70">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted2"
                />
                <input
                  type="text"
                  value={profile?.name || "Super Admin"}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-paper/50 border border-border rounded-xl text-sm text-ink cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5 block">
                Email Address
              </label>
              <div className="relative opacity-70">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted2"
                />
                <input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-paper/50 border border-border rounded-xl text-sm text-ink cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex gap-3">
            <div className="mt-0.5">
              <Shield size={16} className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">Security Note</p>
              <p className="text-xs text-blue-700/80 mt-1 leading-relaxed">
                Super Admin credentials (email and password) are securely managed through server environment variables (`SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`). If you need to change your password, please update the `.env` file and restart the server.
              </p>
            </div>
          </div>
        </div>
      </Motion.div>
    </div>
  );
}
