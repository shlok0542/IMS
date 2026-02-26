import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setResetUrl("");
    setCopied(false);
    setLoading(true);

    try {
      const data = await forgotPassword({ email });
      setMessage(data.message || "Reset link generated.");
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
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
          {resetUrl && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              <div className="font-medium">Reset link</div>
              <div className="mt-1 break-all">
                <a className="text-accent underline" href={resetUrl}>
                  {resetUrl}
                </a>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button type="button" className="btn btn-secondary" onClick={handleCopy}>
                  {copied ? "Copied" : "Copy link"}
                </button>
                <a className="text-accent" href={resetUrl} target="_blank" rel="noreferrer">
                  Open reset page
                </a>
              </div>
            </div>
          )}

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
