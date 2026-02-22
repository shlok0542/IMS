import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const data = await forgotPassword({ email });
      setMessage(data.message || "Reset link generated.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h2 className="text-2xl font-semibold">Forgot Password</h2>
        <p className="mt-1 text-sm text-slate-600">Enter your account email to receive a reset link.</p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {message && <p className="text-sm text-emerald-600">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Submitting..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          Back to <Link to="/login" className="text-accent">Login</Link>
        </div>
      </div>
    </div>
  );
}
