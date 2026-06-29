import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CART_URL = `${import.meta.env.VITE_API_URL}/user/cart`;
const CHECKOUT_URL = `${import.meta.env.VITE_API_URL}/user/payment/checkout`;

function Skeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-48 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 flex gap-4">
              <div className="w-20 h-20 bg-slate-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-slate-200 rounded w-1/3" />
                <div className="h-4 bg-slate-200 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 h-fit space-y-3">
          <div className="h-6 bg-slate-200 rounded w-1/2" />
          <div className="h-4 bg-slate-200 rounded" />
          <div className="h-4 bg-slate-200 rounded" />
          <div className="h-12 bg-slate-200 rounded mt-4" />
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to continue checkout');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(CART_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load cart');

      const cartItems = data.data || [];
      if (cartItems.length === 0) {
        navigate('/cart');
        return;
      }

      setItems(cartItems);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setProcessing(true);
    setError(null);

    try {
      const res = await fetch(CHECKOUT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Checkout failed');

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + Number(item.Total || 0), 0);
  const itemCount = items.reduce((sum, item) => sum + Number(item.Qty || 0), 0);

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Checkout unavailable</h3>
        <p className="text-slate-500 mb-6">{error}</p>
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-slate-800 transition"
        >
          Back to Cart
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link
          to="/cart"
          className="text-slate-500 hover:text-slate-900 transition flex items-center gap-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Cart
        </Link>
        <span className="text-slate-300">/</span>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Checkout</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Order Items ({itemCount})
            </h3>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.CartID} className="flex gap-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-xl flex-shrink-0 overflow-hidden">
                    {item.Product?.ImageURL ? (
                      <img
                        src={item.Product.ImageURL}
                        alt={item.Product.ProName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 truncate">{item.Product?.ProName}</h4>
                    <p className="text-sm text-slate-500">
                      ${Number(item.Product?.Price || 0).toFixed(2)} × {item.Qty}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">${Number(item.Total || 0).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h3>
          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="border-t border-slate-100 pt-3 flex justify-between text-lg font-bold text-slate-900">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={processing || items.length === 0}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Pay with Stripe
              </>
            )}
          </button>

          <p className="text-xs text-slate-500 text-center mt-4">
            You will be redirected to Stripe to complete your payment securely.
          </p>
        </div>
      </div>
    </div>
  );
}
