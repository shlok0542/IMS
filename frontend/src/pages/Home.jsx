import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">E-commerce Stock & Order Management</p>
        <h1 className="mt-3 text-4xl font-bold text-ink dark:text-slate-100 md:text-5xl">
          A modern command center for inventory, orders, purchases, and analytics.
        </h1>
        <p className="mt-4 text-lg text-slate-700 dark:text-slate-300">
          Track multi-platform sales, detect low stock instantly, and generate reports that are easy to share with
          your team.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/signup" className="btn btn-primary">
            Get Started
          </Link>
          <Link to="/login" className="btn btn-secondary">
            Login
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="flex -space-x-2">
            {["SC", "AP", "RM", "DS"].map((initials, index) => (
              <div
                key={initials}
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white ${
                  ["bg-emerald-500", "bg-sky-500", "bg-amber-500", "bg-indigo-500"][index]
                }`}
              >
                {initials}
              </div>
            ))}
          </div>
          <div className="text-sm text-slate-700 dark:text-slate-300">
            Trusted by fast-moving sellers and ops teams.
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -top-6 left-8 h-40 w-40 rounded-full bg-emerald-200/60 blur-3xl dark:bg-emerald-400/10" />
        <div className="absolute -bottom-8 right-8 h-40 w-40 rounded-full bg-sky-200/60 blur-3xl dark:bg-sky-400/10" />

        <div className="card relative overflow-hidden p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-400">
                Live Overview
              </div>
              <div className="mt-1 text-xl font-semibold text-ink dark:text-slate-100">CommerceStock Pulse</div>
            </div>
            <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
              +12% MoM
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
              <div className="text-sm text-slate-600 dark:text-slate-400">Platform Sales</div>
              <div className="mt-2 flex items-center justify-between text-lg font-semibold text-ink dark:text-slate-100">
                Amazon / Flipkart / Meesho / Offline
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-2 w-3/5 rounded-full bg-emerald-500" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
                <div className="text-sm text-slate-600 dark:text-slate-400">Stock Ledger</div>
                <div className="mt-2 text-2xl font-semibold text-ink dark:text-slate-100">IN / OUT / RETURN</div>
                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Live updates every 15 mins
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
                <div className="text-sm text-slate-600 dark:text-slate-400">Reports</div>
                <div className="mt-2 text-2xl font-semibold text-ink dark:text-slate-100">Daily / Profit / Dead Stock</div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {["#34d399", "#38bdf8", "#a78bfa"].map((color) => (
                    <div key={color} className="h-10 rounded-lg" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>Today’s Orders</span>
                <span className="text-ink dark:text-slate-100">128</span>
              </div>
              <div className="mt-3 grid grid-cols-7 gap-2">
                {[22, 36, 18, 42, 30, 50, 28].map((value, index) => (
                  <div key={value} className="flex items-end">
                    <div
                      className="w-full rounded-md bg-sky-400/70"
                      style={{ height: `${value}px` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Syncing data across channels
            </div>
            <span>Updated just now</span>
          </div>
        </div>
      </div>
    </section>
  );
}
