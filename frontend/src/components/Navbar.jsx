import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function navClass({ isActive }) {
  return isActive ? "text-ink font-semibold" : "text-slate-600 hover:text-ink";
}

function formatDate(dateValue) {
  if (!dateValue) return "-";
  return new Date(dateValue).toLocaleDateString();
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-lg font-bold text-ink">
          CommerceStock
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm">
          <NavLink to="/" className={navClass}>
            Home
          </NavLink>

          {user ? (
            <>
              <NavLink to="/dashboard" className={navClass}>
                Dashboard
              </NavLink>
              <NavLink to="/products" className={navClass}>
                Products
              </NavLink>
              <NavLink to="/orders" className={navClass}>
                Orders
              </NavLink>
              <NavLink to="/purchases" className={navClass}>
                Purchases
              </NavLink>
              <NavLink to="/stock-ledger" className={navClass}>
                Ledger
              </NavLink>
              <NavLink to="/reports" className={navClass}>
                Reports
              </NavLink>
              <NavLink to="/low-stock" className={navClass}>
                Low Stock
              </NavLink>

              <div className="relative" ref={menuRef}>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 font-semibold text-ink"
                  onClick={() => setOpen((prev) => !prev)}
                  type="button"
                  title="Account"
                >
                  {(user.name || "U").charAt(0).toUpperCase()}
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                    <div className="text-sm font-semibold text-ink">{user.name}</div>
                    <div className="mt-1 text-xs text-slate-600">{user.email}</div>
                    <div className="mt-1 text-xs text-slate-500">Joined: {formatDate(user.createdAt)}</div>

                    <div className="mt-4 grid gap-2">
                      <button
                        className="btn btn-secondary w-full"
                        onClick={() => {
                          setOpen(false);
                          navigate("/profile");
                        }}
                        type="button"
                      >
                        Edit Profile
                      </button>
                      <button className="btn btn-primary w-full" onClick={handleLogout} type="button">
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navClass}>
                Login
              </NavLink>
              <NavLink to="/signup" className="btn btn-primary">
                Sign Up
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
