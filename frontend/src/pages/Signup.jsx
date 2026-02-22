import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "admin" });
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
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h2 className="text-2xl font-semibold">Create Account</h2>
        <p className="mt-1 text-sm text-slate-600">Start managing your inventory in minutes.</p>
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
          <div>
            <label className="label">Role</label>
            <select className="input" name="role" value={form.role} onChange={handleChange}>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
