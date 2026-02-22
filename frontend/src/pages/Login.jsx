import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h2 className="text-2xl font-semibold">Welcome Back</h2>
        <p className="mt-1 text-sm text-slate-600">Sign in to continue.</p>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="text-sm text-slate-600">
            <Link className="text-accent" to="/forgot-password">
              Forgot password?
            </Link>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
