import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import RecoverPassword from "./pages/RecoverPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Products from "./pages/Products.jsx";
import ProductForm from "./pages/ProductForm.jsx";
import Orders from "./pages/Orders.jsx";
import CreateOrder from "./pages/CreateOrder.jsx";
import Purchases from "./pages/Purchases.jsx";
import Reports from "./pages/Reports.jsx";
import StockLedger from "./pages/StockLedger.jsx";
import LowStock from "./pages/LowStock.jsx";
import ProfileSettings from "./pages/ProfileSettings.jsx";

function HomeGate() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return <div className="card p-4 text-sm text-slate-600">Checking session...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Home />;
}

export default function App() {
  const { loading, initializing } = useAuth();

  return (
    <div className="min-h-screen bg-app">
      {(loading || initializing) && (
        <div className="fixed left-0 right-0 top-0 z-[60]">
          <div className="h-1 w-full bg-slate-200/70 dark:bg-slate-700/70">
            <div className="loading-bar h-full bg-accent" />
          </div>
        </div>
      )}

      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-8">
        <Routes>
          <Route path="/" element={<HomeGate />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/recover-password" element={<RecoverPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/new"
            element={
              <ProtectedRoute>
                <ProductForm mode="create" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id/edit"
            element={
              <ProtectedRoute>
                <ProductForm mode="edit" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/new"
            element={
              <ProtectedRoute>
                <CreateOrder />
              </ProtectedRoute>
            }
          />

          <Route
            path="/purchases"
            element={
              <ProtectedRoute>
                <Purchases />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/stock-ledger"
            element={
              <ProtectedRoute>
                <StockLedger />
              </ProtectedRoute>
            }
          />

          <Route
            path="/low-stock"
            element={
              <ProtectedRoute>
                <LowStock />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {initializing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/75 backdrop-blur-sm dark:bg-slate-900/70">
          <div className="card w-full max-w-sm p-6 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-accent dark:border-slate-700" />
            <p className="mt-4 text-sm text-slate-700 dark:text-slate-300">
              Loading your workspace. Please wait...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
