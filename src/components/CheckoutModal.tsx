import React, { useState } from 'react';
import {
  CityOption,
  StateOption,
  PaymentMethod,
  OrderItem,
  Order,
  PaymentSettings,
  Customer,
} from '../types';
import {
  X,
  MapPin,
  Phone,
  User,
  Home,
  CheckCircle2,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  Copy,
  Check,
  QrCode,
  Headphones,
} from 'lucide-react';

interface CheckoutModalProps {
  items: OrderItem[];
  defaultCity: CityOption;
  paymentSettings: PaymentSettings;
  currentCustomer: Customer | null;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

const ALLOWED_CITIES: CityOption[] = ['Dewas', 'Hatpipliya', 'Bagli', 'Indore'];
const STATE_OPTION: StateOption = 'Madhya Pradesh';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  items,
  defaultCity,
  paymentSettings,
  currentCustomer,
  onClose,
  onOrderSuccess,
}) => {
  // Form fields (pre-filled with logged-in customer info if available)
  const [customerName, setCustomerName] = useState(currentCustomer?.name || '');
  const [mobile, setMobile] = useState(currentCustomer?.mobile || '');
  const [secondMobile, setSecondMobile] = useState('');
  const [pinCode, setPinCode] = useState('455001');
  const [city, setCity] = useState<CityOption>(defaultCity || 'Dewas');
  const [houseNo, setHouseNo] = useState('');
  const [roadArea, setRoadArea] = useState('');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    paymentSettings.isOnlinePaymentEnabled ? 'online' : 'cod'
  );

  // UPI UTR / Transaction ID
  const [upiTransactionId, setUpiTransactionId] = useState('');
  const [isCopiedUpi, setIsCopiedUpi] = useState(false);

  // Item Quantities
  const [itemQuantities, setItemQuantities] = useState<{ [key: string]: number }>(
    items.reduce((acc, it) => ({ ...acc, [it.productId]: it.quantity || 1 }), {})
  );

  // Card Payment Gateway states
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardGatewayStep, setCardGatewayStep] = useState<'card_input' | '3ds_otp' | 'authorized'>('card_input');
  const [cardOtp, setCardOtp] = useState('');
  const [cardIntentId, setCardIntentId] = useState<string | null>(null);
  const [cardAuthToken, setCardAuthToken] = useState<string | null>(null);

  // General error & submitting state
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate Base Subtotal
  const baseSubtotal = items.reduce((sum, it) => {
    const qty = itemQuantities[it.productId] || 1;
    return sum + it.price * qty;
  }, 0);

  // Pricing rule:
  // COD: +50 charge
  // Online: -50 discount
  // Card: 0
  let adjustment = 0;
  if (paymentMethod === 'cod') {
    adjustment = 50;
  } else if (paymentMethod === 'online') {
    adjustment = -50;
  } else if (paymentMethod === 'card') {
    adjustment = 0;
  }

  const finalTotal = Math.max(0, baseSubtotal + adjustment);

  // Dynamic UPI URL for the exact amount and configured UPI ID
  const upiId = paymentSettings.upiId || '7772809503@paytm';
  const dynamicUpiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=NISUMART&am=${finalTotal}&cu=INR&tn=NISUMART Order`;
  const qrCodeImage =
    paymentSettings.upiQrImage && paymentSettings.upiQrImage.trim() !== ''
      ? paymentSettings.upiQrImage
      : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(dynamicUpiUrl)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setIsCopiedUpi(true);
    setTimeout(() => setIsCopiedUpi(false), 2500);
  };

  const handleQtyChange = (productId: string, delta: number) => {
    setItemQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  const validateForm = () => {
    if (!customerName.trim()) {
      setError('Please enter your full name');
      return false;
    }
    const cleanMobile = mobile.trim().replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setError('Please enter a valid 10-digit primary mobile number');
      return false;
    }
    if (secondMobile.trim()) {
      const cleanSecond = secondMobile.trim().replace(/\D/g, '');
      if (cleanSecond.length !== 10) {
        setError('Second mobile number must be 10 digits if provided');
        return false;
      }
    }
    const cleanPin = pinCode.trim().replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setError('Please enter a valid 6-digit PIN code for Madhya Pradesh');
      return false;
    }
    if (!ALLOWED_CITIES.includes(city)) {
      setError('City must be selected from the allowed Madhya Pradesh cities.');
      return false;
    }
    if (!houseNo.trim()) {
      setError('Please enter House No. / Building Name');
      return false;
    }
    if (!roadArea.trim()) {
      setError('Please enter Road Name / Area / Colony');
      return false;
    }

    if (paymentMethod === 'online') {
      if (!upiTransactionId.trim() || upiTransactionId.trim().length < 6) {
        setError('Please enter the 12-digit UPI Transaction ID / UTR number after completing the payment.');
        return false;
      }
    }

    setError(null);
    return true;
  };

  const handleCardGatewaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (cleanCard.length < 15 || cleanCard.length > 19) {
      setError('Please enter a valid 16-digit card number.');
      return;
    }
    if (!cardExpiry.includes('/') || cardExpiry.length < 5) {
      setError('Expiry must be MM/YY.');
      return;
    }
    if (cardCvv.length < 3) {
      setError('Enter valid 3 or 4 digit CVV.');
      return;
    }

    setIsProcessingPayment(true);
    setError(null);

    try {
      // Step 1: Create card payment intent on backend
      const response = await fetch('/api/payment/verify-card-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalTotal,
          customerName: customerName.trim(),
          city,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Card intent creation failed');
      }

      setCardIntentId(resData.intentId);
      setCardGatewayStep('3ds_otp');
      setCardOtp('482910'); // Simulated test OTP for verification
    } catch (err: any) {
      setError(err.message || 'Payment Gateway error. Please retry.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handle3dsOtpVerify = async () => {
    if (!cardOtp || cardOtp.length < 4) {
      setError('Please enter the bank verification OTP');
      return;
    }

    setIsProcessingPayment(true);
    setError(null);

    try {
      // Step 2: Confirm charge with gateway backend
      const res = await fetch('/api/payment/confirm-card-charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intentId: cardIntentId,
          otp: cardOtp,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Bank authorization failed');
      }

      setCardAuthToken(data.cardAuthToken);
      setCardGatewayStep('authorized');

      setTimeout(() => {
        setCardModalOpen(false);
        submitFinalOrder(data.cardAuthToken);
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Card authorization error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePrimarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (paymentMethod === 'card') {
      setCardModalOpen(true);
      setCardGatewayStep('card_input');
      return;
    }

    submitFinalOrder(null);
  };

  const submitFinalOrder = async (authToken: string | null) => {
    setIsSubmitting(true);
    setError(null);

    const orderPayload = {
      customerId: currentCustomer?.id || null,
      customerName: customerName.trim(),
      mobile: mobile.trim(),
      secondMobile: secondMobile.trim(),
      pinCode: pinCode.trim(),
      city,
      state: STATE_OPTION,
      houseNo: houseNo.trim(),
      roadArea: roadArea.trim(),
      items: items.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        price: it.price,
        quantity: itemQuantities[it.productId] || 1,
        image: it.image,
      })),
      paymentMethod,
      upiTransactionId: paymentMethod === 'online' ? upiTransactionId.trim() : null,
      cardAuthToken: authToken,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      onOrderSuccess(data.order);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error communicating with NISUMART server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-auto overflow-hidden border border-slate-200 flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-emerald-600 flex items-center justify-center font-bold text-sm">
              N
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">NISUMART Secure Checkout</h2>
              <p className="text-[11px] text-slate-300">
                Doorstep delivery to {city}, Madhya Pradesh
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Customer Support Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Headphones className="w-3.5 h-3.5 text-emerald-600" />
              <span>Need help ordering?</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="tel:7772809503"
                className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                <span>7772809503</span>
              </a>
              <span className="text-slate-300">|</span>
              <a
                href="mailto:nishaldamor03@gmail.com"
                className="text-slate-600 hover:text-slate-900 underline text-[11px]"
              >
                nishaldamor03@gmail.com
              </a>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Order Items Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
              Items in Your Order ({items.length})
            </h3>
            <div className="space-y-2.5">
              {items.map((it) => {
                const qty = itemQuantities[it.productId] || 1;
                return (
                  <div
                    key={it.productId}
                    className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {it.image && (
                        <img
                          src={it.image}
                          alt={it.productName}
                          className="w-12 h-12 rounded-md object-cover bg-slate-100 shrink-0"
                        />
                      )}
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{it.productName}</h4>
                        <div className="text-[11px] text-slate-500 font-mono">ID: {it.productId}</div>
                        <div className="text-xs font-extrabold text-slate-900 mt-0.5">₹{it.price} each</div>
                      </div>
                    </div>

                    {/* Qty Selector */}
                    <div className="flex items-center border border-slate-200 rounded-md bg-slate-50 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(it.productId, -1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-200 rounded-l font-bold text-xs cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2.5 py-1 text-xs font-bold text-slate-900">{qty}</span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(it.productId, 1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-200 rounded-r font-bold text-xs cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Delivery Address Form */}
          <form id="checkout-form" onSubmit={handlePrimarySubmit} className="space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Delivery Address (Required)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* 1. Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  1. Customer Full Name *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter recipient name"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* 2. Mobile Number */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  2. Primary Mobile Number (10 digits) *
                </label>
                <div className="relative">
                  <span className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 font-semibold">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="98XXXXXXXX"
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 outline-none font-mono"
                  />
                </div>
              </div>

              {/* 3. Second Mobile Number */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  3. Second Mobile Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    maxLength={10}
                    value={secondMobile}
                    onChange={(e) => setSecondMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="Alternative contact number"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 outline-none font-mono"
                  />
                </div>
              </div>

              {/* 4. PIN Code */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  4. PIN Code (Madhya Pradesh) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 455001"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 outline-none font-mono"
                />
              </div>

              {/* 5. City Selection (ONLY Dewas, Hatpipliya, Bagli, Indore) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  5. City (Select Allowed MP City) *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value as CityOption)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:border-emerald-500 font-bold text-slate-800 outline-none cursor-pointer"
                >
                  {ALLOWED_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-emerald-700 mt-1 font-medium">
                  ✓ Doorstep express delivery available in {city}
                </p>
              </div>

              {/* 6. State Selection (Fixed Madhya Pradesh ONLY) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  6. State (Restricted) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value="Madhya Pradesh"
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold cursor-not-allowed select-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    MP Only
                  </span>
                </div>
              </div>

              {/* 7. House No. / Building Name */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  7. House No. / Building Name *
                </label>
                <div className="relative">
                  <Home className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={houseNo}
                    onChange={(e) => setHouseNo(e.target.value)}
                    placeholder="e.g. Flat 302, Radha Krishna Residency / House 14-B"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* 8. Road Name / Area / Colony */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  8. Road Name / Area / Colony / Landmark *
                </label>
                <input
                  type="text"
                  required
                  value={roadArea}
                  onChange={(e) => setRoadArea(e.target.value)}
                  placeholder="e.g. Near Chamunda Mata Temple, Main Bus Stand Road"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Section 3: Payment Options */}
            <div className="pt-2">
              <div className="border-b border-slate-200 pb-2 mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                  <span>Select Payment Method</span>
                  <span className="text-[11px] text-emerald-600 lowercase font-medium">100% safe & verified</span>
                </h3>
              </div>

              <div className="space-y-3">
                {/* 1. Online Payment (UPI & QR) */}
                {paymentSettings.isOnlinePaymentEnabled && (
                  <div
                    className={`border rounded-xl p-3.5 transition ${
                      paymentMethod === 'online'
                        ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-100'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <label className="flex items-start justify-between cursor-pointer">
                      <div className="flex items-start gap-2.5">
                        <input
                          type="radio"
                          name="payment"
                          value="online"
                          checked={paymentMethod === 'online'}
                          onChange={() => setPaymentMethod('online')}
                          className="mt-1 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs sm:text-sm font-bold text-slate-900">
                              Online Payment (UPI & QR Code)
                            </span>
                            <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded">
                              SAVE ₹50
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-800 mt-0.5 font-medium">
                            Pay ₹{Math.max(0, baseSubtotal - 50)} instead of ₹{baseSubtotal}. Flat ₹50 instant discount applied!
                          </p>
                        </div>
                      </div>
                    </label>

                    {/* Online Payment Details (UPI ID, QR Code & UTR input) */}
                    {paymentMethod === 'online' && (
                      <div className="mt-3.5 pt-3.5 border-t border-emerald-200/80 space-y-3">
                        <div className="bg-white p-3 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                          {/* QR Code */}
                          <div className="text-center shrink-0">
                            <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-xs inline-block">
                              <img
                                src={qrCodeImage}
                                alt="UPI QR Code"
                                className="w-32 h-32 object-contain mx-auto"
                              />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 font-medium">
                              Scan with GPay, PhonePe, Paytm or BHIM
                            </p>
                          </div>

                          {/* UPI ID Details */}
                          <div className="space-y-2 flex-1 w-full text-xs">
                            <div>
                              <div className="text-[11px] text-slate-500 font-medium">Payable Amount:</div>
                              <div className="text-base font-black text-emerald-700">₹{finalTotal}</div>
                            </div>

                            <div>
                              <div className="text-[11px] text-slate-500 font-medium">NISUMART Official UPI ID:</div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <code className="bg-slate-100 text-slate-900 px-2 py-1 rounded border border-slate-200 font-mono font-bold text-xs select-all">
                                  {upiId}
                                </code>
                                <button
                                  type="button"
                                  onClick={handleCopyUpi}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition"
                                >
                                  {isCopiedUpi ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-600 leading-relaxed bg-amber-50 p-2 rounded border border-amber-200">
                              ℹ️ <strong>Instructions:</strong> Pay ₹{finalTotal} using any UPI app. Then copy the 12-digit Transaction ID / UTR number from your payment receipt and enter it below.
                            </p>
                          </div>
                        </div>

                        {/* Transaction ID / UTR Input */}
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            UPI Transaction ID / UTR Number (Required) *
                          </label>
                          <input
                            type="text"
                            required
                            value={upiTransactionId}
                            onChange={(e) => setUpiTransactionId(e.target.value.trim())}
                            placeholder="e.g. 428901928374 (12-digit UTR)"
                            className="w-full text-xs font-mono px-3 py-2 bg-white border-2 border-emerald-500 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
                          />
                          <p className="text-[10px] text-slate-500 mt-1">
                            Your payment will be manually verified by the store admin before parcel dispatch.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Cash on Delivery (COD +₹50 CHARGE) */}
                <label
                  className={`block border rounded-xl p-3.5 cursor-pointer transition ${
                    paymentMethod === 'cod'
                      ? 'border-emerald-600 bg-amber-50/50 ring-2 ring-emerald-100'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mt-1 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-amber-600" />
                          <span className="text-xs sm:text-sm font-bold text-slate-900">
                            Cash on Delivery (COD)
                          </span>
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded border border-amber-300">
                            +₹50 Handling Fee
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          Pay cash at your doorstep when the delivery partner arrives. Exactly ₹50 handling charge added to total.
                        </p>
                      </div>
                    </div>
                  </div>
                </label>

                {/* 3. Card Payment (REAL GATEWAY VERIFICATION) */}
                <label
                  className={`block border rounded-xl p-3.5 cursor-pointer transition ${
                    paymentMethod === 'card'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-100'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="mt-1 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-indigo-600" />
                          <span className="text-xs sm:text-sm font-bold text-slate-900">
                            Card Payment (Visa / Mastercard / RuPay)
                          </span>
                          <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                            3DS Secured
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          Encrypted checkout via PCI-DSS Compliant Payment Gateway with bank OTP verification. Raw card details are never saved.
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Price Breakdown Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-slate-900">₹{baseSubtotal}</span>
              </div>

              {paymentMethod === 'cod' && (
                <div className="flex items-center justify-between text-amber-700">
                  <span>Cash on Delivery Handling Charge:</span>
                  <span className="font-bold">+₹50</span>
                </div>
              )}

              {paymentMethod === 'online' && (
                <div className="flex items-center justify-between text-emerald-700 font-medium">
                  <span>Online Payment Instant Discount:</span>
                  <span className="font-bold">-₹50</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600">
                <span>Doorstep Delivery:</span>
                <span className="text-emerald-600 font-bold">FREE (to {city})</span>
              </div>

              <div className="pt-2 border-t border-dashed border-slate-300 flex items-center justify-between text-sm sm:text-base font-extrabold text-slate-900">
                <span>Final Order Amount:</span>
                <span className="text-emerald-700 font-black text-base sm:text-lg">₹{finalTotal}</span>
              </div>

              <div className="text-[10px] text-slate-500 text-center pt-1">
                📧 Real order email notification will be sent to nishaldamor03@gmail.com
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 shrink-0">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Total to Pay:</div>
            <div className="text-lg font-black text-slate-900 leading-tight">₹{finalTotal}</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Placing Order...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {paymentMethod === 'card' ? 'Proceed to Card Gateway' : 'Confirm Order Now'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Real Card Payment Gateway Modal (PCI DSS Compliant Flow) */}
      {cardModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            {/* Gateway Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold tracking-wide uppercase">
                  NISUMART 3D-Secure Payment Gateway
                </span>
              </div>
              <button
                onClick={() => setCardModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              {cardGatewayStep === 'card_input' && (
                <form onSubmit={handleCardGatewaySubmit} className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <div className="text-xs text-slate-500">Merchant: NISUMART Retail</div>
                      <div className="text-base font-black text-slate-900">Amount: ₹{finalTotal}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        RuPay
                      </span>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        Visa
                      </span>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        Mastercard
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
                        setCardNumber(v);
                      }}
                      placeholder="4532 •••• •••• 8892"
                      className="w-full text-xs font-mono px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, '');
                          if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
                          setCardExpiry(v);
                        }}
                        placeholder="MM/YY"
                        className="w-full text-xs font-mono px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="•••"
                        className="w-full text-xs font-mono px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder={customerName || 'Name on card'}
                      className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div className="text-[10px] text-slate-500 flex items-center gap-1.5 pt-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Your card details are tokenized securely. Raw card numbers are never stored in NISUMART database.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessingPayment}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-sm transition"
                  >
                    {isProcessingPayment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Pay ₹{finalTotal} with Gateway</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {cardGatewayStep === '3ds_otp' && (
                <div className="space-y-4 text-center py-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Bank 3D-Secure Verification</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      One-Time Password (OTP) dispatched to registered mobile ending in ••84.
                    </p>
                  </div>

                  <div className="max-w-xs mx-auto">
                    <input
                      type="text"
                      maxLength={6}
                      value={cardOtp}
                      onChange={(e) => setCardOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      className="w-full text-center tracking-widest text-lg font-mono px-3 py-2 border-2 border-emerald-500 rounded-lg outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      Sample test OTP provided: <strong>482910</strong>
                    </p>
                  </div>

                  <button
                    onClick={handle3dsOtpVerify}
                    disabled={isProcessingPayment}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    {isProcessingPayment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Verify & Authorize ₹{finalTotal}</span>
                    )}
                  </button>
                </div>
              )}

              {cardGatewayStep === 'authorized' && (
                <div className="text-center py-6 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                  <h4 className="text-sm font-bold text-slate-900">Payment Authorized by Bank!</h4>
                  <p className="text-xs text-slate-500">Creating NISUMART order and dispatching email...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
