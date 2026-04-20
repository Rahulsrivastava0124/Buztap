import { useMemo, useState } from "react";
import { Loader2, X } from "lucide-react";
import MenuUploadStep from "./MenuUploadStep";
import RegistrationReviewStep from "./RegistrationReviewStep";

const STEPS = [
  { id: 1, label: "Menu Upload" },
  { id: 2, label: "Processing" },
  { id: 3, label: "Review" },
];

function ReviewMenu({ aiGeneratedData, onComplete }) {
  return (
    <RegistrationReviewStep
      aiGeneratedData={aiGeneratedData}
      onComplete={onComplete}
    />
  );
}

export default function RegistrationModal({ isOpen, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    menuImage: null,
    aiMenuJson: null,
  });

  const previewUrl = useMemo(() => {
    if (!registrationData.menuImage) return "";
    return URL.createObjectURL(registrationData.menuImage);
  }, [registrationData.menuImage]);

  if (!isOpen) return null;

  const closeAndReset = () => {
    setCurrentStep(1);
    setProcessing(false);
    setRegistrationData({
      menuImage: null,
      aiMenuJson: null,
    });
    onClose();
  };

  const processMenuImage = async () => {
    if (!registrationData.menuImage) return;
    setCurrentStep(2);
    setProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 2200));

    const fakeAiMenuJson = {
      items: [
        { name: "Paneer Butter Masala", category: "Mains", price: 280 },
        { name: "Dal Makhani", category: "Mains", price: 220 },
        { name: "Garlic Naan", category: "Breads", price: 60 },
        { name: "Mango Lassi", category: "Beverages", price: 120 },
      ],
    };

    setRegistrationData((prev) => ({ ...prev, aiMenuJson: fakeAiMenuJson }));
    setProcessing(false);
    setCurrentStep(3);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!registrationData.menuImage) return;
      processMenuImage();
      return;
    }
  };

  const handleBack = () => {
    if (currentStep <= 1 || currentStep === 2) return;
    setCurrentStep((prev) => prev - 1);
  };

  const isNextDisabled = currentStep === 1 && !registrationData.menuImage;

  return (
    <div className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white border border-[#e0d9ce] shadow-[0_25px_80px_rgba(15,14,11,0.28)]">
        <div className="p-5 sm:p-7 border-b border-[#f0ebe0] flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#0f0e0b]">
              Restaurant Registration
            </h2>
            <p className="text-sm text-[#857c6e]">
              Complete your setup in 3 quick steps.
            </p>
          </div>
          <button
            type="button"
            onClick={closeAndReset}
            className="w-9 h-9 rounded-full border border-[#e0d9ce] flex items-center justify-center text-[#857c6e] hover:text-[#0f0e0b]"
          >
            <X size={17} />
          </button>
        </div>

        <div className="px-5 sm:px-7 pt-5">
          <div className="grid grid-cols-3 gap-2">
            {STEPS.map((step) => (
              <div key={step.id} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                    step.id <= currentStep
                      ? "bg-[#e8720c] text-white"
                      : "bg-[#f5f0e8] text-[#857c6e]"
                  }`}
                >
                  {step.id}
                </div>
                <span className="text-xs font-semibold text-[#857c6e] hidden sm:inline">
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-7">
          {currentStep === 1 && (
            <MenuUploadStep
              selectedFile={registrationData.menuImage}
              previewUrl={previewUrl}
              onFileChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setRegistrationData((prev) => ({ ...prev, menuImage: file }));
              }}
              onProcess={processMenuImage}
            />
          )}

          {currentStep === 2 && (
            <div className="h-[280px] flex flex-col items-center justify-center text-center">
              <Loader2 size={34} className="text-[#e8720c] animate-spin mb-3" />
              <h3 className="text-xl font-bold text-[#0f0e0b]">
                Digitizing your menu...
              </h3>
              <p className="text-sm text-[#857c6e] mt-1">
                Extracting dishes, prices, and categories from your image.
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <ReviewMenu
              aiGeneratedData={registrationData.aiMenuJson?.items || []}
              onComplete={(editedItems) => {
                onComplete({ ...registrationData, editedItems });
                closeAndReset();
              }}
            />
          )}
        </div>

        <div className="px-5 sm:px-7 pb-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1 || currentStep === 2 || processing}
            className="h-10 px-4 rounded-xl border border-[#e0d9ce] text-sm font-semibold text-[#0f0e0b] disabled:opacity-50"
          >
            Back
          </button>

          {currentStep === 1 && (
            <button
              type="button"
              onClick={handleNext}
              disabled={isNextDisabled || processing}
              className="h-10 px-5 rounded-xl bg-[#e8720c] text-white text-sm font-semibold disabled:opacity-50"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
