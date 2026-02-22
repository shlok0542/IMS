import { useEffect, useState } from "react";
import api from "../api/axios.js";

const txTypes = ["IN", "OUT", "RETURN", "DAMAGE"];
const platforms = ["Amazon", "Flipkart", "Meesho", "Offline", "Supplier"];

const initialForm = {
  productId: "",
  type: "IN",
  quantity: "",
  platform: "Supplier",
  referenceId: "",
  note: "",
  date: ""
};

export default function StockLedger() {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  async function loadTransactions() {
    try {
      const { data } = await api.get("/api/stock-transactions", { params: { page: 1, limit: 50, sortBy: "date:desc" } });
      setTransactions(data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load ledger");
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const [{ data: productRes }] = await Promise.all([
          api.get("/api/products", { params: { page: 1, limit: 100, sortBy: "name:asc" } }),
          loadTransactions()
        ]);
        setProducts(productRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load data");
      }
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/api/stock-transactions", {
        ...form,
        quantity: Number(form.quantity),
        date: form.date || undefined
      });
      setForm(initialForm);
      loadTransactions();
    } catch (err) {
      setError(err.response?.data?.message || "Transaction failed");
    }
  };

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-semibold">Stock Ledger</h2>

      <form className="card grid gap-4 p-5 md:grid-cols-3" onSubmit={handleSubmit}>
        <div>
          <label className="label">Product</label>
          <select
            className="input"
            value={form.productId}
            onChange={(e) => setForm((prev) => ({ ...prev, productId: e.target.value }))}
            required
          >
            <option value="">Select product</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Type</label>
          <select
            className="input"
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
          >
            {txTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Platform</label>
          <select
            className="input"
            value={form.platform}
            onChange={(e) => setForm((prev) => ({ ...prev, platform: e.target.value }))}
          >
            {platforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Quantity</label>
          <input
            className="input"
            type="number"
            min="1"
            value={form.quantity}
            onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="label">Reference ID</label>
          <input
            className="input"
            value={form.referenceId}
            onChange={(e) => setForm((prev) => ({ ...prev, referenceId: e.target.value }))}
          />
        </div>
        <div>
          <label className="label">Date</label>
          <input
            className="input"
            type="date"
            value={form.date}
            onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
          />
        </div>
        <div className="md:col-span-3">
          <label className="label">Note</label>
          <input
            className="input"
            value={form.note}
            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
          />
        </div>

        <button className="btn btn-primary md:col-span-3">Add Transaction</button>
      </form>

      {error && <div className="card p-4 text-red-600">{error}</div>}

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-700">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Note</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx._id} className="border-t border-slate-100">
                <td className="px-4 py-3">{new Date(tx.date).toLocaleDateString()}</td>
                <td className="px-4 py-3">{tx.productId?.name || "-"}</td>
                <td className="px-4 py-3">{tx.type}</td>
                <td className="px-4 py-3">{tx.quantity}</td>
                <td className="px-4 py-3">{tx.platform}</td>
                <td className="px-4 py-3">{tx.referenceId || "-"}</td>
                <td className="px-4 py-3">{tx.note || "-"}</td>
              </tr>
            ))}
            {!transactions.length && (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={7}>
                  No stock transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
