import React, { useState, useEffect, useCallback } from 'react';
import {
  Product,
  CustomThumbnail,
  Banner,
  Order,
  CityOption,
  CartItem,
  PaymentSettings,
  Customer,
} from './types';
import { Header } from './components/Header';
import { CustomThumbnails } from './components/CustomThumbnails';
import { BannerSection } from './components/BannerSection';
import { ProductSection } from './components/ProductSection';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { WishlistModal } from './components/WishlistModal';
import { CartModal } from './components/CartModal';
import { CustomerOrdersModal } from './components/CustomerOrdersModal';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { BottomNav } from './components/BottomNav';
import { AdminPanel } from './components/AdminPanel';
import {
  getStoredCart,
  saveStoredCart,
  getStoredWishlist,
  saveStoredWishlist,
  getStoredRecentOrders,
  saveStoredRecentOrder,
  getStoredCity,
  saveStoredCity,
  getStoredCustomer,
  saveStoredCustomer,
} from './utils/storage';
import { ShieldCheck, Truck, Zap, Banknote, MapPin, Phone, Mail, Headphones } from 'lucide-react';

export default function App() {
  // Store Data from API
  const [products, setProducts] = useState<Product[]>([]);
  const [thumbnails, setThumbnails] = useState<CustomThumbnail[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    upiId: '7772809503@paytm',
    upiQrImage: '',
    isOnlinePaymentEnabled: true,
  });

  // Customer Authentication state
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // User Preferences & State
  const [selectedCity, setSelectedCity] = useState<CityOption>(
    (getStoredCity() as CityOption) || 'Dewas'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeThumbnailTag, setActiveThumbnailTag] = useState<string | null>(null);

  // Cart & Wishlist & Orders
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  // Modals & Navigation
  const [activeTab, setActiveTab] = useState<'home' | 'products' | 'wishlist' | 'cart' | 'orders'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<any[]>([]);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Fetch initial data
  const loadStoreData = useCallback(async () => {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setThumbnails(data.thumbnails || []);
        setBanners(data.banners || []);
        if (data.paymentSettings) {
          setPaymentSettings(data.paymentSettings);
        }
      }
    } catch (err) {
      console.error('Failed to load store data:', err);
    }
  }, []);

  useEffect(() => {
    loadStoreData();
    setCart(getStoredCart());
    setWishlistIds(getStoredWishlist());
    setRecentOrders(getStoredRecentOrders());
    setCurrentCustomer(getStoredCustomer());
  }, [loadStoreData]);

  // Sync state to local storage
  const handleCityChange = (city: CityOption) => {
    setSelectedCity(city);
    saveStoredCity(city);
  };

  const handleCustomerLogin = (customer: Customer) => {
    setCurrentCustomer(customer);
    saveStoredCustomer(customer);
  };

  const handleCustomerLogout = () => {
    setCurrentCustomer(null);
    saveStoredCustomer(null);
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) => {
      const updated = prev.includes(product.id)
        ? prev.filter((id) => id !== product.id)
        : [...prev, product.id];
      saveStoredWishlist(updated);
      return updated;
    });
  };

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      let updated: CartItem[];
      if (existing) {
        updated = prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + (quantity || 1) }
            : item
        );
      } else {
        updated = [...prev, { product, quantity: quantity || 1 }];
      }
      saveStoredCart(updated);
      return updated;
    });
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      const updated = prev
        .map((item) => {
          if (item.product.id === productId || item.product.productId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
      saveStoredCart(updated);
      return updated;
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => {
      const updated = prev.filter(
        (item) => item.product.id !== productId && item.product.productId !== productId
      );
      saveStoredCart(updated);
      return updated;
    });
  };

  // Buy Now Flow (Single product direct purchase with quantity)
  const handleBuyNowSingle = (product: Product, quantity: number = 1) => {
    setCheckoutItems([
      {
        productId: product.productId,
        productName: product.name,
        price: product.price,
        quantity: quantity || 1,
        image: product.image,
      },
    ]);
    setIsCheckoutOpen(true);
  };

  // Open full Product Details Page
  const handleOpenProductDetail = (product: Product) => {
    setSelectedProduct(product);
    try {
      window.history.pushState({ productId: product.id }, '', `#product-${product.productId || product.id}`);
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Back from Product Details Page
  const handleBackFromProduct = () => {
    setSelectedProduct(null);
    if (window.location.hash.startsWith('#product-')) {
      try {
        window.history.back();
      } catch {
        // ignore
      }
    }
  };

  // Listen to browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      if (selectedProduct) {
        setSelectedProduct(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedProduct]);

  // Proceed to checkout with all cart items
  const handleCheckoutFromCart = () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);
    setCheckoutItems(
      cart.map((item) => ({
        productId: item.product.productId,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
      }))
    );
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    setIsCheckoutOpen(false);
    setConfirmedOrder(order);
    saveStoredRecentOrder(order);
    setRecentOrders((prev) => [order, ...prev]);

    // Clear cart if items matched
    setCart([]);
    saveStoredCart([]);
  };

  // Bottom Nav Action Handler
  const handleNavTab = (tab: 'home' | 'products' | 'wishlist' | 'cart' | 'orders') => {
    setActiveTab(tab);
    if (tab === 'home') {
      setSelectedProduct(null);
      setActiveThumbnailTag(null);
      setSearchQuery('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'products') {
      setSelectedProduct(null);
      const el = document.getElementById('products-catalog');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'wishlist') {
      setIsWishlistOpen(true);
    } else if (tab === 'cart') {
      setIsCartOpen(true);
    } else if (tab === 'orders') {
      setIsOrdersOpen(true);
    }
  };

  const cartProductIds = cart.map((c) => c.product.id);
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 pb-16 md:pb-6">
      {/* 1. Header with live search, support link & customer auth */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (selectedProduct) {
            setSelectedProduct(null);
          }
          if (q.trim()) {
            // Instantly jump to catalog when searching
            const el = document.getElementById('products-catalog');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}
        wishlistCount={wishlistIds.length}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        customer={currentCustomer}
        onLogoutCustomer={handleCustomerLogout}
        selectedCity={selectedCity}
        onSelectCity={handleCityChange}
        onLogoClick={() => {
          setSelectedProduct(null);
          setActiveThumbnailTag(null);
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <main className="flex-1">
        {selectedProduct ? (
          <ProductDetailPage
            product={selectedProduct}
            allProducts={products}
            isWishlisted={wishlistIds.includes(selectedProduct.id)}
            isInCart={cartProductIds.includes(selectedProduct.id)}
            selectedCity={selectedCity}
            onSelectCity={handleCityChange}
            onBack={handleBackFromProduct}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNowSingle}
            onSelectProduct={handleOpenProductDetail}
          />
        ) : (
          <>
            {/* Value Proposition Highlights Strip */}
            <section className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white py-2 px-3 text-xs shadow-inner">
              <div className="max-w-7xl mx-auto flex items-center justify-around gap-2 text-center overflow-x-auto text-[11px] sm:text-xs">
                <div className="flex items-center gap-1.5 shrink-0 font-medium">
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Flat ₹50 OFF on Online Payment</span>
                </div>
                <span className="text-emerald-300/60 hidden sm:inline">|</span>
                <div className="flex items-center gap-1.5 shrink-0 font-medium">
                  <Banknote className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Doorstep COD Available</span>
                </div>
                <span className="text-emerald-300/60 hidden sm:inline">|</span>
                <div className="flex items-center gap-1.5 shrink-0 font-medium">
                  <Truck className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Express Delivery in Dewas, Hatpipliya, Bagli & Indore</span>
                </div>
              </div>
            </section>

            {/* 2. Custom Image / Thumbnail Section (NOT fixed categories, fully customizable by admin) */}
            <CustomThumbnails
              thumbnails={thumbnails}
              activeTag={activeThumbnailTag}
              onSelectTag={(tag) => {
                setActiveThumbnailTag(tag);
                setSearchQuery('');
                const el = document.getElementById('products-catalog');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            />

            {/* 3. Promotional Banners (Auto-cycling, customizable) */}
            {!searchQuery && (
              <BannerSection
                banners={banners}
                onBannerClick={(b) => {
                  if (b.tag && b.tag !== 'all') {
                    setActiveThumbnailTag(b.tag);
                  }
                  const el = document.getElementById('products-catalog');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              />
            )}

            {/* 4. Products Section (Responsive Two-Column Mobile Grid) */}
            <ProductSection
              products={products}
              thumbnails={thumbnails}
              activeThumbnailTag={activeThumbnailTag}
              onClearThumbnailTag={() => setActiveThumbnailTag(null)}
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
              wishlistIds={wishlistIds}
              cartProductIds={cartProductIds}
              onToggleWishlist={handleToggleWishlist}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNowSingle}
              onViewDetails={handleOpenProductDetail}
            />
          </>
        )}
      </main>

      {/* Footer with Customer Support */}
      <footer className="bg-slate-900 text-slate-300 pt-8 pb-12 sm:pb-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-1.5 text-white font-extrabold text-base tracking-tight mb-2">
              <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center text-xs">
                N
              </div>
              <span>NISUMART</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Your trusted local marketplace delivering quality daily essentials, fashion, gadgets and home products directly across Madhya Pradesh.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              <span>Active in: Dewas · Hatpipliya · Bagli · Indore</span>
            </div>
          </div>

          {/* Customer Support Information (Requirement 8) */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Headphones className="w-4 h-4 text-emerald-400" />
              <span>Customer Support</span>
            </h4>
            <div className="space-y-2 text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a
                  href="tel:7772809503"
                  className="text-white hover:text-emerald-400 font-bold text-sm underline"
                >
                  7772809503
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a
                  href="mailto:nishaldamor03@gmail.com"
                  className="text-slate-300 hover:text-white underline text-xs"
                >
                  nishaldamor03@gmail.com
                </a>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Mon - Sun: 9:00 AM to 9:00 PM IST (Madhya Pradesh Delivery Hub)
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
              Payment & Security
            </h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li>• Cash on Delivery (+₹50 doorstep fee)</li>
              <li>• Online UPI / QR (Flat ₹50 Instant Discount)</li>
              <li>• 3D-Secure Encrypted Card Payment Gateway</li>
              <li>• Order notices to nishaldamor03@gmail.com</li>
            </ul>
            <div className="mt-3">
              <button
                onClick={() => setIsAdminOpen(true)}
                className="text-slate-400 hover:text-white underline text-xs cursor-pointer flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Store Owner & Admin Portal</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-8 pt-4 border-t border-slate-800/80 text-center text-slate-500 text-[11px]">
          © {new Date().getFullYear()} NISUMART Madhya Pradesh. All rights reserved.
        </div>
      </footer>

      {/* 6. Checkout Modal (New Order Page Flow) */}
      {isCheckoutOpen && (
        <CheckoutModal
          items={checkoutItems}
          defaultCity={selectedCity}
          paymentSettings={paymentSettings}
          currentCustomer={currentCustomer}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderSuccess={handleOrderSuccess}
        />
      )}

      {/* 7. Order Confirmation Modal */}
      {confirmedOrder && (
        <OrderConfirmationModal
          order={confirmedOrder}
          paymentSettings={paymentSettings}
          onClose={() => setConfirmedOrder(null)}
          onViewOrders={() => {
            setConfirmedOrder(null);
            setIsOrdersOpen(true);
          }}
        />
      )}

      {/* 8. Wishlist Modal */}
      {isWishlistOpen && (
        <WishlistModal
          wishlistProducts={wishlistProducts}
          onClose={() => setIsWishlistOpen(false)}
          onRemove={handleToggleWishlist}
          onBuyNow={(prod) => {
            setIsWishlistOpen(false);
            handleBuyNowSingle(prod);
          }}
          onAddToCart={handleAddToCart}
          onViewProduct={handleOpenProductDetail}
        />
      )}

      {/* 9. Cart Modal */}
      {isCartOpen && (
        <CartModal
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
          onProceedToCheckout={handleCheckoutFromCart}
        />
      )}

      {/* 10. Orders Tracking Modal */}
      {isOrdersOpen && (
        <CustomerOrdersModal
          recentOrders={recentOrders}
          onClose={() => setIsOrdersOpen(false)}
        />
      )}

      {/* 11. Customer Login / Signup Modal */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleCustomerLogin}
      />

      {/* 12. Admin Panel */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        thumbnails={thumbnails}
        banners={banners}
        paymentSettings={paymentSettings}
        onDataRefresh={loadStoreData}
      />

      {/* 13. Bottom Navigation (Mobile) */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={handleNavTab}
        wishlistCount={wishlistIds.length}
        cartCount={cart.reduce((sum, it) => sum + it.quantity, 0)}
      />
    </div>
  );
}
