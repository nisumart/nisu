import React, { useState, useEffect } from 'react';
import { Product, CityOption } from '../types';
import {
  ArrowLeft,
  Heart,
  ShoppingBag,
  Zap,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Phone,
  Share2,
  Clock,
  Sparkles,
  MapPin,
  ChevronRight,
  Headphones,
} from 'lucide-react';

interface ProductDetailsPageProps {
  product: Product;
  allProducts: Product[];
  isWishlisted: boolean;
  isInCart: boolean;
  selectedCity: CityOption;
  onBack: () => void;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  product,
  allProducts,
  isWishlisted,
  isInCart,
  selectedCity,
  onBack,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onSelectProduct,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setQuantity(1);
    setJustAdded(false);
  }, [product.id]);

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const savingsAmount =
    product.originalPrice && product.originalPrice > product.price
      ? product.originalPrice - product.price
      : null;

  // Filter similar products (excluding current one)
  const similarProducts = allProducts
    .filter((p) => p.id !== product.id && p.isAvailable !== false)
    .slice(0, 4);

  const handleQtyChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + delta)));
  };

  const handleAddCartClick = () => {
    onAddToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          text: `Check out ${product.name} on NISUMART!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-12 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Back Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-14 sm:top-[60px] z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-emerald-700 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600" />
            <span>Back to Products</span>
          </button>

          {/* Breadcrumb info */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 truncate max-w-md">
            <span>Home</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="capitalize">{product.thumbnailTag || 'Catalog'}</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="font-semibold text-slate-800 truncate">{product.name}</span>
          </div>

          {/* Action icon for share & wishlist */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
              title="Share product"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {copiedLink && (
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Link Copied!
              </span>
            )}
            <button
              onClick={() => onToggleWishlist(product)}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                isWishlisted
                  ? 'border-rose-200 bg-rose-50 text-rose-600'
                  : 'border-slate-200 hover:bg-slate-100 text-slate-600'
              }`}
              title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Product Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 lg:p-8">
            {/* Left Column: Product Image Gallery */}
            <div className="lg:col-span-5 space-y-3">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                  }}
                />

                {/* Badges on image */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded-md font-bold tracking-wider">
                    {product.productId}
                  </span>
                  {discountPercent && (
                    <span className="bg-rose-600 text-white text-xs font-black px-2 py-0.5 rounded-md shadow-xs">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                {/* Floating Wishlist Button */}
                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs transition shadow-md cursor-pointer ${
                    isWishlisted
                      ? 'bg-rose-50 text-rose-600 ring-2 ring-rose-300'
                      : 'bg-white/90 text-slate-500 hover:text-rose-600 hover:bg-white'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>

              {/* Trust Badges Bar */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px] text-slate-600">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-800">100% Genuine</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center gap-1">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-800">Express Delivery</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center gap-1">
                  <RotateCcw className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-800">Easy Returns</span>
                </div>
              </div>
            </div>

            {/* Right Column: Product Details & Purchase Actions */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                {/* Title & Product ID */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      NISUMART Verified
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Item ID: {product.productId}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-snug">
                    {product.name}
                  </h1>
                </div>

                {/* Price & MRP Row */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      ₹{product.price}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-base sm:text-lg text-slate-400 line-through">
                        MRP: ₹{product.originalPrice}
                      </span>
                    )}
                    {discountPercent && (
                      <span className="text-xs sm:text-sm font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>
                  {savingsAmount && (
                    <p className="text-xs font-bold text-emerald-700">
                      You save ₹{savingsAmount} on this purchase!
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500">
                    Inclusive of all local taxes. Free doorstep express shipping to {selectedCity}.
                  </p>
                </div>

                {/* Payment Offers Highlight Box */}
                <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Exclusive NISUMART Payment Benefits</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-emerald-950">
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-200/60">
                      <div className="font-bold text-emerald-800">⚡ Online / UPI Discount</div>
                      <p className="mt-0.5">
                        Pay only{' '}
                        <strong className="text-emerald-900">
                          ₹{Math.max(0, product.price - 50)}
                        </strong>{' '}
                        (Flat ₹50 OFF at checkout)
                      </p>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-200/60">
                      <div className="font-bold text-slate-800">📦 Cash on Delivery (COD)</div>
                      <p className="mt-0.5">
                        Pay ₹{product.price + 50} cash upon delivery at your door (+₹50 fee)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stock Status & MP Delivery Guarantee */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl border border-slate-200 bg-white text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <span className="font-bold text-slate-900">
                        {product.isAvailable ? 'In Stock & Ready to Dispatch' : 'Temporarily Out of Stock'}
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Ships directly from Madhya Pradesh Central Fulfillment Center
                      </p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md self-start sm:self-center">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Delivering to {selectedCity}, MP</span>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs font-bold text-slate-700">Quantity:</span>
                  <div className="flex items-center border border-slate-300 rounded-lg bg-slate-50 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleQtyChange(-1)}
                      disabled={quantity <= 1}
                      className="px-3 py-1.5 text-slate-700 hover:bg-slate-200 font-extrabold text-sm transition cursor-pointer disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold text-slate-900 min-w-8 text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQtyChange(1)}
                      disabled={quantity >= 10}
                      className="px-3 py-1.5 text-slate-700 hover:bg-slate-200 font-extrabold text-sm transition cursor-pointer disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-slate-500">
                    Total: <strong className="text-slate-900 font-extrabold">₹{product.price * quantity}</strong>
                  </span>
                </div>

                {/* CTA Action Buttons (Add to Cart & Buy Now) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleAddCartClick}
                    className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs ${
                      justAdded || isInCart
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                        : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Added to Cart ({quantity})!</span>
                      </>
                    ) : isInCart ? (
                      <>
                        <ShoppingBag className="w-4 h-4 text-emerald-600" />
                        <span>In Cart · Add More</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onBuyNow(product, quantity)}
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-white text-white" />
                    <span>Buy Now · ₹{product.price * quantity}</span>
                  </button>
                </div>
              </div>

              {/* Customer Support Helpline Bar */}
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Have questions before ordering?</span>
                </div>
                <a
                  href="tel:7772809503"
                  className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>7772809503</span>
                </a>
              </div>
            </div>
          </div>

          {/* Product Overview & Full Description Section */}
          <div className="border-t border-slate-200 p-4 sm:p-6 lg:p-8 bg-slate-50/50 space-y-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                Product Description
              </h2>
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-slate-200">
                {product.description ||
                  'Premium authentic quality product carefully curated and verified for NISUMART customers across Madhya Pradesh.'}
              </div>
            </div>

            {/* Product Specifications Table */}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                Product Specifications
              </h2>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-bold text-slate-600 bg-slate-50 w-1/3 sm:w-1/4">
                        Product Code / ID
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">{product.productId}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-bold text-slate-600 bg-slate-50">Brand / Merchant</td>
                      <td className="p-3 text-slate-800">NISUMART Originals (India)</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-bold text-slate-600 bg-slate-50">Category / Section</td>
                      <td className="p-3 text-slate-800 capitalize">
                        {product.thumbnailTag ? product.thumbnailTag.replace(/_/g, ' ') : 'General Merchandise'}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-bold text-slate-600 bg-slate-50">Stock Availability</td>
                      <td className="p-3 text-emerald-700 font-bold">
                        {product.isAvailable ? 'In Stock (Ready to Ship)' : 'Out of Stock'}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-bold text-slate-600 bg-slate-50">Eligible Cities</td>
                      <td className="p-3 text-slate-800 font-medium">
                        Dewas, Hatpipliya, Bagli, Indore (Madhya Pradesh)
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-bold text-slate-600 bg-slate-50">Payment Modes</td>
                      <td className="p-3 text-slate-800">
                        Online UPI / QR (Flat ₹50 OFF), Cash on Delivery (+₹50), 3D Secure Card
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-600 bg-slate-50">Support Helpline</td>
                      <td className="p-3 text-slate-800">
                        Phone: <a href="tel:7772809503" className="text-emerald-700 font-bold underline">7772809503</a> · Email: nishaldamor03@gmail.com
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Similar / Related Products Section */}
        {similarProducts.length > 0 && (
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                You May Also Like
              </h2>
              <button
                onClick={onBack}
                className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                View Catalog →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
              {similarProducts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectProduct(item)}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                  <div className="aspect-square bg-slate-100 overflow-hidden relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                      {item.productId}
                    </span>
                  </div>
                  <div className="p-2.5 flex flex-col justify-between flex-1 gap-1.5">
                    <h3 className="text-xs font-semibold text-slate-800 line-clamp-2 leading-tight">
                      {item.name}
                    </h3>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-sm font-extrabold text-slate-900">₹{item.price}</span>
                      {item.originalPrice && (
                        <span className="text-[10px] text-slate-400 line-through">
                          ₹{item.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar for Mobile Viewports */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 p-3 shadow-lg md:hidden flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] text-slate-400">Total Price</div>
          <div className="text-base font-black text-slate-900 leading-tight">
            ₹{product.price * quantity}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <button
            onClick={handleAddCartClick}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{justAdded ? 'Added' : 'Cart'}</span>
          </button>

          <button
            onClick={() => onBuyNow(product, quantity)}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md transition flex items-center gap-1 active:scale-95 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-white text-white" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
