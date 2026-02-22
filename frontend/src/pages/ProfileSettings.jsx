import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProfileSettings() {
  const { user, updateProfile, refreshProfile, loading } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      refreshProfile();
      return;
    }

    setForm((prev) => ({
      ...prev,
      name: user.name || "",
      email: user.email || ""
    }));
  }, [user, refreshProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError("New password and confirm password must match");
      return;
    }

    try {
      const payload = {
        name: form.name,
        email: form.email
      };

      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }

      const data = await updateProfile(payload);
      setMessage(data.message || "Profile updated");
      setForm((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } catch (err) {
      setError(err.response?.data?.message || "Profile update failed");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card p-6">
        <h2 className="text-2xl font-semibold">Edit Profile</h2>
        <p className="mt-1 text-sm text-slate-600">Update your account details and password.</p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Current Password</label>
              <input
                className="input"
                type="password"
                value={form.currentPassword}
                onChange={(e) => setForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">New Password</label>
              <input
                className="input"
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="label">Confirm New Password</label>
            <input
              className="input"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            />
          </div>

          {message && <p className="text-sm text-emerald-600">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
