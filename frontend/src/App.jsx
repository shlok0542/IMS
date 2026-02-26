import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
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

export default function App() {
  return (
    <div className="min-h-screen bg-app">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
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
    </div>
  );
}
