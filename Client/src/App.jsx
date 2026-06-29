import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Store from './components/Store';
import Cart from './components/Cart';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

function App() {
  const { user, login, register, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-indigo-600">Store</h1>
            <p className="text-gray-500 mt-2">Login or create an account to continue</p>
          </div>
          <LoginForm onLogin={login} />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-slate-50 px-2 text-gray-500">New here?</span>
            </div>
          </div>
          <RegisterForm onRegister={register} />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-indigo-600">Store</Link>
          <div className="flex items-center gap-6">
            <span className="text-gray-600 hidden sm:inline">Welcome, {user.UserName || user.Email}</span>
            <nav className="flex items-center gap-4">
              <Link to="/" className="text-gray-700 hover:text-indigo-600 font-medium">Store</Link>
              <Link to="/cart" className="text-gray-700 hover:text-indigo-600 font-medium">Cart</Link>
              <button
                onClick={logout}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="pb-12">
        <Routes>
          <Route path="/" element={<Store />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
