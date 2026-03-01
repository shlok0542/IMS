import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProfileSettings() {
  const { user, updateProfile, refreshProfile, deleteAccount, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [deletePassword, setDeletePassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
    delete: false
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
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

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!deletePassword) {
      setError("Enter your password to delete account");
      return;
    }

    const confirmed = window.confirm("This will permanently delete your account and data. Continue?");
    if (!confirmed) {
      return;
    }

    setDeleteLoading(true);
    try {
      const data = await deleteAccount({ password: deletePassword });
      setMessage(data.message || "Account deleted");
      navigate("/signup", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete account");
    } finally {
      setDeleteLoading(false);
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
              <div className="relative">
                <input
                  className="input pr-16"
                  type={showPasswords.current ? "text" : "password"}
                  value={form.currentPassword}
                  onChange={(e) => setForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 text-sm font-medium text-accent"
                  onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                >
                  {showPasswords.current ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <input
                  className="input pr-16"
                  type={showPasswords.next ? "text" : "password"}
                  value={form.newPassword}
                  onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 text-sm font-medium text-accent"
                  onClick={() => setShowPasswords((prev) => ({ ...prev, next: !prev.next }))}
                >
                  {showPasswords.next ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="label">Confirm New Password</label>
            <div className="relative">
              <input
                className="input pr-16"
                type={showPasswords.confirm ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 text-sm font-medium text-accent"
                onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
              >
                {showPasswords.confirm ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {message && <p className="text-sm text-emerald-600">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      <div className="card mt-6 border-red-200 p-6">
        <h3 className="text-xl font-semibold text-red-600">Danger Zone</h3>
        <p className="mt-1 text-sm text-slate-600">Delete your account and all linked data permanently.</p>

        <form className="mt-4 grid gap-3" onSubmit={handleDeleteAccount}>
          <div>
            <label className="label">Confirm Password</label>
            <div className="relative">
              <input
                className="input pr-16"
                type={showPasswords.delete ? "text" : "password"}
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 text-sm font-medium text-accent"
                onClick={() => setShowPasswords((prev) => ({ ...prev, delete: !prev.delete }))}
              >
                {showPasswords.delete ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button className="btn btn-primary bg-red-600 hover:bg-red-700" disabled={loading || deleteLoading}>
            {deleteLoading ? "Deleting..." : "Delete My Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
