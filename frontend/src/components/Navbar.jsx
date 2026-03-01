import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function navClass({ isActive }) {
  return isActive
    ? "text-ink font-semibold dark:text-slate-100"
    : "text-slate-700 hover:text-ink dark:text-slate-300 dark:hover:text-slate-100";
}

function formatDate(dateValue) {
  if (!dateValue) return "-";
  return new Date(dateValue).toLocaleDateString();
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const homePath = user ? "/dashboard" : "/";
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const applyTheme = (nextTheme) => {
    const root = document.documentElement;
    document.body.classList.remove("dark");
    if (nextTheme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
    localStorage.setItem("theme", nextTheme);
    setTheme(nextTheme);
  };

  useEffect(() => {
    document.body.classList.remove("dark");
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      applyTheme(stored);
      return;
    }
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }, []);

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
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4">
        <Link to={homePath} className="text-lg font-bold text-ink dark:text-slate-100">
          CommerceStock
        </Link>
        <button
          className="btn btn-secondary md:hidden"
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>

        <nav className="hidden items-center gap-4 text-sm md:flex">
          <NavLink to={homePath} className={navClass}>
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
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => applyTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>

              <div className="relative" ref={menuRef}>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 font-semibold text-ink dark:bg-slate-700 dark:text-slate-100"
                  onClick={() => setOpen((prev) => !prev)}
                  type="button"
                  title="Account"
                >
                  {(user.name || "U").charAt(0).toUpperCase()}
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                    <div className="text-sm font-semibold text-ink dark:text-slate-100">{user.name}</div>
                    <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">{user.email}</div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                      Joined: {formatDate(user.createdAt)}
                    </div>

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
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => applyTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
              <NavLink to="/signup" className="btn btn-primary">
                Sign Up
              </NavLink>
            </>
          )}
        </nav>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto grid w-full max-w-7xl gap-2 px-4 py-4 text-sm">
            <NavLink to={homePath} className={navClass} onClick={() => setMobileOpen(false)}>
              Home
            </NavLink>

            {user ? (
              <>
                <NavLink to="/dashboard" className={navClass} onClick={() => setMobileOpen(false)}>
                  Dashboard
                </NavLink>
                <NavLink to="/products" className={navClass} onClick={() => setMobileOpen(false)}>
                  Products
                </NavLink>
                <NavLink to="/orders" className={navClass} onClick={() => setMobileOpen(false)}>
                  Orders
                </NavLink>
                <NavLink to="/purchases" className={navClass} onClick={() => setMobileOpen(false)}>
                  Purchases
                </NavLink>
                <NavLink to="/stock-ledger" className={navClass} onClick={() => setMobileOpen(false)}>
                  Ledger
                </NavLink>
                <NavLink to="/reports" className={navClass} onClick={() => setMobileOpen(false)}>
                  Reports
                </NavLink>
                <NavLink to="/low-stock" className={navClass} onClick={() => setMobileOpen(false)}>
                  Low Stock
                </NavLink>

                <button
                  className="btn btn-secondary w-full"
                  type="button"
                  onClick={() => applyTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>

                <div className="mt-2 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <div className="text-sm font-semibold text-ink dark:text-slate-100">{user.name}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">{user.email}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-500">
                    Joined: {formatDate(user.createdAt)}
                  </div>
                  <div className="mt-3 grid gap-2">
                    <button
                      className="btn btn-secondary w-full"
                      onClick={() => {
                        setMobileOpen(false);
                        navigate("/profile");
                      }}
                      type="button"
                    >
                      Edit Profile
                    </button>
                    <button
                      className="btn btn-primary w-full"
                      onClick={() => {
                        setMobileOpen(false);
                        handleLogout();
                      }}
                      type="button"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navClass} onClick={() => setMobileOpen(false)}>
                  Login
                </NavLink>
                <button
                  className="btn btn-secondary w-full"
                  type="button"
                  onClick={() => applyTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>
                <NavLink to="/signup" className="btn btn-primary w-full" onClick={() => setMobileOpen(false)}>
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
