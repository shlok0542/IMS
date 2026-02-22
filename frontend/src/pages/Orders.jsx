import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { formatINR } from "../utils/currency.js";

const statuses = ["", "Pending", "Shipped", "Delivered", "Cancelled", "Returned"];
const platforms = ["", "Amazon", "Flipkart", "Meesho", "Offline"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [filters, setFilters] = useState({ search: "", platform: "", status: "", dateFrom: "", dateTo: "" });
  const [error, setError] = useState("");

  async function loadOrders(page = 1) {
    try {
      const params = { page, limit: pagination.limit, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await api.get("/api/orders", { params });
      setOrders(data.data);
      setPagination(data.pagination);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    }
  }

  useEffect(() => {
    loadOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/api/orders/${id}/status`, { status });
      loadOrders(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || "Status update failed");
    }
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Orders</h2>
        <Link to="/orders/new" className="btn btn-primary">
          Create Order
        </Link>
      </div>

      <form
        className="card grid gap-3 p-4 md:grid-cols-6"
        onSubmit={(e) => {
          e.preventDefault();
          loadOrders(1);
        }}
      >
        <input
          className="input md:col-span-2"
          placeholder="Search order id"
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
        />
        <select
          className="input"
          value={filters.platform}
          onChange={(e) => setFilters((prev) => ({ ...prev, platform: e.target.value }))}
        >
          {platforms.map((platform) => (
            <option key={platform} value={platform}>
              {platform || "All Platforms"}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status || "All Status"}
            </option>
          ))}
        </select>
        <input
          className="input"
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
        />
        <input
          className="input"
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
        />
        <button className="btn btn-secondary" type="submit">
          Apply
        </button>
      </form>

      {error && <div className="card p-4 text-red-600">{error}</div>}

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-700">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Order Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{o.orderId}</td>
                <td className="px-4 py-3">{o.platform}</td>
                <td className="px-4 py-3">{o.productId?.name || "-"}</td>
                <td className="px-4 py-3">{o.quantity}</td>
                <td className="px-4 py-3">{formatINR(o.totalAmount)}</td>
                <td className="px-4 py-3">
                  <select
                    className="input"
                    value={o.status}
                    onChange={(e) => handleStatusUpdate(o._id, e.target.value)}
                    disabled={["Cancelled", "Returned"].includes(o.status)}
                  >
                    {statuses.slice(1).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">{new Date(o.orderDate).toLocaleDateString()}</td>
              </tr>
            ))}
            {!orders.length && (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={7}>
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <div className="flex gap-2">
          <button className="btn btn-secondary" disabled={pagination.page <= 1} onClick={() => loadOrders(pagination.page - 1)}>
            Previous
          </button>
          <button
            className="btn btn-secondary"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => loadOrders(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
