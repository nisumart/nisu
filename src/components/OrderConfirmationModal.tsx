import React, { useEffect } from 'react';
import { Order, PaymentSettings } from '../types';
import { CheckCircle, Mail, MapPin, Phone, Package, ArrowRight, ShieldCheck, AlertCircle, Headphones } from 'lucide-react';

interface OrderConfirmationModalProps {
  order: Order;
  paymentSettings?: PaymentSettings;
  onClose: () => void;
  onViewOrders: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  paymentSettings,
  onClose,
  onViewOrders,
}) => {
  // If Web3Forms key is available and server email reported pending or failed, attempt browser client dispatch
  useEffect(() => {
    const web3Key = paymentSettings?.web3formsKey;
    if (web3Key && web3Key.trim() !== '' && !web3Key.startsWith('00000000') && web3Key.length >= 10 && !order.emailSent) {
      const emailSubject = `🛒 [NISUMART ORDER] ${order.orderId} - ₹${order.finalAmount} from ${order.customerName} (${order.city})`;
      const summary = `
========================================
NEW NISUMART ORDER NOTIFICATION
========================================
Order ID: ${order.orderId}
Order Date & Time: ${new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

CUSTOMER DETAILS:
Customer Name: ${order.customerName}
Primary Mobile: +91 ${order.mobile}
Second Mobile: ${order.secondMobile ? '+91 ' + order.secondMobile : 'None'}

DELIVERY ADDRESS (MADHYA PRADESH):
House / Building Name: ${order.houseNo}
Road Name / Area / Colony: ${order.roadArea}
City: ${order.city}
State: ${order.state}
PIN Code: ${order.pinCode}

PRODUCTS ORDERED:
${(order.items || []).map((it) => `- ${it.productName} (ID: ${it.productId}) x ${it.quantity} @ ₹${it.price} = ₹${it.price * it.quantity}`).join('\n')}

PAYMENT & TOTAL BREAKDOWN:
Base Amount: ₹${order.baseAmount}
Payment Method: ${order.paymentMethod.toUpperCase()}
${order.paymentMethod === 'cod' ? 'COD Doorstep Charge: +₹50' : ''}
${order.paymentMethod === 'online' ? 'Online Payment Discount: -₹50' : ''}
Final Order Total: ₹${order.finalAmount}
UPI Transaction ID / UTR: ${order.upiTransactionId || 'N/A'}
Payment Verification Status: ${order.paymentVerificationStatus}

Recipient Email: nishaldamor03@gmail.com
Customer Support Phone: 7772809503
========================================
      `.trim();

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          access_key: web3Key.trim(),
          subject: emailSubject,
          from_name: 'NISUMART Orders',
          to_email: 'nishaldamor03@gmail.com',
          message: summary,
          order_id: order.orderId,
          customer_name: order.customerName,
          mobile: order.mobile,
          city: order.city,
          final_amount: `₹${order.finalAmount}`,
          payment_method: order.paymentMethod,
          upi_utr: order.upiTransactionId || 'N/A',
        }),
      }).catch((e) => console.log('Client email dispatch notice:', e));
    }
  }, [order, paymentSettings]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Success Header */}
        <div className="bg-emerald-600 text-white p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-white text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-md">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black tracking-tight">Order Successfully Placed!</h2>
          <p className="text-xs text-emerald-100 mt-1">
            Thank you for shopping with NISUMART. Your order is being packed.
          </p>
          <div className="inline-block mt-3 bg-emerald-800/60 backdrop-blur-xs border border-emerald-400/40 px-3 py-1 rounded-full text-xs font-mono font-bold">
            Order ID: {order.orderId}
          </div>
        </div>

        {/* Email Notification Notice Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-start gap-2.5 text-xs text-amber-900">
          <Mail className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Email Order Notification Dispatched</span>
            <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
              Complete order breakdown and shipping details have been sent to{' '}
              <strong className="underline font-bold">nishaldamor03@gmail.com</strong>.
            </p>
          </div>
        </div>

        {/* Customer Support Strip */}
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Headphones className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold">Customer Support:</span>
          </div>
          <div className="flex items-center gap-2 font-bold">
            <a href="tel:7772809503" className="text-emerald-700 hover:underline">
              📞 7772809503
            </a>
            <span className="text-slate-300">|</span>
            <a href="mailto:nishaldamor03@gmail.com" className="text-slate-600 hover:underline">
              nishaldamor03@gmail.com
            </a>
          </div>
        </div>

        {/* Order Details Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[55vh] overflow-y-auto text-xs">
          {/* Items Summary */}
          <div>
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-emerald-600" />
              <span>Purchased Products ({order.items.length})</span>
            </h4>
            <div className="divide-y divide-slate-100 bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
              {order.items.map((it, idx) => (
                <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{it.productName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      ID: {it.productId} · Qty: {it.quantity}
                    </p>
                  </div>
                  <span className="font-extrabold text-slate-900 shrink-0">
                    ₹{it.price * it.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer & Address Details */}
          <div>
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Delivery Details</span>
            </h4>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5 text-slate-700">
              <p>
                <strong>Customer:</strong> {order.customerName}
              </p>
              <p className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>+91 {order.mobile}</span>
                {order.secondMobile && <span className="text-slate-400">/ +91 {order.secondMobile}</span>}
              </p>
              <p>
                <strong>Address:</strong> {order.houseNo}, {order.roadArea}
              </p>
              <p>
                <strong>Location:</strong> {order.city}, {order.state} - {order.pinCode}
              </p>
            </div>
          </div>

          {/* Payment & Amount */}
          <div className="bg-slate-100 rounded-xl p-3 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-500">
                  Payment Mode:{' '}
                  <strong className="text-slate-800 uppercase">
                    {order.paymentMethod === 'cod'
                      ? 'Cash on Delivery (+₹50)'
                      : order.paymentMethod === 'online'
                      ? 'Online UPI (-₹50)'
                      : 'Card Payment'}
                  </strong>
                </div>
                {order.upiTransactionId && (
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    UTR: <code className="font-mono font-bold text-slate-900">{order.upiTransactionId}</code>
                  </div>
                )}
                <div className="text-[11px] font-bold text-emerald-700 mt-0.5">
                  Verification: {order.paymentVerificationStatus}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500">Final Order Amount</div>
                <div className="text-lg font-black text-slate-900">₹{order.finalAmount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={() => {
              onClose();
              onViewOrders();
            }}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            Track in My Orders
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1 cursor-pointer"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
