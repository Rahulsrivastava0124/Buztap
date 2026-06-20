import { useEffect, useMemo, useRef, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  X,
  Building2,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  UtensilsCrossed,
  Table2,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  Rocket,
} from "lucide-react";
import { useRestroAuth } from "../../context/RestroAuthContext";
import toast from "react-hot-toast";
import MenuUploadStep from "./MenuUploadStep";
import RegistrationReviewStep from "./RegistrationReviewStep";
import {
  createMenuItem,
  extractMenuFromImage,
  requestEmailOtp,
  verifyEmailOtp,
} from "../../services/api";

const STEPS = [
  { id: 1, label: "Account" },
  { id: 2, label: "Profile" },
  { id: 3, label: "Menu" },
  { id: 4, label: "Review" },
];

const CUISINE_OPTIONS = [
  "North Indian",
  "South Indian",
  "Chinese",
  "Continental",
  "Italian",
  "Mexican",
  "Thai",
  "Fast Food",
  "Café",
  "Bakery",
  "Multi-Cuisine",
  "Street Food",
  "Other",
];

const EMPTY_ACCOUNT = {
  businessName: "",
  businessType: "restro",
  ownerName: "",
  email: "",
  password: "",
};
const EMPTY_PROFILE = { phone: "", address: "", cuisine: "", tableCount: "" };

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

function AccountStep({
  data,
  onChange,
  errors,
  otp,
  otpRequested,
  onOtpChange,
  onSendOtp,
  onVerifyOtp,
  sendingOtp,
  verifyingOtp,
  otpVerified,
  cooldownSecs,
}) {
  const [showPw, setShowPw] = useState(false);
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold text-[#0f0e0b]">
          Create your account
        </h3>
        <p className="text-sm text-[#857c6e] mt-1">
          Owner / admin credentials to access your dashboard.
        </p>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="col-span-2 block space-y-1">
            <span className="text-xs font-semibold text-[#0f0e0b]">
              Restaurant / Hotel Name
            </span>
            <div className="relative">
              <Building2
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0a898]"
              />
              <input
                name="businessName"
                value={data.businessName}
                onChange={onChange}
                className="w-full pl-9 pr-4 py-2.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-lg text-sm text-[#0f0e0b] placeholder-[#b0a898] focus:outline-none focus:border-[#e8720c] focus:ring-1 focus:ring-[#e8720c]"
                placeholder="Spice Garden"
              />
            </div>
            <FieldError msg={errors?.businessName} />
          </label>
          <label className="col-span-2 block space-y-1">
            <span className="text-xs font-semibold text-[#0f0e0b]">
              Business Type
            </span>
            <select
              name="businessType"
              value={data.businessType}
              onChange={onChange}
              className="w-full px-3 py-2.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-lg text-sm text-[#0f0e0b] focus:outline-none focus:border-[#e8720c] focus:ring-1 focus:ring-[#e8720c]"
            >
              <option value="restro">Restaurant</option>
              <option value="hotel">Hotel / Resort</option>
            </select>
          </label>
        </div>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-[#0f0e0b]">
            Your Name
          </span>
          <div className="relative">
            <User
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0a898]"
            />
            <input
              name="ownerName"
              value={data.ownerName}
              onChange={onChange}
              className="w-full pl-9 pr-4 py-2.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-lg text-sm text-[#0f0e0b] placeholder-[#b0a898] focus:outline-none focus:border-[#e8720c] focus:ring-1 focus:ring-[#e8720c]"
              placeholder="Rahul Kumar"
            />
          </div>
          <FieldError msg={errors?.ownerName} />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-[#0f0e0b]">Email</span>
          <div className="relative">
            <Mail
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0a898]"
            />
            <input
              name="email"
              type="email"
              value={data.email}
              onChange={onChange}
              className="w-full pl-9 pr-4 py-2.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-lg text-sm text-[#0f0e0b] placeholder-[#b0a898] focus:outline-none focus:border-[#e8720c] focus:ring-1 focus:ring-[#e8720c]"
              placeholder="you@restaurant.com"
            />
          </div>
          <FieldError msg={errors?.email} />
          {!otpRequested ? (
            <p className="text-xs text-[#857c6e] mt-2">
              Click Next to send OTP automatically.
            </p>
          ) : (
            <>
              {cooldownSecs > 0 && (
                <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
                  <span className="text-base">⏳</span>
                  <p className="text-xs text-amber-700 font-medium">
                    Too many attempts. Try again in{" "}
                    <span className="font-bold">{cooldownSecs}s</span>.
                  </p>
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <input
                  value={otp}
                  onChange={onOtpChange}
                  inputMode="numeric"
                  placeholder="Enter 6-digit OTP"
                  disabled={cooldownSecs > 0}
                  className="flex-1 px-3 py-2.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-lg text-sm text-[#0f0e0b] placeholder-[#b0a898] focus:outline-none focus:border-[#e8720c] focus:ring-1 focus:ring-[#e8720c] disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={onSendOtp}
                  disabled={sendingOtp || cooldownSecs > 0}
                  className="px-3 py-2.5 rounded-lg text-xs font-semibold border border-[#e0d9ce] bg-white hover:bg-[#faf7f2] disabled:opacity-60"
                >
                  {sendingOtp
                    ? "Sending..."
                    : cooldownSecs > 0
                      ? `${cooldownSecs}s`
                      : "Resend"}
                </button>
                <button
                  type="button"
                  onClick={onVerifyOtp}
                  disabled={
                    verifyingOtp || String(otp).length !== 6 || cooldownSecs > 0
                  }
                  className="px-3 py-2.5 rounded-lg text-xs font-semibold bg-[#e8720c] text-white hover:bg-[#d4620a] disabled:opacity-60"
                >
                  {verifyingOtp ? "Submitting..." : "Submit OTP"}
                </button>
              </div>
            </>
          )}
          {otpVerified ? (
            <p className="text-xs text-green-600 mt-1">Email OTP verified.</p>
          ) : null}
          <FieldError msg={errors?.otp} />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-[#0f0e0b]">Password</span>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0a898]"
            />
            <input
              name="password"
              type={showPw ? "text" : "password"}
              value={data.password}
              onChange={onChange}
              className="w-full pl-9 pr-10 py-2.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-lg text-sm text-[#0f0e0b] placeholder-[#b0a898] focus:outline-none focus:border-[#e8720c] focus:ring-1 focus:ring-[#e8720c]"
              placeholder="Min. 6 characters"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b0a898] hover:text-[#0f0e0b]"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <FieldError msg={errors?.password} />
        </label>
      </div>
    </div>
  );
}

function ProfileStep({ data, onChange, errors }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold text-[#0f0e0b]">Restaurant details</h3>
        <p className="text-sm text-[#857c6e] mt-1">
          These details appear on your guest menu and QR page.
        </p>
      </div>
      <div className="space-y-3">
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-[#0f0e0b]">
            No. of Tables
          </span>
          <div className="relative">
            <Table2
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0a898]"
            />
            <input
              name="tableCount"
              type="number"
              min={0}
              max={500}
              value={data.tableCount}
              onChange={onChange}
              className="w-full pl-9 pr-4 py-2.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-lg text-sm text-[#0f0e0b] placeholder-[#b0a898] focus:outline-none focus:border-[#e8720c] focus:ring-1 focus:ring-[#e8720c]"
              placeholder="12"
            />
          </div>
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-[#0f0e0b]">
            Cuisine Type
          </span>
          <div className="relative">
            <UtensilsCrossed
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0a898]"
            />
            <select
              name="cuisine"
              value={data.cuisine}
              onChange={onChange}
              className="w-full pl-9 pr-4 py-2.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-lg text-sm text-[#0f0e0b] focus:outline-none focus:border-[#e8720c] focus:ring-1 focus:ring-[#e8720c]"
            >
              <option value="">Select cuisine...</option>
              {CUISINE_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <FieldError msg={errors?.cuisine} />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-[#0f0e0b]">
            Phone Number
          </span>
          <div className="relative">
            <Phone
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0a898]"
            />
            <input
              name="phone"
              type="tel"
              value={data.phone}
              onChange={onChange}
              className="w-full pl-9 pr-4 py-2.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-lg text-sm text-[#0f0e0b] placeholder-[#b0a898] focus:outline-none focus:border-[#e8720c] focus:ring-1 focus:ring-[#e8720c]"
              placeholder="+91 98765 43210"
            />
          </div>
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-[#0f0e0b]">Address</span>
          <div className="relative">
            <MapPin
              size={15}
              className="absolute left-3 top-3 text-[#b0a898]"
            />
            <textarea
              name="address"
              value={data.address}
              onChange={onChange}
              rows={2}
              className="w-full pl-9 pr-4 py-2.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-lg text-sm text-[#0f0e0b] placeholder-[#b0a898] focus:outline-none focus:border-[#e8720c] focus:ring-1 focus:ring-[#e8720c] resize-none"
              placeholder="123, MG Road, Bengaluru, Karnataka"
            />
          </div>
          <FieldError msg={errors?.address} />
        </label>
      </div>
    </div>
  );
}

function ProcessingStep({ phase }) {
  const messages = [
    "Analysing your menu image…",
    "Extracting items & prices…",
    "Creating your restaurant profile…",
    "Setting up your dashboard…",
  ];
  return (
    <div className="py-12 flex flex-col items-center gap-5 text-center">
      <div className="w-16 h-16 rounded-full bg-[#fff5ec] flex items-center justify-center">
        <Loader2 size={30} className="text-[#e8720c] animate-spin" />
      </div>
      <div>
        <p className="text-lg font-bold text-[#0f0e0b]">
          Getting everything ready
        </p>
        <p className="text-sm text-[#857c6e] mt-1">
          {messages[phase % messages.length]}
        </p>
      </div>
      <div className="flex gap-1.5 mt-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-[#e8720c] opacity-70 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function DoneStep({ businessName, onGoDashboard }) {
  return (
    <div className="py-10 flex flex-col items-center gap-5 text-center">
      <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
        <CheckCircle2 size={40} className="text-green-500" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-[#0f0e0b]">
          You&apos;re all set! 🎉
        </h3>
        <p className="text-sm text-[#857c6e] mt-2 max-w-xs mx-auto">
          <strong>{businessName}</strong> is live. Head to your dashboard to
          manage your menu, tables, and orders.
        </p>
      </div>
      <button
        type="button"
        onClick={onGoDashboard}
        className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#e8720c] hover:bg-[#d4620a] text-white font-semibold transition-colors shadow-[0_4px_14px_rgba(232,114,12,0.25)]"
      >
        <Rocket size={16} /> Go to Dashboard
      </button>
    </div>
  );
}

function validateAccount(d, otpVerifiedToken, requireOtp = true) {
  const e = {};
  if (!d.businessName.trim())
    e.businessName = "Restaurant / hotel name is required";
  if (!d.ownerName.trim()) e.ownerName = "Name is required";
  if (!d.email.trim() || !/\S+@\S+\.\S+/.test(d.email))
    e.email = "Valid email required";
  if (requireOtp && !otpVerifiedToken) e.otp = "Verify email OTP to continue";
  if (d.password.length < 6) e.password = "Minimum 6 characters";
  return e;
}

function validateProfile(d) {
  const e = {};
  if (!d.cuisine) e.cuisine = "Select a cuisine type";
  if (!d.address.trim()) e.address = "Address is required";
  return e;
}

export default function RegistrationModal({ isOpen, onClose, onComplete }) {
  const { register, loading, clearError } = useRestroAuth();
  const [step, setStep] = useState(1);
  const [processingPhase, setProcessingPhase] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});
  const [account, setAccount] = useState(EMPTY_ACCOUNT);
  const [accountOtp, setAccountOtp] = useState("");
  const [otpVerifiedToken, setOtpVerifiedToken] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpSendCount, setOtpSendCount] = useState(0);
  const [otpWrongCount, setOtpWrongCount] = useState(0);
  const [cooldownEnd, setCooldownEnd] = useState(0);
  const [cooldownSecs, setCooldownSecs] = useState(0);
  const cooldownTimer = useRef(null);
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [menuImage, setMenuImage] = useState(null);
  const [aiMenuJson, setAiMenuJson] = useState(null);
  const [completedBusinessName, setCompletedBusinessName] = useState("");

  useEffect(() => {
    if (cooldownEnd <= Date.now()) {
      setCooldownSecs(0);
      return;
    }
    const update = () => {
      const remaining = Math.ceil((cooldownEnd - Date.now()) / 1000);
      if (remaining <= 0) {
        setCooldownSecs(0);
        clearInterval(cooldownTimer.current);
      } else {
        setCooldownSecs(remaining);
      }
    };
    update();
    cooldownTimer.current = setInterval(update, 1000);
    return () => clearInterval(cooldownTimer.current);
  }, [cooldownEnd]);

  const previewUrl = useMemo(() => {
    if (!menuImage) return "";
    return URL.createObjectURL(menuImage);
  }, [menuImage]);

  if (!isOpen) return null;

  function handleClose() {
    setStep(1);
    setFieldErrors({});
    setAccount(EMPTY_ACCOUNT);
    setAccountOtp("");
    setOtpVerifiedToken("");
    setOtpRequested(false);
    setOtpSendCount(0);
    setOtpWrongCount(0);
    setCooldownEnd(0);
    setCooldownSecs(0);
    clearInterval(cooldownTimer.current);
    setProfile(EMPTY_PROFILE);
    setMenuImage(null);
    setAiMenuJson(null);
    clearError();
    onClose();
  }

  function onAccountChange(e) {
    const { name, value } = e.target;
    setAccount((prev) => ({ ...prev, [name]: value }));
    if (name === "email") {
      setAccountOtp("");
      setOtpVerifiedToken("");
      setOtpRequested(false);
      setOtpSendCount(0);
      setOtpWrongCount(0);
      setCooldownEnd(0);
      clearInterval(cooldownTimer.current);
    }
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSendOtp() {
    if (cooldownSecs > 0) return;
    const emailValue = account.email.trim().toLowerCase();
    if (!/\S+@\S+\.\S+/.test(emailValue)) {
      setFieldErrors((prev) => ({ ...prev, email: "Valid email required" }));
      return;
    }

    try {
      setSendingOtp(true);
      await requestEmailOtp(emailValue, "register");
      setOtpRequested(true);
      setOtpVerifiedToken("");
      setFieldErrors((prev) => ({ ...prev, otp: undefined }));
      toast.success("OTP sent to your email");
      setOtpSendCount((prev) => {
        const next = prev + 1;
        if (next >= 3) {
          setCooldownEnd(Date.now() + 2 * 60 * 1000);
        }
        return next;
      });
    } catch (err) {
      toast.error(err.message || "Unable to send OTP");
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifyOtp() {
    if (cooldownSecs > 0) return;
    const emailValue = account.email.trim().toLowerCase();
    const otpValue = accountOtp.trim();

    if (!/^\d{6}$/.test(otpValue)) {
      setFieldErrors((prev) => ({ ...prev, otp: "Enter valid 6-digit OTP" }));
      return;
    }

    try {
      setVerifyingOtp(true);
      const res = await verifyEmailOtp(emailValue, "register", otpValue);
      setOtpVerifiedToken(res.otpToken);
      setOtpWrongCount(0);
      setFieldErrors((prev) => ({ ...prev, otp: undefined }));
      toast.success("Email verified");
    } catch (err) {
      setOtpVerifiedToken("");
      toast.error(err.message || "OTP verification failed");
      setOtpWrongCount((prev) => {
        const next = prev + 1;
        if (next >= 3) {
          setCooldownEnd(Date.now() + 2 * 60 * 1000);
        }
        return next;
      });
    } finally {
      setVerifyingOtp(false);
    }
  }

  function onProfileChange(e) {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleNext() {
    if (step === 1) {
      const errs = validateAccount(account, otpVerifiedToken, false);
      if (Object.keys(errs).length) {
        setFieldErrors(errs);
        return;
      }

      if (!otpRequested) {
        await handleSendOtp();
        return;
      }

      if (!otpVerifiedToken) {
        setFieldErrors((prev) => ({
          ...prev,
          otp: "Submit and verify OTP to continue",
        }));
        return;
      }

      setStep(2);
    } else if (step === 2) {
      const errs = validateProfile(profile);
      if (Object.keys(errs).length) {
        setFieldErrors(errs);
        return;
      }
      setStep(3);
    } else if (step === 3) {
      await processAndRegister();
    }
  }

  async function processAndRegister() {
    setStep("processing");
    clearError();
    let phase = 0;
    const tick = setInterval(() => {
      phase++;
      setProcessingPhase(phase);
    }, 700);

    if (menuImage) {
      try {
        const extracted = await extractMenuFromImage(menuImage);
        setAiMenuJson({ items: extracted.items || [] });
      } catch (err) {
        clearInterval(tick);
        if (err?.code === "VISION_BILLING_REQUIRED" || err?.status === 402) {
          toast.error(
            "Google Vision billing is not enabled. Enable billing in Google Cloud and retry OCR, or continue registration without image processing.",
          );
        } else {
          toast.error(err?.message || "Failed to extract menu from image");
        }
        setStep(3);
        return;
      }
    }

    const autoUsername =
      account.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "")
        .slice(0, 30) +
      "_" +
      Math.floor(1000 + Math.random() * 9000);

    const result = await register({
      ownerName: account.ownerName,
      email: account.email,
      username: autoUsername,
      password: account.password,
      otpToken: otpVerifiedToken,
      businessName: account.businessName,
      businessType: account.businessType,
      phone: profile.phone,
      address: profile.address,
      tableCount: Number(profile.tableCount) || 0,
    });

    clearInterval(tick);

    if (!result.success) {
      toast.error(result.error || "Registration failed. Please try again.");
      setStep(1);
      return;
    }

    toast.success(`Welcome! ${account.businessName} is all set 🎉`);
    setCompletedBusinessName(account.businessName);
    setStep(menuImage ? "review" : "done");
  }

  async function handleReviewComplete(editedItems) {
    const rows = Array.isArray(editedItems) ? editedItems : [];
    if (rows.length === 0) {
      setStep("done");
      return;
    }

    setStep("processing");
    setProcessingPhase(2);

    try {
      for (const row of rows) {
        const name = String(row?.name || "").trim();
        const category = String(row?.category || "Mains").trim() || "Mains";
        const price = Number(row?.price || 0);

        if (!name || !Number.isFinite(price) || price <= 0) continue;

        await createMenuItem({
          name,
          category,
          price,
          description: String(row?.description || "").trim(),
          isVeg: row?.isVeg !== false,
          isAvailable: true,
          preparationTime: 15,
          spiceLevel: 2,
          allergens: [],
        });
      }

      toast.success("Menu created from uploaded image");
      setStep("done");
    } catch (err) {
      toast.error(err?.message || "Failed to create menu items");
      setStep("review");
    }
  }

  const isProcessing = step === "processing";
  const isReview = step === "review";
  const isDoneStep = step === "done";
  const numericStep = typeof step === "number" ? step : null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
      <Motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white border border-[#e0d9ce] shadow-[0_25px_80px_rgba(15,14,11,0.28)]"
      >
        {!isDoneStep && (
          <div className="p-5 sm:p-6 border-b border-[#f0ebe0] flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#0f0e0b]">
                Restaurant Registration
              </h2>
              <p className="text-xs text-[#857c6e] mt-0.5">
                {isProcessing
                  ? "Setting up your account…"
                  : isReview
                    ? "Review your menu items"
                    : `Step ${numericStep} of ${STEPS.length}`}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={isProcessing || loading}
              className="w-9 h-9 rounded-full border border-[#e0d9ce] flex items-center justify-center text-[#857c6e] hover:text-[#0f0e0b] disabled:opacity-40"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {numericStep && !isDoneStep && (
          <div className="px-5 sm:px-6 pt-4">
            <div className="flex gap-1">
              {STEPS.map((s) => (
                <div
                  key={s.id}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${s.id <= numericStep ? "bg-[#e8720c]" : "bg-[#e0d9ce]"}`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1.5">
              {STEPS.map((s) => (
                <span
                  key={s.id}
                  className={`text-[10px] font-semibold ${s.id === numericStep ? "text-[#e8720c]" : "text-[#b0a898]"}`}
                >
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="p-5 sm:p-6">
          <AnimatePresence mode="wait">
            {isProcessing && (
              <Motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ProcessingStep phase={processingPhase} />
              </Motion.div>
            )}
            {isDoneStep && (
              <Motion.div
                key="done"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <DoneStep
                  businessName={completedBusinessName}
                  onGoDashboard={() => {
                    handleClose();
                    onComplete();
                  }}
                />
              </Motion.div>
            )}
            {isReview && (
              <Motion.div
                key="review"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <RegistrationReviewStep
                  aiGeneratedData={aiMenuJson}
                  onComplete={handleReviewComplete}
                />
              </Motion.div>
            )}
            {numericStep === 1 && (
              <Motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <AccountStep
                  data={account}
                  onChange={onAccountChange}
                  errors={fieldErrors}
                  otp={accountOtp}
                  otpRequested={otpRequested}
                  onOtpChange={(e) => {
                    const next = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setAccountOtp(next);
                    if (fieldErrors.otp) {
                      setFieldErrors((prev) => ({ ...prev, otp: undefined }));
                    }
                  }}
                  onSendOtp={handleSendOtp}
                  onVerifyOtp={handleVerifyOtp}
                  sendingOtp={sendingOtp}
                  verifyingOtp={verifyingOtp}
                  otpVerified={Boolean(otpVerifiedToken)}
                  cooldownSecs={cooldownSecs}
                />
              </Motion.div>
            )}
            {numericStep === 2 && (
              <Motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ProfileStep
                  data={profile}
                  onChange={onProfileChange}
                  errors={fieldErrors}
                />
              </Motion.div>
            )}
            {numericStep === 3 && (
              <Motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <MenuUploadStep
                  selectedFile={menuImage}
                  previewUrl={previewUrl}
                  onFileChange={(e) =>
                    setMenuImage(e.target.files?.[0] || null)
                  }
                  onProcess={handleNext}
                />
              </Motion.div>
            )}
          </AnimatePresence>

          {numericStep && !isDoneStep && (
            <div
              className={`flex mt-6 gap-3 ${numericStep > 1 ? "justify-between" : "justify-end"}`}
            >
              {numericStep > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#e0d9ce] text-sm font-semibold text-[#857c6e] hover:text-[#0f0e0b] hover:border-[#0f0e0b] transition-colors"
                >
                  <ChevronLeft size={15} /> Back
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                {numericStep === 3 && (
                  <button
                    type="button"
                    onClick={processAndRegister}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#e0d9ce] text-sm font-semibold text-[#857c6e] hover:text-[#0f0e0b] hover:border-[#0f0e0b] transition-colors"
                  >
                    Skip
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    loading ||
                    (numericStep === 1 && (sendingOtp || verifyingOtp))
                  }
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#e8720c] hover:bg-[#d4620a] text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-[0_4px_14px_rgba(232,114,12,0.2)]"
                >
                  {loading ||
                  (numericStep === 1 && (sendingOtp || verifyingOtp)) ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : null}
                  {numericStep === 1
                    ? sendingOtp
                      ? "Sending OTP..."
                      : !otpRequested
                        ? "Send OTP"
                        : "Next"
                    : numericStep === 3
                      ? menuImage
                        ? "Process Menu"
                        : "Upload & Continue"
                      : numericStep === 2
                        ? "Continue to Menu"
                        : "Next"}
                  {!loading && <ChevronRight size={15} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </Motion.div>
    </div>
  );
}
