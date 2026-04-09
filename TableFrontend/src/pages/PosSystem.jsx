import { useState } from "react";
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, Utensils } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";

const MENU_CATEGORIES = ["All", "Starters", "Mains", "Breads", "Desserts", "Beverages"];

const MENU_ITEMS = [
  { id: 1, name: "Paneer Butter Masala", price: 280, cat: "Mains", img: "https://images.unsplash.com/photo-1565557623262-b51c2513a695?w=300&q=70" },
  { id: 2, name: "Garlic Naan", price: 60, cat: "Breads", img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=70" },
  { id: 3, name: "Dal Makhani", price: 220, cat: "Mains", img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=70" },
  { id: 4, name: "Chicken Tikka", price: 320, cat: "Starters", img: "https://images.unsplash.com/photo-1599487405613-2b63b2f1aa0c?w=300&q=70" },
  { id: 5, name: "Mango Lassi", price: 120, cat: "Beverages", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&q=70" },
  { id: 6, name: "Veg Samosa (2pcs)", price: 80, cat: "Starters", img: "https://images.unsplash.com/photo-1601050690117-94f5f6af8bc7?w=300&q=70" },
  { id: 7, name: "Butter Chicken", price: 380, cat: "Mains", img: "https://images.unsplash.com/photo-1603894584373-baefe11e86a5?w=300&q=70" },
  { id: 8, name: "Tandoori Roti", price: 30, cat: "Breads", img: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300&q=70" },
];

export default function PosSystem() {
  const [activeCat, setActiveCat] = useState("All");
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTable, setSelectedTable] = useState("01");

  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesCat = activeCat === "All" || item.cat === activeCat;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) => prev.map((item) => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const removeItem = (id) => setCart((prev) => prev.filter((i) => i.id !== id));

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = subtotal * 0.05; // 5% GST
  const total = subtotal + tax;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row overflow-hidden bg-[#faf7f2]">
      
      {/* ── Left Area: Menu Grid ── */}
      <div className="flex-1 flex flex-col overflow-hidden relative border-r border-[#e0d9ce]">
        
        {/* Top Controls */}
        <div className="p-4 bg-white border-b border-[#e0d9ce] flex flex-col gap-3 z-10 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-[#b0a898]" size={18} />
            <input 
              type="text" 
              placeholder="Search items by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#e0d9ce] rounded-lg text-sm bg-[#faf7f2] focus:outline-none focus:ring-1 focus:ring-[#e8720c] focus:border-[#e8720c] transition-all"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
            {MENU_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  activeCat === cat 
                    ? "bg-[#e8720c] text-white shadow-sm" 
                    : "bg-[#f5f0e8] text-[#857c6e] hover:bg-[#e0d9ce]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white border border-[#e0d9ce] rounded-xl overflow-hidden hover:border-[#e8720c] hover:shadow-md transition-all text-left flex flex-col group relative"
              >
                <div className="h-28 w-full overflow-hidden bg-gray-100">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm text-[#0f0e0b] leading-tight mb-1 line-clamp-2">{item.name}</p>
                  <p className="font-roboto font-bold text-[#e8720c]">₹{item.price}</p>
                </div>
                <div className="absolute inset-0 bg-[#e8720c]/10 opacity-0 group-active:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

      </div>


      {/* ── Right Area: Ticket (Cart) ── */}
      <div className="w-full lg:w-96 bg-white flex flex-col shadow-xl z-20 shrink-0">
        
        {/* Ticket Header */}
        <div className="p-4 border-b border-[#e0d9ce] bg-[#faf7f2] flex items-center justify-between">
          <h2 className="font-bold text-[#0f0e0b] flex items-center gap-2">
            <Utensils size={18} className="text-[#e8720c]" />
            Current Order
          </h2>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[#857c6e]">Table</label>
            <select 
              value={selectedTable} 
              onChange={(e) => setSelectedTable(e.target.value)}
              className="bg-white border border-[#e0d9ce] rounded-md px-2 py-1 text-sm font-bold text-[#e8720c] outline-none"
            >
              {[...Array(20)].map((_, i) => (
                <option key={i} value={String(i + 1).padStart(2, '0')}>
                  {String(i + 1).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-white">
          <AnimatePresence>
            {cart.length === 0 ? (
              <Motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50"
              >
                <div className="w-16 h-16 bg-[#f5f0e8] rounded-full flex items-center justify-center">
                  <Utensils size={32} className="text-[#b0a898]" />
                </div>
                <p className="text-sm font-semibold text-[#857c6e]">No items in order.</p>
                <p className="text-xs text-[#b0a898]">Tap an item on the left to add it.</p>
              </Motion.div>
            ) : (
              cart.map((item) => (
                <Motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col gap-2 p-3 bg-[#faf7f2] border border-[#e0d9ce] rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-sm text-[#0f0e0b] max-w-[200px] leading-tight">{item.name}</p>
                    <p className="font-roboto font-bold text-[#0f0e0b]">₹{item.price * item.qty}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button onClick={() => removeItem(item.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                      <Trash2 size={16} />
                    </button>
                    
                    <div className="flex items-center gap-3 bg-white border border-[#e0d9ce] rounded-md px-1.5 h-8 block">
                      <button onClick={() => updateQty(item.id, -1)} className="text-[#857c6e] hover:text-[#0f0e0b]">
                        <Minus size={16} />
                      </button>
                      <span className="font-bold text-sm w-4 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="text-[#e8720c] hover:text-[#d4620a]">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </Motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Footer Settings & Payment */}
        <div className="p-4 border-t border-[#e0d9ce] bg-[#faf7f2] space-y-4 shadow-[0_-4px_15px_rgba(0,0,0,0.03)]">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm text-[#857c6e]">
              <span>Subtotal</span>
              <span className="font-roboto font-medium text-[#0f0e0b]">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#857c6e]">
              <span>Tax (5% GST)</span>
              <span className="font-roboto font-medium text-[#0f0e0b]">₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-end pt-2 border-t border-[#e0d9ce] mt-2">
              <span className="font-bold text-[#0f0e0b]">Total</span>
              <span className="font-roboto text-2xl font-black text-[#e8720c]">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button 
              disabled={cart.length === 0}
              className="py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 border-2 border-[#e8720c] text-[#e8720c] hover:bg-[#fef0e4] transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              <Banknote size={18} /> Cash
            </button>
            <button 
              disabled={cart.length === 0}
              className="py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-[#e8720c] hover:bg-[#d4620a] text-white shadow-md transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              <CreditCard size={18} /> Card
            </button>
          </div>
          <button 
              disabled={cart.length === 0}
              className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-[#3a6348] hover:bg-[#2c4c37] text-white shadow-[0_4px_15px_rgba(58,99,72,0.3)] transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              Send to Kitchen
          </button>
        </div>

      </div>
    </div>
  );
}
