import React from 'react';
import { CartItem } from '../types';
import { X, ShoppingBag, Trash2, ArrowRight, Zap, Banknote } from 'lucide-react';

interface CartModalProps {
  cart: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  cart,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Shopping Cart ({cart.length})</h3>
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
          {cart.length > 0 ? (
            cart.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-14 h-14 rounded-lg object-cover bg-slate-100 shrink-0"
                  />
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{product.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">ID: {product.productId}</p>
                    <div className="text-xs font-extrabold text-slate-900 mt-1">
                      ₹{product.price} × {quantity} ={' '}
                      <span className="text-emerald-700">₹{product.price * quantity}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                    <button
                      onClick={() => onUpdateQuantity(product.productId, -1)}
                      className="px-2 py-1 text-slate-600 hover:bg-slate-200 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="px-2 text-xs font-bold text-slate-900">{quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(product.productId, 1)}
                      className="px-2 py-1 text-slate-600 hover:bg-slate-200 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => onRemoveItem(product.productId)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">Your cart is empty</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Explore our catalog and add items to your cart!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
            {/* Savings preview */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-emerald-900">
                <div className="font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Online / UPI</span>
                </div>
                <div className="mt-0.5 font-bold">
                  ₹{Math.max(0, subtotal - 50)} <span className="text-[10px] text-emerald-700">(Save ₹50)</span>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg text-amber-900">
                <div className="font-bold flex items-center gap-1">
                  <Banknote className="w-3.5 h-3.5 text-amber-600" />
                  <span>Cash on Delivery</span>
                </div>
                <div className="mt-0.5 font-bold">
                  ₹{subtotal + 50} <span className="text-[10px] text-amber-700">(+₹50 fee)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">Cart Subtotal</span>
                <div className="text-lg font-black text-slate-900">₹{subtotal}</div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
