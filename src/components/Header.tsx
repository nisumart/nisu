import React, { useState } from 'react';
import { Search, Heart, ShoppingBag, MapPin, X, Shield, ChevronDown, User, Phone, LogOut } from 'lucide-react';
import { CityOption, Customer } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  wishlistCount: number;
  cartCount: number;
  onOpenWishlist: () => void;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: () => void;
  customer: Customer | null;
  onLogoutCustomer: () => void;
  selectedCity: CityOption;
  onSelectCity: (city: CityOption) => void;
  onLogoClick: () => void;
}

const CITIES: CityOption[] = ['Dewas', 'Hatpipliya', 'Bagli', 'Indore'];

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  wishlistCount,
  cartCount,
  onOpenWishlist,
  onOpenCart,
  onOpenAdmin,
  onOpenAuth,
  customer,
  onLogoutCustomer,
  selectedCity,
  onSelectCity,
  onLogoClick,
}) => {
  const [showCityPicker, setShowCityPicker] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Location, Customer Support & Delivery Bar */}
      <div className="bg-slate-900 text-slate-100 px-3 py-1.5 text-xs flex items-center justify-between gap-2">
        {/* Delivery to city */}
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-slate-300">Deliver to:</span>
          <button
            onClick={() => setShowCityPicker(true)}
            className="font-bold text-white hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{selectedCity}, MP</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Customer Support Info (Tappable phone) & Admin link */}
        <div className="flex items-center gap-2 sm:gap-3 text-[11px] shrink-0">
          <div className="flex items-center gap-1 text-slate-300">
            <span className="hidden sm:inline">Support:</span>
            <a
              href="tel:7772809503"
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 underline"
              title="Call Customer Support"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>7772809503</span>
            </a>
          </div>

          <button
            onClick={onOpenAdmin}
            title="Website Owner & Admin Panel"
            className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer"
          >
            <Shield className="w-3 h-3 text-amber-400" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-1.5 text-left group cursor-pointer focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-lg tracking-wider shadow-sm group-hover:bg-emerald-700 transition">
            N
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1 leading-none">
              <span>NISU</span>
              <span className="text-emerald-600">MART</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider leading-none mt-0.5">
              Madhya Pradesh
            </p>
          </div>
        </button>

        {/* Search Bar - Desktop and Tablet */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4 relative">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by product name or ID (e.g. NISU-101)..."
              className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 text-sm pl-10 pr-9 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Customer Profile / Login */}
          {customer ? (
            <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg text-xs">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-bold text-slate-800 max-w-[80px] sm:max-w-[120px] truncate">
                {customer.name}
              </span>
              <button
                onClick={onLogoutCustomer}
                className="text-slate-400 hover:text-rose-600 p-0.5 ml-0.5 cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-emerald-700 text-xs font-semibold transition cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Login</span>
            </button>
          )}

          {/* Wishlist Button */}
          <button
            onClick={onOpenWishlist}
            aria-label="Wishlist"
            className="relative p-2 text-slate-700 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition cursor-pointer"
          >
            <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            aria-label="Cart"
            className="relative p-2 text-slate-700 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar (Always visible on mobile below header row) */}
      <div className="md:hidden px-3 pb-2.5">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search product name or ID (e.g. NISU-101)..."
            className="w-full bg-slate-100 focus:bg-white text-slate-900 text-xs pl-9 pr-8 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* City Picker Modal */}
      {showCityPicker && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Select Your Delivery City</h3>
              </div>
              <button
                onClick={() => setShowCityPicker(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2 mb-3">
              NISUMART provides fast doorstep delivery in select cities of Madhya Pradesh:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onSelectCity(c);
                    setShowCityPicker(false);
                  }}
                  className={`px-3 py-2.5 rounded-lg text-xs font-semibold text-left border transition cursor-pointer ${
                    selectedCity === c
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{c}</span>
                    {selectedCity === c && <span className="text-[10px] text-emerald-600 font-bold">✓</span>}
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal mt-0.5">Madhya Pradesh</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
