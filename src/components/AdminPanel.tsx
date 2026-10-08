import React, { useState, useEffect } from 'react';
import { Product, CustomThumbnail, Banner, Order, PaymentSettings } from '../types';
import {
  X,
  Lock,
  Package,
  Layers,
  Image as ImageIcon,
  ShoppingBag,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Mail,
  CheckCircle,
  AlertCircle,
  Copy,
  Upload,
  RefreshCw,
  Send,
  CreditCard,
  QrCode,
  ShieldCheck,
  Check,
  XCircle,
  Clock,
  Star,
} from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  thumbnails: CustomThumbnail[];
  banners: Banner[];
  paymentSettings: PaymentSettings;
  onDataRefresh: () => void;
}

type AdminTab = 'products' | 'thumbnails' | 'banners' | 'orders' | 'payment_settings' | 'email';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  products,
  thumbnails,
  banners,
  paymentSettings,
  onDataRefresh,
}) => {
  // Authentication states
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');

  // Orders and Outbox
  const [orders, setOrders] = useState<Order[]>([]);
  const [emailOutbox, setEmailOutbox] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Status message
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Payment settings state for editing
  const [paymentForm, setPaymentForm] = useState({
    upiId: paymentSettings?.upiId || '7772809503@paytm',
    upiQrImage: paymentSettings?.upiQrImage || '',
    isOnlinePaymentEnabled: paymentSettings?.isOnlinePaymentEnabled ?? true,
    web3formsKey: paymentSettings?.web3formsKey || '',
  });

  // Product Add/Edit Form
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [prodForm, setProdForm] = useState({
    name: '',
    productId: '',
    description: '',
    price: '',
    originalPrice: '',
    image: '',
    images: [] as string[],
    thumbnailTag: '',
    isAvailable: true,
  });

  // Thumbnail Add/Edit Form
  const [editingThumbnail, setEditingThumbnail] = useState<CustomThumbnail | null>(null);
  const [isAddingThumbnail, setIsAddingThumbnail] = useState(false);
  const [thumbForm, setThumbForm] = useState({
    title: '',
    image: '',
    tag: '',
  });

  // Banner Add/Edit Form
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    badge: '',
    image: '',
  });

  // Email test state
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (adminToken) {
      fetchAdminOrders(adminToken);
    }
  }, [adminToken]);

  useEffect(() => {
    if (paymentSettings) {
      setPaymentForm({
        upiId: paymentSettings.upiId || '7772809503@paytm',
        upiQrImage: paymentSettings.upiQrImage || '',
        isOnlinePaymentEnabled: paymentSettings.isOnlinePaymentEnabled ?? true,
        web3formsKey: paymentSettings.web3formsKey || '',
      });
    }
  }, [paymentSettings]);

  // Handle Admin Login (Strictly shows ONLY password field before auth)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      setAdminToken(data.token);
      setPasscode('');
      fetchAdminOrders(data.token);
    } catch (err: any) {
      setAuthError(err.message || 'Incorrect password');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setAdminToken(null);
    setOrders([]);
    setEmailOutbox([]);
  };

  const fetchAdminOrders = async (token = adminToken) => {
    if (!token) return;
    setIsLoadingOrders(true);
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
        setEmailOutbox(data.emailOutbox || []);
        if (data.paymentSettings) {
          setPaymentForm((prev) => ({
            ...prev,
            ...data.paymentSettings,
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const showFeedback = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('File size exceeds 8MB. Please select a smaller image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setter(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProductMultiImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentImages = prodForm.images.length > 0 ? [...prodForm.images] : (prodForm.image ? [prodForm.image] : []);
    const remainingSlots = 5 - currentImages.length;

    if (remainingSlots <= 0) {
      alert('Maximum 5 images allowed per product. Please remove an existing image before adding more.');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      alert(`Only ${remainingSlots} more image(s) could be selected (maximum 5 images per product).`);
    }

    let processedCount = 0;
    const newImages: string[] = [];

    filesToProcess.forEach((file) => {
      if (file.size > 8 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 8MB and was skipped.`);
        processedCount++;
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          newImages.push(reader.result);
        }
        processedCount++;
        if (processedCount === filesToProcess.length) {
          const combined = [...currentImages, ...newImages].slice(0, 5);
          setProdForm((prev) => ({
            ...prev,
            images: combined,
            image: combined[0] || prev.image,
          }));
        }
      };
      reader.readAsDataURL(file);
    });
    // Reset file input value so same files can be re-selected if needed
    e.target.value = '';
  };

  // ===================== PAYMENT SETTINGS =====================
  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;

    try {
      const res = await fetch('/api/admin/payment-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(paymentForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update payment settings');

      showFeedback('Payment settings and Web3Forms key saved successfully!');
      onDataRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ===================== PRODUCT CRUD =====================
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;

    try {
      const validImages = (prodForm.images || []).filter((img) => img && img.trim() !== '');
      if (prodForm.image && !validImages.includes(prodForm.image)) {
        validImages.unshift(prodForm.image);
      }
      const finalImages = validImages.slice(0, 5);
      const primaryImage =
        finalImages[0] ||
        prodForm.image ||
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

      const payload: any = {
        name: prodForm.name,
        productId: prodForm.productId || 'NISU-' + Math.floor(100 + Math.random() * 900),
        description: prodForm.description,
        price: Number(prodForm.price) || 0,
        originalPrice: prodForm.originalPrice ? Number(prodForm.originalPrice) : undefined,
        image: primaryImage,
        images: finalImages.length > 0 ? finalImages : [primaryImage],
        thumbnailTag: prodForm.thumbnailTag || '',
        isAvailable: prodForm.isAvailable,
      };

      if (editingProduct) {
        payload.id = editingProduct.id;
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ action: 'update', product: payload }),
        });
        if (!res.ok) throw new Error('Failed to update product');
        showFeedback('Product updated successfully!');
      } else {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ action: 'create', product: payload }),
        });
        if (!res.ok) throw new Error('Failed to add product');
        showFeedback('New product added successfully!');
      }

      setIsAddingProduct(false);
      setEditingProduct(null);
      onDataRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ action: 'delete', product: { id } }),
      });
      if (res.ok) {
        showFeedback('Product deleted');
        onDataRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleProductStatus = async (product: Product) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          action: 'update',
          product: { id: product.id, isAvailable: !product.isAvailable },
        }),
      });
      if (res.ok) {
        showFeedback(`Product ${product.isAvailable ? 'disabled' : 'enabled'}`);
        onDataRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ===================== THUMBNAIL CRUD =====================
  const handleSaveThumbnail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;

    try {
      const payload: any = {
        title: thumbForm.title,
        image: thumbForm.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80',
        tag: thumbForm.tag || thumbForm.title.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      };

      if (editingThumbnail) {
        payload.id = editingThumbnail.id;
        payload.order = editingThumbnail.order;
        const res = await fetch('/api/admin/thumbnails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ action: 'update', thumbnail: payload }),
        });
        if (!res.ok) throw new Error('Failed to update thumbnail');
        showFeedback('Thumbnail updated!');
      } else {
        const res = await fetch('/api/admin/thumbnails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ action: 'create', thumbnail: payload }),
        });
        if (!res.ok) throw new Error('Failed to add thumbnail');
        showFeedback('New custom thumbnail created!');
      }

      setIsAddingThumbnail(false);
      setEditingThumbnail(null);
      onDataRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteThumbnail = async (id: string) => {
    if (!confirm('Delete this custom thumbnail section?')) return;
    try {
      const res = await fetch('/api/admin/thumbnails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ action: 'delete', thumbnail: { id } }),
      });
      if (res.ok) {
        showFeedback('Thumbnail deleted');
        onDataRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReorderThumbnails = async (index: number, direction: 'up' | 'down') => {
    const list = [...thumbnails];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    const updated = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    try {
      const res = await fetch('/api/admin/thumbnails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ action: 'reorder', thumbnails: updated }),
      });
      if (res.ok) {
        onDataRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ===================== BANNER CRUD =====================
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;

    try {
      const payload: any = {
        title: bannerForm.title,
        subtitle: bannerForm.subtitle,
        badge: bannerForm.badge,
        image: bannerForm.image || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80',
      };

      if (editingBanner) {
        payload.id = editingBanner.id;
        payload.order = editingBanner.order;
        const res = await fetch('/api/admin/banners', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ action: 'update', banner: payload }),
        });
        if (!res.ok) throw new Error('Failed to update banner');
        showFeedback('Banner updated!');
      } else {
        const res = await fetch('/api/admin/banners', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ action: 'create', banner: payload }),
        });
        if (!res.ok) throw new Error('Failed to create banner');
        showFeedback('New banner added!');
      }

      setIsAddingBanner(false);
      setEditingBanner(null);
      onDataRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Delete this promotional banner?')) return;
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ action: 'delete', banner: { id } }),
      });
      if (res.ok) {
        showFeedback('Banner deleted');
        onDataRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReorderBanners = async (index: number, direction: 'up' | 'down') => {
    const list = [...banners];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    const updated = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ action: 'reorder', banners: updated }),
      });
      if (res.ok) {
        onDataRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ===================== ORDER STATUS & UTR VERIFICATION =====================
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showFeedback(`Order status updated to ${status}`);
        fetchAdminOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePaymentVerification = async (
    orderId: string,
    verificationStatus: 'Pending Verification' | 'Verified' | 'Rejected'
  ) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/payment-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ verificationStatus }),
      });
      if (res.ok) {
        showFeedback(`Payment marked as: ${verificationStatus}`);
        fetchAdminOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestEmailDispatch = async () => {
    if (!adminToken) return;
    setIsTestingEmail(true);
    setEmailTestResult(null);
    try {
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      setEmailTestResult({
        success: data.success,
        message: data.message || (data.success ? 'Email delivered successfully!' : 'Delivery failed'),
      });
      fetchAdminOrders();
    } catch (err: any) {
      setEmailTestResult({
        success: false,
        message: 'Network error triggering test email: ' + err.message,
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const copyOrderDetailsToClipboard = (order: Order) => {
    const text = `
NISUMART ORDER: ${order.orderId}
Customer: ${order.customerName}
Mobile: +91 ${order.mobile} ${order.secondMobile ? `(Alt: +91 ${order.secondMobile})` : ''}
Delivery Address: ${order.houseNo}, ${order.roadArea}, ${order.city}, ${order.state} - ${order.pinCode}
Items:
${order.items.map((i) => `- ${i.productName} [${i.productId}] x ${i.quantity} = ₹${i.price * i.quantity}`).join('\n')}
Payment Mode: ${order.paymentMethod.toUpperCase()}
UPI UTR: ${order.upiTransactionId || 'N/A'}
Payment Verification: ${order.paymentVerificationStatus}
Total Amount: ₹${order.finalAmount}
    `.trim();
    navigator.clipboard.writeText(text);
    showFeedback('Order & courier details copied!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden border border-slate-200 flex flex-col max-h-[95vh]">
        {/* Admin Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-emerald-600 flex items-center justify-center font-bold text-xs">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight">
                NISUMART Store Management Panel
              </h2>
              <p className="text-[10px] text-slate-400">
                Products · Custom Thumbnails · Banners · Orders · Payments
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {adminToken && (
              <button
                onClick={handleLogout}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded cursor-pointer"
              >
                Logout
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Bar */}
        {statusMessage && (
          <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 flex items-center gap-2 shrink-0 animate-in fade-in">
            <CheckCircle className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* STEP 1: AUTHENTICATION VIEW (Shows ONLY password field & login button before auth) */}
        {!adminToken ? (
          <div className="p-8 max-w-sm mx-auto my-auto text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-700">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Admin Authentication</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your secure administrator password to access store management.
              </p>
            </div>
            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="password"
                required
                autoFocus
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter Admin Password..."
                className="w-full text-center text-sm px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
              {authError && <p className="text-xs text-rose-600 font-semibold">{authError}</p>}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition cursor-pointer disabled:opacity-50"
              >
                {isLoggingIn ? 'Verifying...' : 'Login to Admin Dashboard'}
              </button>
            </form>
          </div>
        ) : (
          /* STEP 2: AUTHENTICATED ADMIN DASHBOARD */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 sm:px-6 pt-2 overflow-x-auto shrink-0 text-xs font-bold">
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'orders'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Orders ({orders.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`py-2 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'products'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Products ({products.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('payment_settings')}
                className={`py-2 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'payment_settings'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Payment Settings</span>
              </button>
              <button
                onClick={() => setActiveTab('thumbnails')}
                className={`py-2 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'thumbnails'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Custom Thumbnails ({thumbnails.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('banners')}
                className={`py-2 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'banners'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Banners ({banners.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`py-2 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'email'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Email Diagnostics</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/40">
              {/* TAB: ORDERS MANAGEMENT */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Customer Orders & Payment Verification ({orders.length})
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Inspect customer details, UPI UTR numbers, approve/reject payments, and update parcel delivery status
                      </p>
                    </div>
                    <button
                      onClick={() => fetchAdminOrders()}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? 'animate-spin' : ''}`} />
                      <span>Refresh Orders</span>
                    </button>
                  </div>

                  {orders.length > 0 ? (
                    <div className="space-y-3.5">
                      {orders.map((o) => (
                        <div
                          key={o.id || o.orderId}
                          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3"
                        >
                          {/* Order Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                                {o.orderId}
                              </span>
                              <span className="text-slate-500 text-[11px]">
                                {new Date(o.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-slate-500">Status:</span>
                              <select
                                value={o.status}
                                onChange={(e) => handleUpdateOrderStatus(o.id || o.orderId, e.target.value)}
                                className="text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1 font-bold text-slate-700 outline-none cursor-pointer"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>

                              <button
                                onClick={() => copyOrderDetailsToClipboard(o)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                                title="Copy courier address label"
                              >
                                <Copy className="w-3 h-3" />
                                <span>Copy Label</span>
                              </button>
                            </div>
                          </div>

                          {/* Customer & Address Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div>
                              <div className="text-[10px] text-slate-400 uppercase font-bold">
                                Customer Contact
                              </div>
                              <div className="font-bold text-slate-900 mt-0.5">{o.customerName}</div>
                              <div className="text-slate-700 mt-0.5">
                                Primary Mobile: <a href={`tel:${o.mobile}`} className="text-emerald-700 font-bold underline">+91 {o.mobile}</a>
                              </div>
                              {o.secondMobile && (
                                <div className="text-slate-600">
                                  Secondary: <a href={`tel:${o.secondMobile}`} className="text-slate-700 font-medium">+91 {o.secondMobile}</a>
                                </div>
                              )}
                            </div>

                            <div>
                              <div className="text-[10px] text-slate-400 uppercase font-bold">
                                Delivery Address (Madhya Pradesh)
                              </div>
                              <div className="font-semibold text-slate-800 mt-0.5">
                                {o.houseNo}, {o.roadArea}
                              </div>
                              <div className="text-slate-600">
                                <span className="font-bold text-slate-800">{o.city}</span>, {o.state} - {o.pinCode}
                              </div>
                            </div>
                          </div>

                          {/* Products List */}
                          <div className="text-xs space-y-1">
                            <div className="text-[10px] text-slate-400 uppercase font-bold">Items Ordered:</div>
                            {o.items.map((it, idx) => (
                              <div key={idx} className="text-slate-700 font-medium flex items-center justify-between">
                                <span>• {it.productName} <span className="font-mono text-slate-400">({it.productId})</span> × {it.quantity}</span>
                                <span className="font-bold text-slate-900">₹{it.price * it.quantity}</span>
                              </div>
                            ))}
                          </div>

                          {/* Payment Method, UPI UTR & Verification Section */}
                          <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                            <div>
                              <div className="text-[11px] text-slate-600">
                                Payment Mode:{' '}
                                <strong className="uppercase text-slate-900">
                                  {o.paymentMethod === 'cod'
                                    ? 'Cash on Delivery (+₹50)'
                                    : o.paymentMethod === 'online'
                                    ? 'Online UPI (-₹50)'
                                    : 'Card Payment'}
                                </strong>
                              </div>

                              {o.upiTransactionId && (
                                <div className="mt-1 flex items-center gap-1.5">
                                  <span className="font-medium text-slate-600">UPI Transaction ID / UTR:</span>
                                  <code className="bg-white px-2 py-0.5 rounded font-mono font-bold text-emerald-800 border border-slate-300">
                                    {o.upiTransactionId}
                                  </code>
                                </div>
                              )}

                              {/* Payment Verification Status with Action Buttons */}
                              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                                <span className="text-[11px] text-slate-500 font-semibold">Payment Status:</span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                    o.paymentVerificationStatus === 'Verified'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : o.paymentVerificationStatus === 'Rejected'
                                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                                  }`}
                                >
                                  {o.paymentVerificationStatus || 'Pending Verification'}
                                </span>

                                {o.paymentMethod === 'online' && (
                                  <div className="flex items-center gap-1 ml-1">
                                    <button
                                      onClick={() => handleUpdatePaymentVerification(o.id || o.orderId, 'Verified')}
                                      className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer"
                                    >
                                      ✓ Approve UTR
                                    </button>
                                    <button
                                      onClick={() => handleUpdatePaymentVerification(o.id || o.orderId, 'Rejected')}
                                      className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold cursor-pointer"
                                    >
                                      ✕ Reject UTR
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="text-right sm:border-l sm:border-slate-300 sm:pl-4">
                              <div className="text-[10px] text-slate-500">Order Total</div>
                              <div className="text-base font-black text-emerald-700">₹{o.finalAmount}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Email: {o.emailSent ? '✓ Sent to nishaldamor03@gmail.com' : 'Pending / Logged in outbox'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-white rounded-xl border border-slate-200">
                      <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">No orders placed yet</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        New orders from the customer website will appear here in real-time.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: PAYMENT SETTINGS (Requirement 4) */}
              {activeTab === 'payment_settings' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Online Payment & UPI QR Settings
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Configure the official UPI ID, QR Code image, and Web3Forms email access key
                    </p>
                  </div>

                  <form onSubmit={handleSavePaymentSettings} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
                    {/* Enable / Disable Online Payment toggle */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div>
                        <label className="font-bold text-slate-800 text-xs block">
                          Enable Online Payment (UPI & QR)
                        </label>
                        <p className="text-[11px] text-slate-500">
                          When enabled, customers can choose Online Payment with the ₹50 instant discount
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={paymentForm.isOnlinePaymentEnabled}
                          onChange={(e) =>
                            setPaymentForm({ ...paymentForm, isOnlinePaymentEnabled: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    {/* UPI ID */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Store UPI ID (Receiving Account) *
                      </label>
                      <input
                        type="text"
                        required
                        value={paymentForm.upiId}
                        onChange={(e) => setPaymentForm({ ...paymentForm, upiId: e.target.value })}
                        placeholder="e.g. 7772809503@paytm or yourstore@upi"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono focus:border-emerald-600 bg-white"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        This UPI ID is displayed on customer checkout with a 1-click copy button.
                      </p>
                    </div>

                    {/* QR Code Image */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Custom UPI QR Code Image (URL or Upload File)
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={paymentForm.upiQrImage}
                          onChange={(e) => setPaymentForm({ ...paymentForm, upiQrImage: e.target.value })}
                          placeholder="Image URL or upload QR image file"
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white font-mono text-[11px]"
                        />
                        <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg font-bold flex items-center gap-1 cursor-pointer shrink-0">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload QR</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload(e, (url) =>
                                setPaymentForm((prev) => ({ ...prev, upiQrImage: url }))
                              )
                            }
                          />
                        </label>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        If left blank, NISUMART automatically generates a live dynamic QR code for the customer's exact order amount.
                      </p>
                      {paymentForm.upiQrImage && (
                        <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-lg inline-block">
                          <img
                            src={paymentForm.upiQrImage}
                            alt="QR Preview"
                            className="w-24 h-24 object-contain"
                          />
                        </div>
                      )}
                    </div>

                    {/* Web3Forms Access Key */}
                    <div className="pt-2 border-t border-slate-200">
                      <label className="block font-bold text-slate-700 mb-1">
                        Web3Forms Access Key (for nishaldamor03@gmail.com)
                      </label>
                      <input
                        type="text"
                        value={paymentForm.web3formsKey}
                        onChange={(e) => setPaymentForm({ ...paymentForm, web3formsKey: e.target.value })}
                        placeholder="e.g. 00000000-0000-0000-0000-000000000000"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono focus:border-emerald-600 bg-white"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Get your free instant access key for <strong>nishaldamor03@gmail.com</strong> at <a href="https://web3forms.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-bold">web3forms.com</a>. Every new order email is routed through this key.
                      </p>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition cursor-pointer"
                      >
                        Save Payment & Email Settings
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB: PRODUCTS MANAGEMENT */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Product Catalog Management</h3>
                      <p className="text-[11px] text-slate-500">
                        Add, edit, change images, set pricing, or toggle availability
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setProdForm({
                          name: '',
                          productId: 'NISU-' + Math.floor(100 + Math.random() * 900),
                          description: '',
                          price: '',
                          originalPrice: '',
                          image: '',
                          images: [],
                          thumbnailTag: thumbnails[0]?.tag || 'new_arrivals',
                          isAvailable: true,
                        });
                        setIsAddingProduct(true);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Product</span>
                    </button>
                  </div>

                  {/* Add/Edit Product Modal Form */}
                  {isAddingProduct && (
                    <div className="bg-white border-2 border-emerald-500 rounded-xl p-4 shadow-md space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h4 className="text-xs font-bold text-emerald-800">
                          {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </h4>
                        <button
                          onClick={() => setIsAddingProduct(false)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Product Name *</label>
                          <input
                            type="text"
                            required
                            value={prodForm.name}
                            onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                            placeholder="e.g. Cotton Rajasthani Bedspread"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Product ID *</label>
                          <input
                            type="text"
                            required
                            value={prodForm.productId}
                            onChange={(e) => setProdForm({ ...prodForm, productId: e.target.value })}
                            placeholder="NISU-101"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none font-mono bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Selling Price (₹) *</label>
                          <input
                            type="number"
                            required
                            value={prodForm.price}
                            onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                            placeholder="499"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none bg-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Original Strikethrough Price (₹)
                          </label>
                          <input
                            type="number"
                            value={prodForm.originalPrice}
                            onChange={(e) => setProdForm({ ...prodForm, originalPrice: e.target.value })}
                            placeholder="999 (shows discount tag)"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none bg-white font-mono"
                          />
                        </div>

                        {/* Product Images (1 to 5 images supported) */}
                        <div className="sm:col-span-2 space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="block font-bold text-slate-800 text-xs">
                                Product Images (1–5 Images)
                              </label>
                              <p className="text-[11px] text-slate-500">
                                Upload or provide URL for 1 to 5 images. The 1st image will be the primary cover image.
                              </p>
                            </div>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {prodForm.images.length > 0
                                ? `${prodForm.images.length} / 5 Images`
                                : (prodForm.image ? '1 / 5 Images' : '0 / 5 Images')}
                            </span>
                          </div>

                          {/* Upload Buttons & URL Input */}
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              value={prodForm.image}
                              onChange={(e) => {
                                const val = e.target.value;
                                setProdForm((prev) => {
                                  const current = prev.images.length > 0 ? [...prev.images] : (prev.image ? [prev.image] : []);
                                  if (current.length === 0 && val) {
                                    return { ...prev, image: val, images: [val] };
                                  }
                                  return { ...prev, image: val };
                                });
                              }}
                              placeholder="Enter image URL or upload 1–5 files below..."
                              className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none bg-white text-xs"
                            />

                            <div className="flex items-center gap-2">
                              {/* Add URL to list button */}
                              {prodForm.image && !prodForm.images.includes(prodForm.image) && prodForm.images.length < 5 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!prodForm.image.trim()) return;
                                    setProdForm((prev) => {
                                      const updated = [...prev.images, prev.image.trim()].slice(0, 5);
                                      return { ...prev, images: updated, image: updated[0] };
                                    });
                                  }}
                                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add URL</span>
                                </button>
                              )}

                              {/* Multi-file upload button (1 to 5 images) */}
                              <label
                                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer shrink-0 text-xs shadow-xs transition ${
                                  prodForm.images.length >= 5
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload Images (1–5)</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  disabled={prodForm.images.length >= 5}
                                  className="hidden"
                                  onChange={handleProductMultiImageUpload}
                                />
                              </label>
                            </div>
                          </div>

                          {/* Thumbnails Grid of Selected Images (1-5) */}
                          {(() => {
                            const displayImages = prodForm.images.length > 0
                              ? prodForm.images
                              : (prodForm.image ? [prodForm.image] : []);

                            if (displayImages.length === 0) {
                              return (
                                <p className="text-[11px] text-slate-400 italic pt-1">
                                  No images selected yet. You can upload up to 5 images per product.
                                </p>
                              );
                            }

                            return (
                              <div className="pt-2">
                                <div className="text-[11px] font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
                                  <span>Selected Images ({displayImages.length}/5):</span>
                                  <span className="text-[10px] text-slate-400">Click star to make primary cover</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                                  {displayImages.map((imgUrl, idx) => (
                                    <div
                                      key={idx}
                                      className={`relative group rounded-lg overflow-hidden border-2 bg-white aspect-square shadow-2xs ${
                                        idx === 0 ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200'
                                      }`}
                                    >
                                      <img
                                        src={imgUrl}
                                        alt={`Product view ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                      />

                                      {/* Primary badge */}
                                      {idx === 0 && (
                                        <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                                          PRIMARY
                                        </span>
                                      )}

                                      {/* Index badge */}
                                      <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] font-mono px-1 rounded">
                                        #{idx + 1}
                                      </span>

                                      {/* Action buttons on hover/overlay */}
                                      <div className="absolute top-1 right-1 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition">
                                        {/* Set as Primary */}
                                        {idx !== 0 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const updated = [imgUrl, ...displayImages.filter((_, i) => i !== idx)];
                                              setProdForm((prev) => ({
                                                ...prev,
                                                images: updated,
                                                image: updated[0],
                                              }));
                                            }}
                                            title="Make Primary Cover Image"
                                            className="p-1 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-md shadow-xs cursor-pointer text-[10px]"
                                          >
                                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                          </button>
                                        )}

                                        {/* Remove image */}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = displayImages.filter((_, i) => i !== idx);
                                            setProdForm((prev) => ({
                                              ...prev,
                                              images: updated,
                                              image: updated[0] || '',
                                            }));
                                          }}
                                          title="Remove this image"
                                          className="p-1 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-md shadow-xs cursor-pointer"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Assign to Custom Thumbnail
                          </label>
                          <select
                            value={prodForm.thumbnailTag}
                            onChange={(e) => setProdForm({ ...prodForm, thumbnailTag: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none bg-white cursor-pointer"
                          >
                            <option value="">None / General</option>
                            {thumbnails.map((t) => (
                              <option key={t.id} value={t.tag}>
                                {t.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-2 pt-4">
                          <input
                            type="checkbox"
                            id="prod-avail"
                            checked={prodForm.isAvailable}
                            onChange={(e) => setProdForm({ ...prodForm, isAvailable: e.target.checked })}
                            className="rounded text-emerald-600 cursor-pointer"
                          />
                          <label htmlFor="prod-avail" className="font-bold text-slate-700 cursor-pointer">
                            Product Active & In-Stock
                          </label>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">Description</label>
                          <textarea
                            rows={2}
                            value={prodForm.description}
                            onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                            placeholder="Detailed product highlights..."
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none bg-white"
                          />
                        </div>

                        <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setIsAddingProduct(false)}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                          >
                            Save Product
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Products Table */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                        <tr>
                          <th className="p-3">Product</th>
                          <th className="p-3">ID</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="p-3 flex items-center gap-2">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-10 h-10 rounded object-cover bg-slate-100"
                              />
                              <div className="max-w-[200px] truncate">
                                <div className="font-bold text-slate-800 truncate">{p.name}</div>
                                <div className="text-[10px] text-slate-400">
                                  Tag: {p.thumbnailTag || 'General'}
                                </div>
                              </div>
                            </td>
                            <td className="p-3 font-mono font-bold text-slate-700">{p.productId}</td>
                            <td className="p-3">
                              <span className="font-extrabold text-slate-900">₹{p.price}</span>
                              {p.originalPrice && (
                                <span className="text-[10px] text-slate-400 line-through ml-1">
                                  ₹{p.originalPrice}
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => handleToggleProductStatus(p)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                                  p.isAvailable
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {p.isAvailable ? 'Active' : 'Disabled'}
                              </button>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => {
                                    setEditingProduct(p);
                                    const initialImages = Array.isArray(p.images) && p.images.length > 0
                                      ? [...p.images]
                                      : (p.image ? [p.image] : []);
                                    setProdForm({
                                      name: p.name,
                                      productId: p.productId,
                                      description: p.description,
                                      price: p.price.toString(),
                                      originalPrice: p.originalPrice ? p.originalPrice.toString() : '',
                                      image: p.image || initialImages[0] || '',
                                      images: initialImages,
                                      thumbnailTag: p.thumbnailTag || '',
                                      isAvailable: p.isAvailable,
                                    });
                                    setIsAddingProduct(true);
                                  }}
                                  className="p-1.5 hover:bg-slate-100 text-slate-600 rounded cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1.5 hover:bg-rose-50 text-rose-600 rounded cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: CUSTOM THUMBNAILS */}
              {activeTab === 'thumbnails' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Custom Thumbnail Reel Management
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Add customizable thumbnail buttons, change images, rename, or reorder
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingThumbnail(null);
                        setThumbForm({ title: '', image: '', tag: '' });
                        setIsAddingThumbnail(true);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Thumbnail</span>
                    </button>
                  </div>

                  {isAddingThumbnail && (
                    <div className="bg-white border-2 border-emerald-500 rounded-xl p-4 shadow-md space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h4 className="text-xs font-bold text-emerald-800">
                          {editingThumbnail ? 'Edit Thumbnail' : 'Add Custom Thumbnail'}
                        </h4>
                        <button
                          onClick={() => setIsAddingThumbnail(false)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveThumbnail} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Title / Text Below Image *
                          </label>
                          <input
                            type="text"
                            required
                            value={thumbForm.title}
                            onChange={(e) => setThumbForm({ ...thumbForm, title: e.target.value })}
                            placeholder="e.g. Big Deals / Electronics / New Arrivals"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Tag Identifier (for linking products)
                          </label>
                          <input
                            type="text"
                            value={thumbForm.tag}
                            onChange={(e) => setThumbForm({ ...thumbForm, tag: e.target.value })}
                            placeholder="auto_generated_if_empty"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none bg-white font-mono"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">
                            Thumbnail Image (Upload File or Enter URL) *
                          </label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              required
                              value={thumbForm.image}
                              onChange={(e) => setThumbForm({ ...thumbForm, image: e.target.value })}
                              placeholder="Image URL or upload from disk"
                              className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none bg-white"
                            />
                            <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg font-bold flex items-center gap-1 cursor-pointer shrink-0">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleFileUpload(e, (url) => setThumbForm((prev) => ({ ...prev, image: url })))
                                }
                              />
                            </label>
                          </div>
                          {thumbForm.image && (
                            <img
                              src={thumbForm.image}
                              alt="thumb preview"
                              className="mt-2 w-14 h-14 rounded-full object-cover border-2 border-emerald-500"
                            />
                          )}
                        </div>

                        <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setIsAddingThumbnail(false)}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer"
                          >
                            Save Thumbnail
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Thumbnail List */}
                  <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-xs">
                    {thumbnails.map((t, idx) => (
                      <div key={t.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-400 w-4">{idx + 1}</span>
                          <img
                            src={t.image}
                            alt={t.title}
                            className="w-12 h-12 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{t.title}</div>
                            <div className="text-[10px] text-slate-400 font-mono">Tag: {t.tag}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleReorderThumbnails(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                            title="Move Left/Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleReorderThumbnails(idx, 'down')}
                            disabled={idx === thumbnails.length - 1}
                            className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                            title="Move Right/Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingThumbnail(t);
                              setThumbForm({ title: t.title, image: t.image, tag: t.tag });
                              setIsAddingThumbnail(true);
                            }}
                            className="p-1 hover:bg-slate-100 text-slate-600 rounded cursor-pointer ml-1"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteThumbnail(t.id)}
                            className="p-1 hover:bg-rose-50 text-rose-600 rounded cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: BANNERS */}
              {activeTab === 'banners' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Promotional Banners Management
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Upload custom banners, edit promotional text, change images or positions
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingBanner(null);
                        setBannerForm({ title: '', subtitle: '', badge: '', image: '' });
                        setIsAddingBanner(true);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Banner</span>
                    </button>
                  </div>

                  {isAddingBanner && (
                    <div className="bg-white border-2 border-emerald-500 rounded-xl p-4 shadow-md space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h4 className="text-xs font-bold text-emerald-800">
                          {editingBanner ? 'Edit Banner' : 'Add Promotional Banner'}
                        </h4>
                        <button
                          onClick={() => setIsAddingBanner(false)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveBanner} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Banner Heading / Title *
                          </label>
                          <input
                            type="text"
                            required
                            value={bannerForm.title}
                            onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                            placeholder="e.g. LOCAL DEALS COMING SOON"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none bg-white font-bold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Badge Label (Optional)
                          </label>
                          <input
                            type="text"
                            value={bannerForm.badge}
                            onChange={(e) => setBannerForm({ ...bannerForm, badge: e.target.value })}
                            placeholder="e.g. MADHYA PRADESH SPECIAL"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none bg-white font-semibold"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">
                            Subtitle / Promotional Message
                          </label>
                          <input
                            type="text"
                            value={bannerForm.subtitle}
                            onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                            placeholder="e.g. Superfast delivery in Dewas, Hatpipliya, Bagli & Indore"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none bg-white"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">
                            Banner Image (Upload File or Enter URL) *
                          </label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              required
                              value={bannerForm.image}
                              onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                              placeholder="Image URL or upload from local device"
                              className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none bg-white"
                            />
                            <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg font-bold flex items-center gap-1 cursor-pointer shrink-0">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleFileUpload(e, (url) => setBannerForm((prev) => ({ ...prev, image: url })))
                                }
                              />
                            </label>
                          </div>
                          {bannerForm.image && (
                            <img
                              src={bannerForm.image}
                              alt="banner preview"
                              className="mt-2 w-full h-24 rounded-lg object-cover border border-slate-200"
                            />
                          )}
                        </div>

                        <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setIsAddingBanner(false)}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer"
                          >
                            Save Banner
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Banners List */}
                  <div className="space-y-3">
                    {banners.map((b, idx) => (
                      <div
                        key={b.id}
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col sm:flex-row items-center justify-between p-3 gap-3"
                      >
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <img
                            src={b.image}
                            alt={b.title}
                            className="w-24 h-14 rounded-lg object-cover bg-slate-100 shrink-0"
                          />
                          <div>
                            {b.badge && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                                {b.badge}
                              </span>
                            )}
                            <h4 className="text-xs font-bold text-slate-900 mt-0.5">{b.title}</h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{b.subtitle}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => handleReorderBanners(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleReorderBanners(idx, 'down')}
                            disabled={idx === banners.length - 1}
                            className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingBanner(b);
                              setBannerForm({
                                title: b.title,
                                subtitle: b.subtitle,
                                badge: b.badge || '',
                                image: b.image,
                              });
                              setIsAddingBanner(true);
                            }}
                            className="p-1 hover:bg-slate-100 text-slate-600 rounded cursor-pointer ml-1"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBanner(b.id)}
                            className="p-1 hover:bg-rose-50 text-rose-600 rounded cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: EMAIL DIAGNOSTICS */}
              {activeTab === 'email' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Email Notification Diagnostics</h3>
                    <p className="text-[11px] text-slate-500">
                      Orders automatically notify the website owner at <strong>nishaldamor03@gmail.com</strong>
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-slate-800">Target Notification Email</div>
                          <div className="text-sm font-black text-emerald-700 font-mono">
                            nishaldamor03@gmail.com
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleTestEmailDispatch}
                        disabled={isTestingEmail}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isTestingEmail ? 'Submitting Test...' : 'Test Real Email Delivery'}</span>
                      </button>
                    </div>

                    {emailTestResult && (
                      <div
                        className={`p-3 rounded-lg text-xs font-medium border flex items-start gap-2 ${
                          emailTestResult.success
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-rose-50 border-rose-200 text-rose-900'
                        }`}
                      >
                        {emailTestResult.success ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <strong>{emailTestResult.success ? 'Success:' : 'Error details:'}</strong>{' '}
                          {emailTestResult.message}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Outbox Dispatch History */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Email Dispatch Outbox Log ({emailOutbox.length})
                    </h4>

                    {emailOutbox.length > 0 ? (
                      <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                        {emailOutbox.map((mail) => (
                          <div key={mail.id} className="py-2.5 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 font-mono">
                                Order: {mail.orderId}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  mail.status === 'Delivered'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {mail.status} ({mail.provider || 'N/A'})
                              </span>
                            </div>
                            <div className="text-slate-600 text-[11px] truncate">
                              Subject: {mail.subject}
                            </div>
                            {mail.error && (
                              <div className="text-rose-600 text-[10px]">
                                Cause: {mail.error}
                              </div>
                            )}
                            <div className="text-[10px] text-slate-400">
                              Sent to {mail.to} at {new Date(mail.sentAt).toLocaleString('en-IN')}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-6">
                        No emails in dispatch history yet. Place an order or click 'Test Real Email Delivery' above to test.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
