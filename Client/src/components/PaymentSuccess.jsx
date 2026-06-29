import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const SUCCESS_URL = `${import.meta.env.VITE_API_URL}/user/payment/success`;

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setStatus({ loading: false, error: 'Missing session ID', data: null });
      return;
    }

    fetch(`${SUCCESS_URL}?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Payment verification failed');
        }
        return data;
      })
      .then((data) => {
        setStatus({ loading: false, error: null, data });
      })
      .catch((err) => {
        console.error('Payment success error:', err.message);
        setStatus({ loading: false, error: err.message, data: null });
      });
  }, [searchParams]);

  if (status.loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <svg className="w-16 h-16 text-indigo-600 mx-auto mb-6 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-800">Verifying payment...</h3>
      </div>
    );
  }

  if (status.error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Payment verification failed</h3>
        <p className="text-gray-500 mb-6">{status.error}</p>
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          Back to Cart
        </Link>
      </div>
    );
  }

  const { orderID, sessionID, GrandPrice } = status.data || {};

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
      <p className="text-gray-500 mb-6">Thank you for your purchase. Your order has been confirmed.</p>

      <div className="bg-white rounded-2xl shadow-sm p-6 text-left border border-gray-100 mb-8">
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="text-gray-500">Order ID</span>
          <span className="font-medium text-gray-800">{orderID || 'N/A'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="text-gray-500">Session ID</span>
          <span className="font-medium text-gray-800 truncate max-w-[180px]">{sessionID || 'N/A'}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-500">Total Paid</span>
          <span className="font-bold text-indigo-600">${Number(GrandPrice || 0).toFixed(2)}</span>
        </div>
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Continue Shopping
      </Link>
    </div>
  );
}
