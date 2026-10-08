import React from 'react';
import { Product } from '../types';
import { X, Heart, ShoppingBag, Zap, ShieldCheck, MapPin, Truck, Check } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isWishlisted: boolean;
  isInCart: boolean;
  onClose: () => void;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isWishlisted,
  isInCart,
  onClose,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
}) => {
  if (!product) return null;

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-slate-100 bg-slate-50">
          <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
            {product.productId}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleWishlist(product)}
              className={`p-1.5 rounded-full transition cursor-pointer ${
                isWishlisted
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-white text-slate-500 hover:text-rose-600 border border-slate-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Image */}
          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
              }}
            />
            {discountPercent && (
              <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-black px-2 py-1 rounded shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Title & Pricing */}
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {product.name}
            </h2>

            <div className="mt-2 flex items-baseline gap-2.5">
              <span className="text-2xl font-black text-slate-900">₹{product.price}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-slate-400 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
              {discountPercent && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Save ₹{product.originalPrice! - product.price}
                </span>
              )}
            </div>
          </div>

          {/* Payment Offers Highlight */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs space-y-1.5 text-emerald-950">
            <div className="font-bold flex items-center gap-1.5 text-emerald-800">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>NISUMART Special Pricing</span>
            </div>
            <p className="text-[11px] text-emerald-800">
              • <strong>Prepaid / Online UPI:</strong> Pay only{' '}
              <span className="font-bold text-emerald-900">₹{Math.max(0, product.price - 50)}</span> (Flat ₹50 OFF)
            </p>
            <p className="text-[11px] text-emerald-800">
              • <strong>Cash on Delivery (COD):</strong> Total{' '}
              <span className="font-bold text-emerald-900">₹{product.price + 50}</span> (+₹50 doorstep handling)
            </p>
          </div>

          {/* Delivery Assurance */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Madhya Pradesh Delivery Guarantee</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Express delivery active across <strong>Dewas, Hatpipliya, Bagli, and Indore</strong>. Dispatched directly from regional warehouse.
            </p>
          </div>

          {/* Product Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Product Overview
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {product.description || 'High quality original product curated for NISUMART customers.'}
            </p>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center gap-2.5">
          <button
            onClick={() => onAddToCart(product)}
            className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              isInCart
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800'
            }`}
          >
            {isInCart ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Added to Cart</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              onClose();
              onBuyNow(product);
            }}
            className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-white text-white" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
