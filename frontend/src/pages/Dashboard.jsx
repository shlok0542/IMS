import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { formatINR } from "../utils/currency.js";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get("/api/dashboard/summary");
        setSummary(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      }
    }

    load();
  }, []);

  if (error) {
    return <div className="card p-5 text-red-600">{error}</div>;
  }

  if (!summary) {
    return <div className="card p-5 text-slate-600">Loading dashboard...</div>;
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <p className="text-sm text-slate-600">Live stock, sales, and order metrics.</p>
        </div>
        <div className="flex gap-2">
          <Link className="btn btn-secondary" to="/products/new">
            Add Product
          </Link>
          <Link className="btn btn-primary" to="/orders/new">
            Create Order
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="card p-5">
          <div className="text-sm text-slate-500">Total Products</div>
          <div className="text-2xl font-semibold">{summary.totalProducts}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-slate-500">Total Stock Value</div>
          <div className="text-2xl font-semibold">{formatINR(summary.totalStockValue)}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-slate-500">Total Sales Today</div>
          <div className="text-2xl font-semibold">{formatINR(summary.totalSalesToday)}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-slate-500">Monthly Sales</div>
          <div className="text-2xl font-semibold">{formatINR(summary.monthlySales)}</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h3 className="text-lg font-semibold">Low Stock Items</h3>
          <div className="mt-3 space-y-2 text-sm">
            {summary.lowStockItems.length ? (
              summary.lowStockItems.slice(0, 8).map((item) => (
                <div key={item._id} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span>
                    {item.name} ({item.sku})
                  </span>
                  <span className="text-red-600">
                    {item.quantityAvailable} / min {item.minimumStockLevel}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-slate-500">No low stock items.</div>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-lg font-semibold">Platform Sales Summary</h3>
          <div className="mt-3 space-y-2 text-sm">
            {summary.platformSalesSummary.length ? (
              summary.platformSalesSummary.map((row) => (
                <div key={row._id} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span>{row._id}</span>
                  <span>{formatINR(row.sales)}</span>
                </div>
              ))
            ) : (
              <div className="text-slate-500">No sales yet.</div>
            )}
          </div>
          <div className="mt-4 text-sm text-slate-600">
            Pending Orders: <span className="font-semibold">{summary.pendingOrdersCount}</span>
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Estimated Profit: <span className="font-semibold">{formatINR(summary.estimatedProfit)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
