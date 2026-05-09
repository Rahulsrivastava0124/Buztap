import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import useSEO from "../hooks/useSEO";

export default function RestaurantSearch() {
  useSEO({
    title: "Restaurant Search",
    description: "Search nearby restaurants, cuisines, and menu items.",
    keywords: "restaurant search, cuisine search",
    url: "/search",
    robots: "noindex, nofollow, noarchive, nosnippet",
  });

  return (
    <div className="min-h-screen bg-paper font-body">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/demo"
            className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center border border-border text-ink"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold text-ink">Restaurant Search</h1>
          <div className="w-11 h-11 rounded-full bg-white shadow-md border border-border flex items-center justify-center text-ink">
            <Search size={20} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-cream flex items-center justify-center text-muted">
              <Search size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-ink font-semibold">
                Find your next meal
              </p>
              <p className="text-xs text-muted">
                Search nearby restaurants, cuisines, and menu items.
              </p>
            </div>
          </div>
          <input
            type="search"
            placeholder="Search restaurants"
            className="w-full rounded-3xl border border-border bg-paper px-4 py-3 text-sm text-ink focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron/20"
          />
        </div>

        <div className="mt-6 text-center text-sm text-muted">
          <p>Search opens a separate page for restaurant discovery.</p>
        </div>
      </div>
    </div>
  );
}
