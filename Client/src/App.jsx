import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Store from './components/Store';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentCancel from './components/PaymentCancel';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

function App() {
  const { user, login, register, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">Welcome to DS Store</h1>
            <p className="text-slate-500 mt-2">Login or create an account to start shopping</p>
          </div>
          <LoginForm onLogin={login} />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-slate-50 px-2 text-slate-500">New here?</span>
            </div>
          </div>
          <RegisterForm onRegister={register} />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-slate-900">
              DS Store
            </Link>
            <div className="flex items-center gap-4 sm:gap-6">
              <span className="text-slate-500 hidden md:inline text-sm">Welcome, {user.UserName || user.Email}</span>
              <nav className="flex items-center gap-1 sm:gap-2">
                <Link
                  to="/"
                  className="px-3 py-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium transition"
                >
                  Store
                </Link>
                <Link
                  to="/cart"
                  className="px-3 py-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium transition"
                >
                  Cart
                </Link>
                <button
                  onClick={logout}
                  className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition font-medium"
                >
                  Logout
                </button>
              </nav>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Store />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-slate-200 mt-12">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-slate-900 font-semibold">DS Store</div>
              <p className="text-slate-500 text-sm">© {new Date().getFullYear()} DS Store. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
