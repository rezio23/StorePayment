import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';

const PRODUCT_URL = import.meta.env.VITE_PRODUCT_URL;
const CART_URL = `${import.meta.env.VITE_API_URL}/user/cart`;

export default function Store() {
  const { data: response, loading, error } = useFetch(PRODUCT_URL);
  const [addingId, setAddingId] = useState(null);

  const products = response?.data;

  const addToCart = async (product) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setAddingId(product.ProID);

    try {
      const res = await fetch(CART_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ProID: product.ProID,
          Qty: 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add to cart');
    } catch (err) {
      console.error('Add to cart failed:', err.message);
    } finally {
      setAddingId(null);
    }
  };

  if (loading) return <p className="text-center text-gray-500 mt-10">Loading products...</p>;
  if (error) return <p className="text-center text-red-600 mt-10">Error: {error}</p>;
  if (!products || products.length === 0) return <p className="text-center text-gray-500 mt-10">No products found.</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Store</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.ProID}
            className="bg-white rounded-xl shadow hover:shadow-lg transition p-5 flex flex-col"
          >
            <div className="h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400">
              No image
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{product.ProName}</h3>
            <p className="text-gray-500 text-sm mt-1">In stock: {product.Qty}</p>
            <p className="text-xl font-bold text-indigo-600 mt-auto pt-4">${product.Price}</p>
            <button
              onClick={() => addToCart(product)}
              disabled={addingId === product.ProID || product.Qty <= 0}
              className="mt-3 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {addingId === product.ProID ? 'Adding...' : product.Qty <= 0 ? 'Out of stock' : 'Add to Cart'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
