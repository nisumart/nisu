import React from 'react';
import { Product } from '../types';
import { Heart, ShoppingBag, Zap, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  isInCart: boolean;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  isInCart,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onViewDetails,
}) => {
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <div
      onClick={() => onViewDetails(product)}
      className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between cursor-pointer relative"
    >
      {/* Product Image Area */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Product ID Pill */}
        <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-1.5 py-0.5 rounded tracking-wider">
          {product.productId}
        </span>

        {/* Wishlist Heart Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-xs transition shadow-xs cursor-pointer ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/90 text-slate-500 hover:text-rose-600 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Discount Badge */}
        {discountPercent && discountPercent > 0 && (
          <span className="absolute bottom-2 left-2 bg-rose-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Product Details Area */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-1 justify-between gap-2">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 leading-tight group-hover:text-emerald-700 transition">
            {product.name}
          </h3>

          {/* Pricing Row */}
          <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-extrabold text-slate-900">
              ₹{product.price}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[11px] sm:text-xs text-slate-400 line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {/* Quick Cart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            title={isInCart ? 'Added to Cart' : 'Add to Cart'}
            className={`col-span-2 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center transition cursor-pointer ${
              isInCart
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            {isInCart ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <ShoppingBag className="w-3.5 h-3.5" />
            )}
            <span className="ml-1 text-[11px] hidden sm:inline">
              {isInCart ? 'In Cart' : 'Cart'}
            </span>
          </button>

          {/* Buy Now Button (High Prominence) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBuyNow(product);
            }}
            className="col-span-3 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-white text-white" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
