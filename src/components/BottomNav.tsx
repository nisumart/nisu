import React from 'react';
import { Home, Grid, Heart, ShoppingBag, Package } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'products' | 'wishlist' | 'cart' | 'orders';
  onSelectTab: (tab: 'home' | 'products' | 'wishlist' | 'cart' | 'orders') => void;
  wishlistCount: number;
  cartCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  wishlistCount,
  cartCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 py-1.5 px-3 flex items-center justify-around shadow-lg md:hidden">
      {/* 1. Home */}
      <button
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition cursor-pointer ${
          activeTab === 'home' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[10px] mt-0.5">Home</span>
      </button>

      {/* 2. Products */}
      <button
        onClick={() => onSelectTab('products')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition cursor-pointer ${
          activeTab === 'products' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Grid className={`w-5 h-5 ${activeTab === 'products' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[10px] mt-0.5">Products</span>
      </button>

      {/* 3. Wishlist */}
      <button
        onClick={() => onSelectTab('wishlist')}
        className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-lg transition cursor-pointer ${
          activeTab === 'wishlist' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Heart className={`w-5 h-5 ${activeTab === 'wishlist' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        {wishlistCount > 0 && (
          <span className="absolute top-0 right-1.5 bg-rose-500 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
            {wishlistCount}
          </span>
        )}
        <span className="text-[10px] mt-0.5">Wishlist</span>
      </button>

      {/* 4. Cart */}
      <button
        onClick={() => onSelectTab('cart')}
        className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-lg transition cursor-pointer ${
          activeTab === 'cart' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <ShoppingBag className={`w-5 h-5 ${activeTab === 'cart' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        {cartCount > 0 && (
          <span className="absolute top-0 right-1.5 bg-emerald-600 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
            {cartCount}
          </span>
        )}
        <span className="text-[10px] mt-0.5">Cart</span>
      </button>

      {/* 5. Orders */}
      <button
        onClick={() => onSelectTab('orders')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition cursor-pointer ${
          activeTab === 'orders' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Package className={`w-5 h-5 ${activeTab === 'orders' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[10px] mt-0.5">Orders</span>
      </button>
    </nav>
  );
};
