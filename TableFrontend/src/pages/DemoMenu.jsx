import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Plus, Minus, ShoppingBag, Instagram, Facebook, Twitter, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const FOOD_ITEMS = [
  {
    id: 1,
    name: "Paneer Butter Masala",
    price: 280,
    veg: true,
    desc: "Soft paneer cubes in rich tomato gravy, slowly cooked to perfection.",
    img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80",
    category: "Mains"
  },
  {
    id: 2,
    name: "Dal Makhani",
    price: 220,
    veg: true,
    desc: "Creamy slow-cooked black lentils with Indian spices.",
    img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80",
    category: "Mains"
  },
  {
    id: 3,
    name: "Chicken Tikka",
    price: 360,
    veg: false,
    desc: "Charcoal grilled chicken chunks marinated in yogurt and spices.",
    img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80",
    category: "Starters"
  },
  {
    id: 4,
    name: "Garlic Naan",
    price: 60,
    veg: true,
    desc: "Soft traditional Indian bread topped with finely chopped garlic.",
    img: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80",
    category: "Breads"
  },
  {
    id: 5,
    name: "Virgin Mojito",
    price: 150,
    veg: true,
    desc: "Refreshing mint & lemon beverage served chilled.",
    img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80",
    category: "Drinks"
  }
];

const CATEGORIES = ["All", "Starters", "Mains", "Breads", "Drinks"];

export default function DemoMenu() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [orderStatus, setOrderStatus] = useState(0);
  const [orderNo, setOrderNo] = useState("");
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (orderPlaced) {
      setOrderStatus(0);
      const timer1 = setTimeout(() => setOrderStatus(1), 3500);
      const timer2 = setTimeout(() => setOrderStatus(2), 7500);
      return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }
  }, [orderPlaced]);

  const addToCart = (id) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[id] > 1) {
        newCart[id] -= 1;
      } else {
        delete newCart[id];
      }
      return newCart;
    });
  };

  const cartTotalPairs = Object.entries(cart);
  const totalItems = cartTotalPairs.reduce((sum, [_, qty]) => sum + qty, 0);
  const totalPrice = cartTotalPairs.reduce((sum, [id, qty]) => {
    const item = FOOD_ITEMS.find(i => i.id === Number(id));
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const filteredItems = activeCategory === "All" 
    ? FOOD_ITEMS 
    : FOOD_ITEMS.filter(item => item.category === activeCategory);

  useEffect(() => {
    if (totalItems === 0 && showCart) {
      setShowCart(false);
    }
  }, [totalItems, showCart]);

  if (!isJoined) {
    return (
      <div className="bg-[#faf7f2] min-h-screen font-body shadow-2xl relative flex flex-col pt-12 md:pt-0 pb-12 lg:pb-0">
        <div className="bg-white min-h-screen md:min-h-[850px] w-full max-w-md mx-auto relative lg:border-x lg:border-[#e0d9ce] flex flex-col md:rounded-3xl overflow-hidden shadow-2xl md:my-auto">
          <div className="h-72 relative w-full shrink-0 bg-[#1a1814]">
            <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80" alt="Restaurant" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e0b]/90 via-[#0f0e0b]/30 to-transparent" />
            <div className="absolute top-6 left-6 w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-xl font-black text-[#0f0e0b] font-display">SG</span>
            </div>
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-3xl font-bold mb-1 drop-shadow-md">Spice Garden</h1>
              <p className="text-white/80 font-medium drop-shadow-md">Scan & Order Demo</p>
            </div>
          </div>
          <div className="flex-1 p-8 flex flex-col justify-center -mt-6 bg-white rounded-t-3xl relative z-10 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
            <h2 className="text-2xl font-bold text-[#0f0e0b] mb-2 font-display tracking-tight">Welcome!</h2>
            <p className="text-[#857c6e] text-sm mb-8 leading-relaxed">Please enter your details to view our digital menu and place your interactive order.</p>

            <form onSubmit={(e) => { e.preventDefault(); if(guestName && guestPhone) setIsJoined(true); }} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-[#857c6e] uppercase tracking-wider mb-2">Your Name</label>
                <input 
                  type="text" 
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="E.g. Jane Doe"
                  className="w-full px-4 py-3.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-xl focus:outline-none focus:border-[#e8720c] focus:ring-1 focus:ring-[#e8720c] transition-all text-[#0f0e0b] font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#857c6e] uppercase tracking-wider mb-2">Phone Number</label>
                <div className="flex bg-[#faf7f2] border border-[#e0d9ce] rounded-xl overflow-hidden focus-within:border-[#e8720c] focus-within:ring-1 focus-within:ring-[#e8720c] transition-all">
                  <div className="px-3 py-3.5 bg-[#f0ebe0] border-r border-[#e0d9ce] text-[#857c6e] font-semibold text-sm flex items-center justify-center pointer-events-none">
                    +91
                  </div>
                  <input 
                    type="tel" 
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="99999 99999"
                    className="w-full px-4 py-3.5 bg-transparent focus:outline-none text-[#0f0e0b] font-medium"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-4 mt-6 bg-[#e8720c] hover:bg-[#d4620a] text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(232,114,12,0.3)] transition-colors flex items-center justify-center gap-2"
              >
                View Menu <ArrowLeft size={18} className="rotate-180" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#faf7f2] min-h-screen font-body shadow-2xl relative pb-24 lg:pb-0">
      <div className="bg-[#faf7f2] min-h-screen max-w-md mx-auto relative lg:border-x lg:border-[#e0d9ce]">
        {/* Header Image */}
        <div className="relative h-56 w-full bg-[#1a1814]">
          <img 
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80" 
            alt="Restaurant Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e0b]/90 via-[#0f0e0b]/30 to-transparent" />
          
          {/* Top Navbar */}
          <div className="absolute top-0 left-0 w-full p-4 flex items-center justify-between z-10">
            <Link to="/" className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors border border-white/10">
              <ArrowLeft size={20} />
            </Link>
            <button className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors border border-white/10">
              <Search size={20} />
            </button>
          </div>

          {/* Restaurant Info */}
          <div className="absolute bottom-0 left-0 w-full px-5 py-4 flex items-end gap-4 z-10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex-shrink-0">
              <span className="text-2xl font-black text-[#0f0e0b] font-display">SG</span>
            </div>
            <div className="pb-1">
              <h1 className="text-white text-3xl font-bold mb-1 leading-tight drop-shadow-md">Spice Garden</h1>
              <p className="text-white/90 text-sm font-medium drop-shadow-md">North Indian • Table 04</p>
            </div>
          </div>
        </div>

        {/* Categories Sticky Navbar */}
        <div className="sticky top-0 bg-[#faf7f2] z-40 border-b border-[#e0d9ce] px-2 py-3 overflow-x-auto no-scrollbar shadow-sm">
          <div className="flex gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full whitespace-nowrap font-semibold text-sm transition-colors ${
                  activeCategory === cat 
                    ? "bg-[#e8720c] text-white shadow-md shadow-[#e8720c]/20" 
                    : "bg-white text-[#857c6e] border border-[#e0d9ce]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu List */}
        <div className="p-4 space-y-4 pb-32">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-2xl p-3 flex gap-4 shadow-sm border border-transparent hover:border-[#e0d9ce] transition-colors">
              {/* Item Info */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span 
                    className="w-3.5 h-3.5 rounded-[3px] border-[1.5px] flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: item.veg ? "#3a6348" : "#c0392b" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.veg ? "#3a6348" : "#c0392b" }} />
                  </span>
                  <h3 className="font-bold text-[#0f0e0b] text-[15px] leading-tight">{item.name}</h3>
                </div>
                <p className="font-semibold text-[#0f0e0b] mb-1">₹{item.price}</p>
                <p className="text-xs text-[#857c6e] line-clamp-2 leading-relaxed pr-2">{item.desc}</p>
              </div>

              {/* Item Image & Controls */}
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="w-24 h-24 rounded-xl overflow-hidden shadow-sm relative">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                </div>
                {!cart[item.id] ? (
                  <button 
                    onClick={() => addToCart(item.id)}
                    className="w-full py-1.5 bg-[#fef0e4] text-[#e8720c] border border-[#e8720c]/30 rounded-lg text-sm font-bold shadow-sm hover:bg-[#e8720c] hover:text-white transition-colors"
                  >
                    ADD
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-between bg-white border border-[#e8720c] rounded-lg shadow-sm">
                    <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-[#e8720c]">
                      <Minus size={16} />
                    </button>
                    <span className="font-bold text-[#0f0e0b] text-sm">{cart[item.id]}</span>
                    <button onClick={() => addToCart(item.id)} className="p-1.5 text-[#e8720c]">
                      <Plus size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Social Media Footer */}
          <div className="pt-8 pb-4 flex flex-col items-center justify-center border-t border-[#e0d9ce]/60 mt-8 mb-4">
            <p className="text-[10px] font-bold text-[#857c6e] uppercase tracking-widest mb-4">Follow Spice Garden</p>
            <div className="flex items-center gap-4">
               <a href="#" className="w-[38px] h-[38px] rounded-full bg-white border border-[#e0d9ce] flex items-center justify-center text-[#423d33] hover:bg-[#e8720c] hover:border-[#e8720c] hover:text-white hover:-translate-y-0.5 transition-all shadow-sm">
                 <Instagram size={17} />
               </a>
               <a href="#" className="w-[38px] h-[38px] rounded-full bg-white border border-[#e0d9ce] flex items-center justify-center text-[#423d33] hover:bg-[#e8720c] hover:border-[#e8720c] hover:text-white hover:-translate-y-0.5 transition-all shadow-sm">
                 <Facebook size={17} />
               </a>
               <a href="#" className="w-[38px] h-[38px] rounded-full bg-white border border-[#e0d9ce] flex items-center justify-center text-[#423d33] hover:bg-[#e8720c] hover:border-[#e8720c] hover:text-white hover:-translate-y-0.5 transition-all shadow-sm">
                 <Twitter size={17} />
               </a>
            </div>
            <p className="text-[10px] text-[#857c6e] mt-4 font-medium">Powered by restroMenu © 2026</p>
          </div>
        </div>

        {/* Floating Cart */}
        <AnimatePresence>
          {totalItems > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-6 left-0 w-full px-4 z-50 pointer-events-none"
            >
              <div className="max-w-md mx-auto pointer-events-auto">
                <div className="bg-[#e8720c] rounded-2xl shadow-[0_12px_30px_rgba(232,114,12,0.35)] p-4 flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center relative">
                      <ShoppingBag size={20} />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#0f0e0b] rounded-full flex items-center justify-center text-[10px] font-bold">
                        {totalItems}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest mb-0.5">Total to pay</p>
                      <p className="font-bold text-lg leading-none">₹{totalPrice}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowCart(true)} className="flex items-center gap-2 font-bold text-sm bg-[#faf7f2] text-[#e8720c] px-5 py-2.5 rounded-xl hover:bg-white transition-colors shadow-sm">
                    View Cart
                    <div className="bg-[#fef0e4] p-1 rounded-md hidden sm:block">
                      <ArrowLeft size={14} className="rotate-180" />
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Checkout Modal */}
        <AnimatePresence>
          {showCart && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[60] flex justify-center bg-black/60 backdrop-blur-sm"
            >
              <div className="w-full max-w-md h-[100dvh] bg-[#faf7f2] flex flex-col relative overflow-hidden shadow-2xl">
                {/* Checkout Header */}
                <div className="px-4 py-4 border-b border-[#e0d9ce] bg-white flex items-center gap-3 shrink-0">
                  <button 
                    onClick={() => {
                        if (orderPlaced) {
                            setCart({});
                            setOrderPlaced(false);
                            setShowCart(false);
                            setRating(0);
                        } else {
                            setShowCart(false);
                        }
                    }} 
                    className="w-10 h-10 rounded-full bg-[#f5f0e8] flex items-center justify-center text-[#0f0e0b] hover:bg-[#e0d9ce] transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <h2 className="font-bold text-xl text-[#0f0e0b]">Your Order</h2>
                </div>
                
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 pb-32">
                  {!orderPlaced ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      {/* Cart Items List */}
                      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
                        {cartTotalPairs.map(([id, qty]) => {
                          const item = FOOD_ITEMS.find(i => i.id === Number(id));
                          if (!item) return null;
                          return (
                            <div key={id} className="flex justify-between items-center">
                              <div className="flex-1 pr-4">
                                <h4 className="font-bold text-[#0f0e0b] text-sm leading-tight mb-1">{item.name}</h4>
                                <p className="font-semibold text-xs text-[#857c6e]">₹{item.price} x {qty}</p>
                              </div>
                              <div className="flex items-center gap-3 bg-[#f5f0e8] rounded-lg p-1 px-2 border border-[#e0d9ce]">
                                <button onClick={() => removeFromCart(item.id)} className="text-[#e8720c] p-1"><Minus size={14}/></button>
                                <span className="font-bold text-sm text-[#0f0e0b] w-4 text-center">{qty}</span>
                                <button onClick={() => addToCart(item.id)} className="text-[#e8720c] p-1"><Plus size={14}/></button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      
                      {/* Bill Summary */}
                      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e0d9ce]">
                        <h3 className="font-bold text-[#0f0e0b] mb-3">Bill Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between font-medium text-[#857c6e]"><span>Item Total</span><span>₹{totalPrice}</span></div>
                          <div className="flex justify-between font-medium text-[#857c6e]"><span>Taxes & Fees (5%)</span><span>₹{Math.round(totalPrice * 0.05)}</span></div>
                          <div className="border-t border-dashed border-[#e0d9ce] my-2 pt-3 flex justify-between font-black text-lg text-[#0f0e0b]">
                            <span>Grand Total</span>
                            <span>₹{totalPrice + Math.round(totalPrice * 0.05)}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center p-6 pb-20 space-y-4">
                       <motion.div 
                         initial={{ scale: 0 }} 
                         animate={{ scale: 1 }} 
                         transition={{ type: "spring", damping: 15, stiffness: 200 }}
                         className="w-24 h-24 bg-[#e8f2eb] text-[#3a6348] rounded-full flex items-center justify-center mb-2 shadow-[0_4px_30px_rgba(58,99,72,0.2)]"
                       >
                         <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                           <motion.path 
                             initial={{ pathLength: 0, opacity: 0 }}
                             animate={{ pathLength: 1, opacity: 1 }}
                             transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                             d="M20 6L9 17l-5-5" 
                           />
                         </svg>
                       </motion.div>
                       <h2 className="text-3xl font-display font-bold text-[#0f0e0b] mt-1">Order Placed{guestName ? `, ${guestName.split(' ')[0]}` : ''}!</h2>
                       <p className="font-bold text-[#e8720c] bg-[#fef0e4] px-4 py-1.5 rounded-md text-sm inline-block tracking-wider">
                         ORDER #{orderNo}
                       </p>
                       <div className="w-full bg-white rounded-2xl p-5 shadow-sm border border-[#e0d9ce] mt-2 text-left relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-full h-1 bg-[#f5f0e8]">
                           <motion.div 
                             className="h-full bg-[#e8720c]"
                             initial={{ width: "0%" }}
                             animate={{ width: orderStatus === 0 ? "33%" : orderStatus === 1 ? "66%" : "100%" }}
                             transition={{ duration: 0.5 }}
                           />
                         </div>
                         <p className="text-[10px] font-bold text-[#857c6e] uppercase tracking-wider mb-5 mt-1">Live Status</p>
                         
                         <div className="relative border-l-2 border-[#f5f0e8] ml-2 space-y-6 pb-2">
                           <div className="relative pl-6">
                             <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full transition-colors duration-500 ${orderStatus >= 0 ? 'bg-[#e8720c] shadow-[0_0_0_4px_rgba(232,114,12,0.2)]' : 'bg-[#e0d9ce]'}`} />
                             <h4 className={`font-bold text-sm ${orderStatus >= 0 ? 'text-[#0f0e0b]' : 'text-[#857c6e]'}`}>Sent to Kitchen</h4>
                             <p className="text-[11px] font-medium text-[#857c6e] mt-0.5">Order received by Chef.</p>
                           </div>
                           <div className="relative pl-6">
                             <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full transition-colors duration-500 ${orderStatus >= 1 ? 'bg-[#e8720c] shadow-[0_0_0_4px_rgba(232,114,12,0.2)]' : 'bg-[#e0d9ce]'}`} />
                             <h4 className={`font-bold text-sm transition-colors duration-500 ${orderStatus >= 1 ? 'text-[#0f0e0b]' : 'text-[#857c6e]'}`}>Preparing</h4>
                             <p className="text-[11px] font-medium text-[#857c6e] mt-0.5">Your food is being cooked.</p>
                           </div>
                           <div className="relative pl-6">
                             <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full transition-colors duration-500 ${orderStatus >= 2 ? 'bg-[#3a6348] shadow-[0_0_0_4px_rgba(58,99,72,0.2)]' : 'bg-[#e0d9ce]'}`} />
                             <h4 className={`font-bold text-sm transition-colors duration-500 ${orderStatus >= 2 ? 'text-[#0f0e0b]' : 'text-[#857c6e]'}`}>Ready to Serve</h4>
                             <p className="text-[11px] font-medium text-[#857c6e] mt-0.5">Chef has completed your order.</p>
                           </div>
                         </div>
                       </div>

                       {orderStatus === 2 && (
                         <motion.div 
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ type: "spring", stiffness: 300, damping: 20 }}
                           className="w-full bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#e0d9ce] mt-4 z-10 relative"
                         >
                           <p className="font-bold text-[#0f0e0b] mb-4 text-[15px]">Rate your experience ✨</p>
                           <div className="flex justify-center gap-2 mb-2">
                             {[1, 2, 3, 4, 5].map((star) => (
                               <button 
                                 key={star} 
                                 onClick={() => setRating(star)} 
                                 className="focus:outline-none transition-transform hover:scale-125 active:scale-90"
                               >
                                 <Star 
                                   className={`transition-colors duration-300 ${rating >= star ? "fill-[#e8720c] text-[#e8720c]" : "text-[#d4cbb8]"}`} 
                                   size={32} 
                                   strokeWidth={1.5}
                                 />
                               </button>
                             ))}
                           </div>
                           {rating > 0 && (
                             <motion.p 
                               initial={{ opacity: 0, y: 5 }} 
                               animate={{ opacity: 1, y: 0 }} 
                               className="text-xs text-[#3a6348] font-bold mt-3 bg-[#e8f2eb] inline-block px-3 py-1.5 rounded-md"
                             >
                               Thanks for your feedback! ❤️
                             </motion.p>
                           )}
                         </motion.div>
                       )}

                       <button onClick={() => { setCart({}); setOrderPlaced(false); setShowCart(false); setRating(0); }} className="mt-4 w-full text-[#e8720c] font-bold text-sm bg-[#fef0e4] px-6 py-3.5 rounded-xl transition-colors hover:bg-[#fde8e8] hover:shadow-sm">
                         Start New Order
                       </button>
                    </motion.div>
                  )}
                </div>

                {/* Sticky Bottom Place Order */}
                {!orderPlaced && (
                  <div className="absolute bottom-0 left-0 w-full p-4 bg-white border-t border-[#e0d9ce] shrink-0 text-center">
                    <button onClick={() => { setOrderNo(Math.floor(1000 + Math.random() * 9000)); setOrderPlaced(true); }} className="w-full bg-[#e8720c] text-white py-3.5 rounded-xl font-bold text-lg shadow-[0_4px_20px_rgba(232,114,12,0.3)] hover:bg-[#d4620a] transition-colors flex items-center justify-center gap-2">
                       Place Order • ₹{totalPrice + Math.round(totalPrice * 0.05)} <ArrowLeft size={18} className="rotate-180" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* CSS to hide scrollbar for horizontal categories list */}
        <style>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}</style>
      </div>
    </div>
  );
}
