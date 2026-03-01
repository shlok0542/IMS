import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function RecoverPassword() {
  const { recoverPassword } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    name: "",
    company: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const data = await recoverPassword(form);
      setMessage(data.message || "Password reset successful");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Recovery failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h2 className="text-2xl font-semibold">Alternate Password Recovery</h2>
        <p className="mt-1 text-sm text-slate-600">
          Verify your identity using registered account details, then set a new password.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div>
            <label className="label">Registered Email</label>
            <input className="input" type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">Registered Name</label>
            <input className="input" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">Registered Company</label>
            <input className="input" name="company" value={form.company} onChange={handleChange} required />
          </div>

          <div>
            <label className="label">New Password</label>
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

          <div>
            <label className="label">Confirm Password</label>
            <div className="relative">
              <input
                className="input pr-16"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 text-sm font-medium text-accent"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {message && <p className="text-sm text-emerald-600">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Recovering..." : "Recover Password"}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          Back to <Link to="/login" className="text-accent">Login</Link>
        </div>
      </div>
    </div>
  );
}
