import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function Login() {
  const { login, loading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const mapLoginErrorToToast = (err) => {
    if (!err.response) {
      return { type: "error", message: "🌐 Unable to connect. Check your internet connection." };
    }

    const status = err.response.status;
    const message = String(err.response.data?.message || "").toLowerCase();

    if (status === 400) {
      return { type: "warning", message: "⚠️ Email and password are required." };
    }
    if (status === 404 || message.includes("user not found")) {
      return { type: "error", message: "❌ No user exists with this email address." };
    }
    if (status === 401 || message.includes("incorrect password")) {
      return { type: "error", message: "🔒 The password you entered is not correct." };
    }
    if (status === 403 || message.includes("verify")) {
      return { type: "warning", message: "📩 Email verification required. Check your inbox." };
    }
    if (status === 429) {
      return { type: "error", message: "🚫 Too many login attempts. Please try again later." };
    }
    return { type: "error", message: "🌐 Something went wrong. Please try again." };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      showToast("⚠️ Email and password are required.", { type: "warning" });
      return;
    }

    if (!isValidEmail(form.email)) {
      showToast("📧 This email format is not valid.", { type: "warning" });
      return;
    }

    try {
      await login(form);
      showToast("✅ Login successful. Welcome back!", { type: "success" });
      navigate("/dashboard");
    } catch (err) {
      const toastConfig = mapLoginErrorToToast(err);
      showToast(toastConfig.message, { type: toastConfig.type });
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h2 className="text-2xl font-semibold">Welcome Back</h2>
        <p className="mt-1 text-sm text-slate-600">Sign in to continue.</p>
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          First load may take 1-2 minutes. Please stay on this page while we finish loading.
        </div>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                className="input pr-16"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 text-sm font-medium text-accent"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            <Link className="text-accent" to="/forgot-password">
              Forgot password?
            </Link>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                Signing in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
