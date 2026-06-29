import { useState, useEffect, useCallback } from 'react';

const CART_URL = `${import.meta.env.VITE_API_URL}/user/cart`;
const UPDATE_URL = `${import.meta.env.VITE_API_URL}/user/cart/update`;
const DELETE_URL = `${import.meta.env.VITE_API_URL}/user/cart/delete`;

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to view cart');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(CART_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  const updateQty = async (cartItem, newQty) => {
    if (newQty < 1) return;

    const token = localStorage.getItem('token');

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
      setItems((prev) =>
        prev.map((item) =>
          item.CartID === cartItem.CartID
            ? { ...item, Qty: cartItem.Qty, Total: cartItem.Total }
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
        body: JSON.stringify({
          CartID: cartItem.CartID,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Remove failed');
    } catch (err) {
      console.error('Remove cart failed:', err.message);
      setItems((prev) => [...prev, cartItem].sort((a, b) => a.CartID.localeCompare(b.CartID)));
    }
  };

  const total = items.reduce((sum, item) => sum + Number(item.Total || 0), 0);

  if (loading) return <p className="text-center text-gray-500 mt-10">Loading cart...</p>;
  if (error) return <p className="text-center text-red-600 mt-10">Error: {error}</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Shopping Cart</h2>
      {items.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-10 text-center">
          <p className="text-gray-500">Your cart is empty.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.CartID}
              className="bg-white rounded-xl shadow p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <h4 className="text-lg font-semibold text-gray-800">{item.Product?.ProName}</h4>
                <p className="text-gray-500 text-sm">${Number(item.Product?.Price || 0).toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => updateQty(item, item.Qty - 1)}
                    disabled={item.Qty <= 1}
                    className="px-3 py-1 hover:bg-gray-100 disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="px-3 font-medium">{item.Qty}</span>
                  <button
                    onClick={() => updateQty(item, item.Qty + 1)}
                    className="px-3 py-1 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <p className="font-semibold text-gray-800 w-20 text-right">${Number(item.Total || 0).toFixed(2)}</p>
                <button
                  onClick={() => removeItem(item)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="bg-white rounded-xl shadow p-5 flex justify-between items-center">
            <span className="text-lg text-gray-600">Grand Total</span>
            <span className="text-2xl font-bold text-indigo-600">${total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
