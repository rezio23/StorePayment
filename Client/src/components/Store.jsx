import { useState, useMemo } from 'react';
import { useFetch } from '../hooks/useFetch';

const PRODUCT_URL = import.meta.env.VITE_PRODUCT_URL;
const CART_URL = `${import.meta.env.VITE_API_URL}/user/cart`;

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow p-5 flex flex-col animate-pulse">
      <div className="h-32 bg-gray-200 rounded-lg mb-4" />
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
      <div className="mt-auto flex items-center justify-between pt-4">
        <div className="h-6 bg-gray-200 rounded w-16" />
        <div className="h-9 bg-gray-200 rounded w-24" />
      </div>
    </div>
  );
}

function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in">
      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-white">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function Store() {
  const { data: response, loading, error } = useFetch(PRODUCT_URL);
  const [search, setSearch] = useState('');
  const [addingId, setAddingId] = useState(null);
  const [toast, setToast] = useState(null);

  const products = useMemo(() => response?.data || [], [response?.data]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) =>
      p.ProName?.toLowerCase().includes(term)
    );
  }, [products, search]);

  const addToCart = async (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setToast('Please log in to add items to your cart');
      return;
    }

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

      setToast(`${product.ProName} added to cart`);
    } catch (err) {
      setToast(err.message || 'Failed to add to cart');
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Failed to load products</h3>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Toast message={toast} onClose={() => setToast(null)} />

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 sm:p-12 mb-10">
        <div className="relative z-10 max-w-xl">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">Discover Our Collection</h2>
          <p className="text-indigo-100 text-lg mb-6">Handpicked products with quality you can trust. Shop now and enjoy a seamless checkout experience.</p>
          <div className="flex items-center gap-2 text-sm font-medium bg-white/20 backdrop-blur-sm w-fit px-4 py-2 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            {products.length} {products.length === 1 ? 'product' : 'products'} available
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h3 className="text-xl font-semibold text-gray-800">Products</h3>
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">No products found</h3>
          <p className="text-gray-500">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.ProID}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-5 flex flex-col border border-gray-100"
            >
              <div className="relative overflow-hidden rounded-xl mb-4 bg-gray-100 aspect-[4/3]">
                {product.ImageURL ? (
                  <img
                    src={product.ImageURL}
                    alt={product.ProName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">No image</span>
                  </div>
                )}
                {product.Qty <= 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                      Out of stock
                    </span>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1">{product.ProName}</h3>
              <p className="text-gray-500 text-sm mb-3">{product.Qty > 0 ? `${product.Qty} in stock` : 'Out of stock'}</p>

              <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xl font-bold text-indigo-600">${Number(product.Price).toFixed(2)}</span>
                <button
                  onClick={() => addToCart(product)}
                  disabled={addingId === product.ProID || product.Qty <= 0}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  {addingId === product.ProID ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Adding...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
