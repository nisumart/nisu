import React, { useState } from 'react';
import { Order } from '../types';
import { X, Package, Search, Phone, MapPin, Calendar, Clock, Loader2, ArrowRight } from 'lucide-react';

interface CustomerOrdersModalProps {
  recentOrders: Order[];
  onClose: () => void;
}

export const CustomerOrdersModal: React.FC<CustomerOrdersModalProps> = ({
  recentOrders,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Order[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/customer-orders?query=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to search orders');
      setSearchResults(data.orders || []);
    } catch (err: any) {
      setSearchError(err.message || 'Error looking up orders');
    } finally {
      setIsSearching(false);
    }
  };

  const displayedOrders = searchResults !== null ? searchResults : recentOrders;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Track My Orders</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar for Orders */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Lookup by Mobile (e.g. 9826...) or Order ID..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Find</span>}
            </button>
            {searchResults !== null && (
              <button
                type="button"
                onClick={() => {
                  setSearchResults(null);
                  setSearchQuery('');
                }}
                className="px-2.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Reset
              </button>
            )}
          </form>
          {searchError && (
            <p className="text-rose-600 text-xs mt-1.5">{searchError}</p>
          )}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3.5">
          {displayedOrders && displayedOrders.length > 0 ? (
            displayedOrders.map((order) => (
              <div
                key={order.id || order.orderId}
                className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-2.5"
              >
                {/* Order Top Bar */}
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {order.orderId}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'Shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.status || 'Confirmed'}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-1.5">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-slate-800 font-medium truncate max-w-[280px]">
                        {it.productName} × {it.quantity}
                      </span>
                      <span className="font-bold text-slate-900 shrink-0">
                        ₹{it.price * it.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer details */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>
                      {order.city}, {order.state}
                    </span>
                  </div>
                  <div className="text-slate-900 font-extrabold text-xs">
                    Total: ₹{order.finalAmount}{' '}
                    <span className="text-[10px] text-slate-500 font-normal uppercase">
                      ({order.paymentMethod})
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No orders found</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                Place an order or search using your registered 10-digit mobile number above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
