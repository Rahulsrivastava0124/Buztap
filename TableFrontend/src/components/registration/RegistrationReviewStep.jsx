import { useEffect, useMemo, useState } from "react";

function DefaultManualMenuDashboard({ initialItems, onItemsChange }) {
  const [items, setItems] = useState(initialItems);

  const handleField = (index, field, value) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    setItems(updated);
    onItemsChange(updated);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="rounded-xl border border-[#e0d9ce] bg-white p-3 grid grid-cols-1 md:grid-cols-4 gap-2"
        >
          <input
            value={item.name}
            onChange={(e) => handleField(index, "name", e.target.value)}
            className="md:col-span-2 h-9 px-3 rounded-lg border border-[#e0d9ce] text-sm"
          />
          <input
            value={item.category}
            onChange={(e) => handleField(index, "category", e.target.value)}
            className="h-9 px-3 rounded-lg border border-[#e0d9ce] text-sm"
          />
          <input
            value={item.price}
            onChange={(e) => handleField(index, "price", e.target.value)}
            className="h-9 px-3 rounded-lg border border-[#e0d9ce] text-sm"
          />
        </div>
      ))}
    </div>
  );
}

export default function RegistrationReviewStep({
  aiGeneratedData,
  onComplete,
  ManualMenuDashboardComponent = DefaultManualMenuDashboard,
}) {
  const mappedItems = useMemo(() => {
    const source =
      aiGeneratedData?.items ||
      aiGeneratedData?.menuItems ||
      aiGeneratedData ||
      [];

    return source.map((item, index) => ({
      id: item.id || `ai-${index + 1}`,
      name: item.name || item.title || "Untitled Item",
      price: String(item.price ?? item.amount ?? "0"),
      category: item.category || "Mains",
      description: item.description || "",
      isVeg: item.isVeg ?? true,
    }));
  }, [aiGeneratedData]);

  const [editedItems, setEditedItems] = useState(mappedItems);
  const DashboardComponent = ManualMenuDashboardComponent;

  useEffect(() => {
    setEditedItems(mappedItems);
  }, [mappedItems]);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold text-[#0f0e0b]">Review your menu</h3>
        <p className="text-sm text-[#857c6e] mt-1">
          Edit AI-extracted items before finishing registration.
        </p>
      </div>

      <DashboardComponent
        initialItems={editedItems}
        onItemsChange={setEditedItems}
      />

      <button
        type="button"
        onClick={() => onComplete(editedItems)}
        className="w-full h-11 rounded-xl bg-[#e8720c] text-white font-semibold"
      >
        Complete Registration & Save Menu
      </button>
    </div>
  );
}
