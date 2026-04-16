import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";

export default function RestaurantSearch() {
  return (
    <div className="min-h-screen bg-[#faf7f2] font-body">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/demo"
            className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center border border-[#e0d9ce] text-[#0f0e0b]"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold text-[#0f0e0b]">
            Restaurant Search
          </h1>
          <div className="w-11 h-11 rounded-full bg-white shadow-md border border-[#e0d9ce] flex items-center justify-center text-[#0f0e0b]">
            <Search size={20} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#e0d9ce]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-[#f5f0e8] flex items-center justify-center text-[#857c6e]">
              <Search size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-[#0f0e0b] font-semibold">
                Find your next meal
              </p>
              <p className="text-xs text-[#857c6e]">
                Search nearby restaurants, cuisines, and menu items.
              </p>
            </div>
          </div>
          <input
            type="search"
            placeholder="Search restaurants"
            className="w-full rounded-3xl border border-[#e0d9ce] bg-[#faf7f2] px-4 py-3 text-sm text-[#0f0e0b] focus:outline-none focus:border-[#e8720c] focus:ring-1 focus:ring-[#e8720c]/20"
          />
        </div>

        <div className="mt-6 text-center text-sm text-[#857c6e]">
          <p>Search opens a separate page for restaurant discovery.</p>
        </div>
      </div>
    </div>
  );
}
