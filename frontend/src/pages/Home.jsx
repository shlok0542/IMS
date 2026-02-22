import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">E-commerce Stock & Order Management</p>
        <h1 className="mt-3 text-4xl font-bold text-ink md:text-5xl">
          Manage inventory, sales orders, purchases, and stock ledger in one workflow.
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Built for Amazon, Flipkart, Meesho, and offline channels with INR analytics, low stock alerts, and reports.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/signup" className="btn btn-primary">
            Get Started
          </Link>
          <Link to="/login" className="btn btn-secondary">
            Login
          </Link>
        </div>
      </div>
      <div className="card p-6">
        <div className="grid gap-4">
          <div className="rounded-xl bg-slate-100 p-4">
            <div className="text-sm text-slate-500">Platform Sales</div>
            <div className="text-2xl font-semibold">Amazon / Flipkart / Meesho / Offline</div>
          </div>
          <div className="rounded-xl bg-slate-100 p-4">
            <div className="text-sm text-slate-500">Stock Ledger</div>
            <div className="text-2xl font-semibold">IN / OUT / RETURN / DAMAGE</div>
          </div>
          <div className="rounded-xl bg-slate-100 p-4">
            <div className="text-sm text-slate-500">Reports</div>
            <div className="text-2xl font-semibold">Daily, Monthly, Profit, Dead Stock</div>
          </div>
        </div>
      </div>
    </section>
  );
}
