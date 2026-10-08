import React from 'react';
import { Product } from '../types';
import { X, Heart, Trash2, Zap, ShoppingBag } from 'lucide-react';

interface WishlistModalProps {
  wishlistProducts: Product[];
  onClose: () => void;
  onRemove: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  wishlistProducts,
  onClose,
  onRemove,
  onBuyNow,
  onAddToCart,
  onViewProduct,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h3 className="font-bold text-slate-900 text-sm">
              My Wishlist ({wishlistProducts.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {wishlistProducts.length > 0 ? (
            wishlistProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs"
              >
                <div
                  onClick={() => {
                    if (onViewProduct) {
                      onClose();
                      onViewProduct(p);
                    }
                  }}
                  className="flex items-center gap-3 min-w-0 cursor-pointer group/item"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-14 h-14 rounded-lg object-cover bg-slate-100 shrink-0 group-hover/item:opacity-90 transition"
                  />
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-slate-800 truncate group-hover/item:text-emerald-700 transition">
                      {p.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">ID: {p.productId}</p>
                    <div className="text-sm font-extrabold text-slate-900 mt-1">₹{p.price}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      onClose();
                      onBuyNow(p);
                    }}
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Buy</span>
                  </button>
                  <button
                    onClick={() => onRemove(p)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <Heart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">Your wishlist is empty</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tap the heart on any product to save it for later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
