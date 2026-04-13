import { Camera, ImagePlus } from "lucide-react";

export default function MenuUploadStep({
  selectedFile,
  previewUrl,
  onFileChange,
  onProcess,
}) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold text-[#0f0e0b]">Upload your menu</h3>
        <p className="text-sm text-[#857c6e] mt-1">
          Upload a menu image and we will digitize it automatically.
        </p>
      </div>

      <label className="block border-2 border-dashed border-[#e0d9ce] bg-[#faf7f2] rounded-2xl p-8 text-center cursor-pointer hover:border-[#e8720c] transition-colors">
        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />
        <ImagePlus size={30} className="mx-auto text-[#e8720c] mb-3" />
        <p className="text-sm font-semibold text-[#0f0e0b]">
          Drag & drop or click to upload
        </p>
        <p className="text-xs text-[#857c6e] mt-1">PNG, JPG, WEBP supported</p>
      </label>

      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e0d9ce] text-[#0f0e0b] font-semibold text-sm cursor-pointer hover:border-[#e8720c] transition-colors">
        <Camera size={16} className="text-[#e8720c]" />
        Take Photo of Menu
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onFileChange}
          className="hidden"
        />
      </label>

      {selectedFile && (
        <div className="rounded-2xl border border-[#e0d9ce] p-3 bg-white flex items-center gap-3">
          <img
            src={previewUrl}
            alt="menu preview"
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#0f0e0b] truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-[#857c6e]">Ready to process</p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onProcess}
        disabled={!selectedFile}
        className="w-full h-11 rounded-xl bg-[#e8720c] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Process Menu
      </button>
    </div>
  );
}
