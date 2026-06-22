import { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Loader2,
  Shield,
  Save,
  KeyRound,
  Calendar,
} from "lucide-react";
import {
  fetchSuperAdminProfile,
  updateSuperAdminProfile,
} from "../services/superadminApi";
import toast from "react-hot-toast";

export default function SuperAdminProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetchSuperAdminProfile()
      .then((data) => {
        setProfile(data);
        setName(data.name || "");
        setEmail(data.email || "");
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    setSaving(true);
    try {
      const payload = { name: name.trim(), email: email.trim() };
      const data = await updateSuperAdminProfile(payload);
      toast.success("Profile updated!");
      if (data.profile) {
        setProfile((p) => ({ ...p, ...data.profile }));
        localStorage.setItem(
          "superAdminProfile",
          JSON.stringify(data.profile),
        );
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Enter your current password");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setSaving(true);
    try {
      await updateSuperAdminProfile({ currentPassword, newPassword });
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

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
          Manage your Super Admin account details
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

        {/* Edit Profile Form */}
        <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
          <h4 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
            <User size={14} className="text-saffron" />
            Account Details
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5 block">
                Full Name
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted2"
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full pl-10 pr-4 py-2.5 bg-paper border border-border rounded-xl text-sm text-ink placeholder-muted2 focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5 block">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted2"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="w-full pl-10 pr-4 py-2.5 bg-paper border border-border rounded-xl text-sm text-ink placeholder-muted2 focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-saffron to-saffron2 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-saffron/25 disabled:opacity-60 transition-all cursor-pointer"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </Motion.div>

      {/* Change Password */}
      <Motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-border p-6"
      >
        <h4 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2 mb-5">
          <KeyRound size={14} className="text-saffron" />
          Change Password
        </h4>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5 block">
              Current Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted2"
              />
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full pl-10 pr-4 py-2.5 bg-paper border border-border rounded-xl text-sm text-ink placeholder-muted2 focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5 block">
                New Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted2"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-paper border border-border rounded-xl text-sm text-ink placeholder-muted2 focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5 block">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted2"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full pl-10 pr-4 py-2.5 bg-paper border border-border rounded-xl text-sm text-ink placeholder-muted2 focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-ink text-white text-sm font-semibold rounded-xl hover:bg-ink/90 disabled:opacity-60 transition-all cursor-pointer"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Lock size={14} />
              )}
              Update Password
            </button>
          </div>
        </form>
      </Motion.div>
    </div>
  );
}
