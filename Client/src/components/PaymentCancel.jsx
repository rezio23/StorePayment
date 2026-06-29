import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const CANCEL_URL = `${import.meta.env.VITE_API_URL}/user/payment/cancel`;

export default function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState({ loading: true, error: null });

  useEffect(() => {
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      setStatus({ loading: false, error: null });
      return;
    }

    fetch(`${CANCEL_URL}?order_id=${encodeURIComponent(orderId)}`)
      .then((res) => res.json())
      .then(() => setStatus({ loading: false, error: null }))
      .catch((err) => setStatus({ loading: false, error: err.message }));
  }, [searchParams]);

  if (status.loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <svg className="w-16 h-16 text-slate-900 mx-auto mb-6 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <h3 className="text-xl font-semibold text-slate-900">Cancelling order...</h3>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
        <svg className="w-10 h-10 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-3xl font-bold text-slate-900 mb-2">Payment Cancelled</h2>
      <p className="text-slate-500 mb-8">
        Your order was not completed. You can review your cart and try again.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Back to Cart
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
