import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const CART_URL = `${import.meta.env.VITE_API_URL}/user/cart`;
const UPDATE_URL = `${import.meta.env.VITE_API_URL}/user/cart/update`;
const DELETE_URL = `${import.meta.env.VITE_API_URL}/user/cart/delete`;

function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3">
      <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="text-slate-400 hover:text-white">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view your cart');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(CART_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load cart');

      setItems(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const updateQty = async (cartItem, newQty) => {
    if (newQty < 1) return;

    const token = localStorage.getItem('token');
    const previousQty = cartItem.Qty;
    const previousTotal = cartItem.Total;

    setItems((prev) =>
      prev.map((item) =>
        item.CartID === cartItem.CartID
          ? { ...item, Qty: newQty, Total: Number(item.Product?.Price || 0) * newQty }
          : item
      )
    );

    try {
      const res = await fetch(UPDATE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          CartID: cartItem.CartID,
          Qty: newQty,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
    } catch (err) {
      console.error('Update cart failed:', err.message);
      showToast(err.message || 'Failed to update quantity');
      setItems((prev) =>
        prev.map((item) =>
          item.CartID === cartItem.CartID
            ? { ...item, Qty: previousQty, Total: previousTotal }
            : item
        )
      );
    }
  };

  const removeItem = async (cartItem) => {
    const token = localStorage.getItem('token');

    setItems((prev) => prev.filter((item) => item.CartID !== cartItem.CartID));

    try {
      const res = await fetch(DELETE_URL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ CartID: cartItem.CartID }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Remove failed');
      showToast(`${cartItem.Product?.ProName || 'Item'} removed from cart`);
    } catch (err) {
      console.error('Remove cart failed:', err.message);
      showToast(err.message || 'Failed to remove item');
      setItems((prev) => [...prev, cartItem].sort((a, b) => a.CartID.localeCompare(b.CartID)));
    }
  };

  const subtotal = items.reduce((sum, item) => sum + Number(item.Total || 0), 0);
  const itemCount = items.reduce((sum, item) => sum + Number(item.Qty || 0), 0);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="h-8 bg-slate-200 rounded w-48 mb-8 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 flex gap-4 animate-pulse">
                <div className="w-20 h-20 bg-slate-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-slate-200 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 rounded w-20" />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-6 h-fit animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/2 mb-4" />
            <div className="h-4 bg-slate-200 rounded mb-2" />
            <div className="h-10 bg-slate-200 rounded mt-4" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Something went wrong</h3>
        <p className="text-slate-500 mb-6">{error}</p>
        <button
          onClick={fetchCart}
          className="bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-slate-800 transition"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Toast message={toast} onClose={() => setToast(null)} />

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Shopping Cart</h2>
        <span className="text-slate-500">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <svg className="w-20 h-20 text-slate-200 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Your cart is empty</h3>
          <p className="text-slate-500 mb-6">Looks like you haven't added anything yet.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.CartID}
                className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col sm:flex-row gap-5"
              >
                <div className="w-full sm:w-24 h-24 bg-slate-100 rounded-xl flex-shrink-0 overflow-hidden">
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
                  <h4 className="text-lg font-semibold text-slate-900 truncate">{item.Product?.ProName}</h4>
                  <p className="text-slate-500 text-sm">${Number(item.Product?.Price || 0).toFixed(2)} each</p>

                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center border border-slate-300 rounded-lg">
                      <button
                        onClick={() => updateQty(item, item.Qty - 1)}
                        disabled={item.Qty <= 1}
                        className="px-3 py-1.5 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-3 font-medium min-w-[2rem] text-center">{item.Qty}</span>
                      <button
                        onClick={() => updateQty(item, item.Qty + 1)}
                        className="px-3 py-1.5 hover:bg-slate-100 transition"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item)}
                      className="text-slate-600 hover:text-slate-900 text-sm font-medium flex items-center gap-1 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>

                <div className="sm:text-right">
                  <p className="text-lg font-bold text-slate-900">${Number(item.Total || 0).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between text-lg font-bold text-slate-900">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full mt-6 bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Proceed to Checkout
            </Link>

            <Link
              to="/"
              className="block text-center mt-4 text-slate-600 hover:text-slate-900 text-sm font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
