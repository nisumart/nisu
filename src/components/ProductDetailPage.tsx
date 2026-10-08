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
  Sparkles,
  MapPin,
  Share2,
  ChevronRight,
  Maximize2,
  X,
  Plus,
  Minus,
  Star,
  Phone,
  Mail,
  CheckCircle2,
} from 'lucide-react';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  isWishlisted: boolean;
  isInCart: boolean;
  selectedCity: CityOption;
  onSelectCity: (city: CityOption) => void;
  onBack: () => void;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onBuyNow: (product: Product, quantity?: number) => void;
  onSelectProduct: (product: Product) => void;
}

const CITIES: CityOption[] = ['Dewas', 'Hatpipliya', 'Bagli', 'Indore'];

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  isWishlisted,
  isInCart,
  selectedCity,
  onSelectCity,
  onBack,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onSelectProduct,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Multi-image gallery support (1 to 5 images)
  const galleryImages: string[] = (() => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      const valid = product.images.filter((img) => img && img.trim() !== '');
      if (valid.length > 0) return valid;
    }
    return product.image ? [product.image] : [];
  })();

  const [activeImage, setActiveImage] = useState<string>(galleryImages[0] || product.image);

  // Scroll to top and reset active image whenever product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setQuantity(1);
    setActiveImage(galleryImages[0] || product.image);
  }, [product.id]);

  const originalPrice =
    product.originalPrice && product.originalPrice > product.price
      ? product.originalPrice
      : Math.round(product.price * 1.3);

  const discountPercent = Math.max(
    5,
    Math.round(((originalPrice - product.price) / originalPrice) * 100)
  );

  const savingsAmount = originalPrice - product.price;

  // Handle Share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} - NISUMART`,
          text: `Check out ${product.name} on NISUMART at ₹${product.price}!`,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const handleAddToCartWithFeedback = () => {
    onAddToCart(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  // Filter related products
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-12 animate-in fade-in duration-150">
      {/* 1. Sub-Header Navigation Bar with Back Button & Breadcrumbs */}
      <div className="sticky top-[53px] sm:top-[57px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-4 py-2.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-700" />
            <span>Back to Products</span>
          </button>

          {/* Breadcrumbs for desktop */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 truncate max-w-md">
            <button
              onClick={onBack}
              className="hover:text-emerald-700 transition cursor-pointer shrink-0 font-medium"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="capitalize font-medium text-slate-600 truncate">
              {product.thumbnailTag || 'Catalog'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-900 font-semibold truncate">{product.name}</span>
          </nav>

          {/* Top Actions: Share & Wishlist */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              title="Share product"
              className="p-2 text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">
                {copiedShare ? 'Link Copied!' : 'Share'}
              </span>
            </button>

            <button
              onClick={() => onToggleWishlist(product)}
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              className={`p-2 rounded-lg border transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
                isWishlisted
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-rose-600 hover:border-slate-300'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`}
              />
              <span className="hidden sm:inline">
                {isWishlisted ? 'Wishlisted' : 'Wishlist'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Product Image Gallery & Preview (5 cols)     */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden group">
              {/* Image Box */}
              <div
                className="relative aspect-square w-full bg-slate-50 flex items-center justify-center overflow-hidden cursor-zoom-in"
                onClick={() => setShowImageZoom(true)}
              >
                <img
                  src={activeImage || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
                  }}
                />

                {/* Tap to zoom hint */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowImageZoom(true);
                  }}
                  className="absolute bottom-3 right-3 p-2 bg-slate-900/70 hover:bg-slate-900 text-white rounded-lg backdrop-blur-xs transition shadow-sm cursor-pointer"
                  title="View full image"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Badges on Image */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                <span className="bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-xs tracking-wider">
                  {discountPercent}% OFF
                </span>
                <span className="bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-mono font-semibold px-2 py-0.5 rounded shadow-xs">
                  ID: {product.productId}
                </span>
              </div>

              {/* In Stock Badge */}
              <div className="absolute top-3 right-3">
                {product.isAvailable ? (
                  <span className="bg-emerald-600/90 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-1 rounded-md shadow-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse" />
                    In Stock
                  </span>
                ) : (
                  <span className="bg-rose-600 text-white text-[11px] font-bold px-2 py-1 rounded-md shadow-xs">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery (1 to 5 images) */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                      activeImage === img
                        ? 'border-emerald-600 ring-2 ring-emerald-200 shadow-xs'
                        : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {activeImage === img && (
                      <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[9px] font-bold py-0.2 text-center">
                        Active
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Quick Guarantees Strip */}
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-slate-600 pt-1">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="font-bold text-slate-800">100% Genuine</span>
                <span className="text-[10px] text-slate-400">Quality Assured</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col items-center justify-center">
                <Truck className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="font-bold text-slate-800">Fast Shipping</span>
                <span className="text-[10px] text-slate-400">Dewas & Indore Hub</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col items-center justify-center">
                <RotateCcw className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="font-bold text-slate-800">7-Day Return</span>
                <span className="text-[10px] text-slate-400">Easy Replacement</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Product Details, Pricing, Buy Box (7 cols)  */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-5">
            {/* Title & Tag */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 flex-wrap text-xs font-semibold">
                <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200 capitalize">
                  {product.thumbnailTag || 'General Collection'}
                </span>
                <span className="text-slate-400">•</span>
                <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>4.8</span>
                  <span className="text-slate-500 font-normal text-[11px]">
                    (142+ Ratings)
                  </span>
                </div>
              </div>

              <h1 className="text-lg sm:text-2xl font-black text-slate-900 leading-tight">
                {product.name}
              </h1>

              {/* Pricing Box */}
              <div className="pt-2 pb-1 border-y border-slate-100">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    ₹{product.price}
                  </span>
                  {originalPrice > product.price && (
                    <span className="text-base sm:text-lg text-slate-400 line-through">
                      MRP: ₹{originalPrice}
                    </span>
                  )}
                  <span className="text-xs sm:text-sm font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    {discountPercent}% OFF
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-2 text-xs text-emerald-700 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>You save ₹{savingsAmount} (Inclusive of all taxes)</span>
                </div>
              </div>

              {/* NISUMART Special Payment Offers */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
                  <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Exclusive NISUMART Payment Perks</span>
                </div>
                <div className="space-y-1.5 text-xs text-emerald-900">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <div>
                      <strong>Online Payment / UPI:</strong> Pay only{' '}
                      <span className="font-extrabold text-emerald-950 text-sm">
                        ₹{Math.max(0, product.price - 50)}
                      </span>{' '}
                      (Flat ₹50 Instant Discount automatically applied at checkout)
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                    <div>
                      <strong>Cash on Delivery (COD):</strong> Total ₹{product.price + 50}{' '}
                      (+₹50 doorstep handling charge)
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock Status Notification */}
              <div className="flex items-center justify-between gap-3 text-xs pt-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Availability:</span>
                  {product.isAvailable ? (
                    <span className="font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      In Stock (Ready to Dispatch)
                    </span>
                  ) : (
                    <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Currently Out of Stock
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  SKU: {product.productId}
                </span>
              </div>

              {/* Quantity Selector */}
              <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700">Select Quantity:</span>
                  <div className="inline-flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="p-2 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-black text-sm text-slate-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      disabled={quantity >= 10}
                      className="p-2 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                      title="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {quantity > 1 && (
                  <div className="text-xs font-bold text-slate-700">
                    Subtotal:{' '}
                    <span className="text-sm font-extrabold text-emerald-700">
                      ₹{product.price * quantity}
                    </span>
                  </div>
                )}
              </div>

              {/* Primary Action Buttons: Add to Cart & Buy Now */}
              <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCartWithFeedback}
                  className={`py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border transition cursor-pointer active:scale-98 ${
                    addedAnimation || isInCart
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                      : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-2xs hover:border-slate-400'
                  }`}
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Added to Cart ({quantity})</span>
                    </>
                  ) : isInCart ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Add More to Cart ({quantity})</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-slate-600" />
                      <span>Add to Cart ({quantity})</span>
                    </>
                  )}
                </button>

                {/* Buy Now Button */}
                <button
                  type="button"
                  onClick={() => onBuyNow(product, quantity)}
                  className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-white text-white" />
                  <span>Buy Now (₹{product.price * quantity})</span>
                </button>
              </div>
            </div>

            {/* Delivery Location & Pincode Checker */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">
                    Delivering to: <span className="text-emerald-700">{selectedCity}, MP</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCityPicker(!showCityPicker)}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer"
                >
                  Change City
                </button>
              </div>

              {showCityPicker && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 animate-in fade-in duration-100">
                  {CITIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        onSelectCity(c);
                        setShowCityPicker(false);
                      }}
                      className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        selectedCity === c
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-start gap-2.5 text-xs text-slate-600 pt-1">
                <Truck className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800">
                    Express 24-48 Hours Delivery
                  </span>{' '}
                  available directly from our regional fulfillment hub across Dewas, Hatpipliya,
                  Bagli & Indore.
                </div>
              </div>
            </div>

            {/* Product Description */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-2.5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <span>Product Description</span>
              </h2>
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {product.description ||
                  'High quality genuine product curated and verified by NISUMART for our valued customers across Madhya Pradesh. Features premium materials, durable construction, and rigorous inspection before dispatch.'}
              </div>
            </div>

            {/* Specifications Section */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Product Specifications & Highlights
              </h2>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                <div className="grid grid-cols-3 p-2.5 bg-slate-50">
                  <span className="font-semibold text-slate-500">Product Code / SKU</span>
                  <span className="col-span-2 font-mono font-bold text-slate-800">
                    {product.productId}
                  </span>
                </div>
                <div className="grid grid-cols-3 p-2.5">
                  <span className="font-semibold text-slate-500">Category / Tag</span>
                  <span className="col-span-2 font-medium text-slate-800 capitalize">
                    {product.thumbnailTag || 'General Collection'}
                  </span>
                </div>
                <div className="grid grid-cols-3 p-2.5 bg-slate-50">
                  <span className="font-semibold text-slate-500">Stock Status</span>
                  <span className="col-span-2 font-semibold text-emerald-700">
                    {product.isAvailable ? 'In Stock (Ready to Ship)' : 'Out of Stock'}
                  </span>
                </div>
                <div className="grid grid-cols-3 p-2.5">
                  <span className="font-semibold text-slate-500">Fulfillment Hub</span>
                  <span className="col-span-2 text-slate-800">
                    Madhya Pradesh Central Hub (Dewas / Indore)
                  </span>
                </div>
                <div className="grid grid-cols-3 p-2.5 bg-slate-50">
                  <span className="font-semibold text-slate-500">Eligible Delivery</span>
                  <span className="col-span-2 text-slate-800">
                    Dewas, Hatpipliya, Bagli, Indore
                  </span>
                </div>
                <div className="grid grid-cols-3 p-2.5">
                  <span className="font-semibold text-slate-500">Payment Modes</span>
                  <span className="col-span-2 text-slate-800">
                    Online UPI (Flat ₹50 OFF) / Doorstep COD / Debit & Credit Card
                  </span>
                </div>
                <div className="grid grid-cols-3 p-2.5 bg-slate-50">
                  <span className="font-semibold text-slate-500">Return Policy</span>
                  <span className="col-span-2 text-slate-800">
                    7 Days Easy Replacement for damaged or defective items
                  </span>
                </div>
                <div className="grid grid-cols-3 p-2.5">
                  <span className="font-semibold text-slate-500">Authenticity</span>
                  <span className="col-span-2 text-emerald-700 font-semibold">
                    100% Quality Inspected & Certified
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Care Contact Box */}
            <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 sm:p-5 space-y-2 text-xs">
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <span>Need help with this order?</span>
              </div>
              <p className="text-slate-400 text-xs">
                Speak directly with the NISUMART support desk:
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1 font-semibold">
                <a
                  href="tel:7772809503"
                  className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call 7772809503</span>
                </a>
                <a
                  href="mailto:nishaldamor03@gmail.com"
                  className="flex items-center gap-1.5 text-slate-300 hover:text-white underline"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>nishaldamor03@gmail.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RELATED PRODUCTS SECTION                                 */}
        {/* ========================================================= */}
        {relatedProducts.length > 0 && (
          <div className="mt-10 sm:mt-14 pt-8 border-t border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  You May Also Like
                </h3>
                <p className="text-xs text-slate-500">
                  More trending items from NISUMART catalog
                </p>
              </div>
              <button
                type="button"
                onClick={onBack}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
              >
                View All Catalog
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map((p) => {
                const relDiscount =
                  p.originalPrice && p.originalPrice > p.price
                    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                    : null;
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      {relDiscount && relDiscount > 0 && (
                        <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded">
                          {relDiscount}% OFF
                        </span>
                      )}
                    </div>
                    <div className="p-2.5 space-y-1">
                      <h4 className="text-xs font-semibold text-slate-800 line-clamp-1 group-hover:text-emerald-700 transition">
                        {p.name}
                      </h4>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                          ₹{p.price}
                        </span>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <span className="text-[10px] text-slate-400 line-through">
                            ₹{p.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MOBILE STICKY BUY BAR                                     */}
      {/* ========================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2.5 shadow-lg md:hidden">
        <div className="flex items-center justify-between gap-2.5">
          {/* Price display */}
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 font-medium">Total Price:</div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-black text-slate-900">
                ₹{product.price * quantity}
              </span>
              {quantity > 1 && (
                <span className="text-[10px] text-slate-500 font-semibold">
                  ({quantity} items)
                </span>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <button
              type="button"
              onClick={handleAddToCartWithFeedback}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1 ${
                addedAnimation || isInCart
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              {addedAnimation || isInCart ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>In Cart</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Cart</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onBuyNow(product, quantity)}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-white text-white" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* IMAGE ZOOM MODAL                                          */}
      {/* ========================================================= */}
      {showImageZoom && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4"
          onClick={() => setShowImageZoom(false)}
        >
          <div className="relative max-w-3xl w-full max-h-[85vh] flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={() => setShowImageZoom(false)}
              className="absolute top-2 right-2 z-10 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={activeImage || product.image}
              alt={product.name}
              className="max-w-full max-h-[75vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Gallery switcher inside zoom modal if multiple images */}
            {galleryImages.length > 1 && (
              <div
                className="flex items-center gap-2 mt-3 overflow-x-auto p-1 bg-black/50 rounded-xl max-w-full"
                onClick={(e) => e.stopPropagation()}
              >
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                      activeImage === img
                        ? 'border-emerald-500 ring-2 ring-emerald-300'
                        : 'border-white/30 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
