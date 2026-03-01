import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", company: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signup(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_1.05fr] lg:items-stretch">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-500 via-sky-500 to-cyan-500 p-8 text-white shadow-sm">
        <div className="absolute -left-10 top-12 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute -right-10 bottom-10 h-40 w-40 rounded-full bg-cyan-200/30 blur-2xl" />
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/85">Create Workspace</p>
          <h2 className="mt-3 text-4xl font-bold leading-tight">Start your inventory system in minutes.</h2>
          <p className="mt-4 text-sm text-white/90">
            Build a single source of truth for stock, orders, purchasing, and reports with role-ready workflows.
          </p>
          <div className="mt-6 grid gap-3 text-sm text-white/90">
            <div className="rounded-xl bg-white/15 px-3 py-2">Add products and suppliers quickly</div>
            <div className="rounded-xl bg-white/15 px-3 py-2">Track orders across channels with live status</div>
            <div className="rounded-xl bg-white/15 px-3 py-2">Generate reports for smarter decisions</div>
          </div>
        </div>
      </div>

      <div className="card p-6 md:p-8">
        <h2 className="text-2xl font-semibold">Create Account</h2>
        <p className="mt-1 text-sm text-slate-600">Set up your company workspace and start managing operations.</p>
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          First load may take 1-2 minutes. Please stay on this page while we finish loading.
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div>
            <label className="label">Name</label>
            <input className="input" name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div>
            <label className="label">Email</label>
            <input className="input" type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>

          <div>
            <label className="label">Company</label>
            <input className="input" name="company" value={form.company} onChange={handleChange} required />
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

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                Creating...
              </span>
            ) : (
              "Sign Up"
            )}
          </button>

          <p className="text-sm text-slate-600">
            Already have an account? <Link to="/login" className="text-accent">Login</Link>
          </p>
        </form>
      </div>
    </section>
  );
}