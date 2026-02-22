import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { formatINR } from "../utils/currency.js";

const purchaseInitial = {
  supplierName: "",
  invoiceNumber: "",
  productId: "",
  quantityPurchased: "",
  purchasePrice: "",
  purchaseDate: ""
};

export default function Purchases() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(purchaseInitial);
  const [purchases, setPurchases] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [error, setError] = useState("");

  async function loadPurchases(page = 1) {
    try {
      const { data } = await api.get("/api/purchases", { params: { page, limit: pagination.limit } });
      setPurchases(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load purchases");
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const [{ data: productRes }] = await Promise.all([
          api.get("/api/products", { params: { page: 1, limit: 100 } }),
          loadPurchases(1)
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
      await api.post("/api/purchases", {
        ...form,
        quantityPurchased: Number(form.quantityPurchased),
        purchasePrice: Number(form.purchasePrice),
        purchaseDate: form.purchaseDate || undefined
      });
      setForm(purchaseInitial);
      loadPurchases(1);
    } catch (err) {
      setError(err.response?.data?.message || "Purchase create failed");
    }
  };

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-semibold">Purchases</h2>

      <form className="card grid gap-4 p-5 md:grid-cols-3" onSubmit={handleSubmit}>
        <div>
          <label className="label">Supplier Name</label>
          <input
            className="input"
            value={form.supplierName}
            onChange={(e) => setForm((prev) => ({ ...prev, supplierName: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="label">Invoice Number</label>
          <input
            className="input"
            value={form.invoiceNumber}
            onChange={(e) => setForm((prev) => ({ ...prev, invoiceNumber: e.target.value }))}
            required
          />
        </div>
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
          <label className="label">Quantity Purchased</label>
          <input
            className="input"
            type="number"
            min="1"
            value={form.quantityPurchased}
            onChange={(e) => setForm((prev) => ({ ...prev, quantityPurchased: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="label">Purchase Price (INR)</label>
          <input
            className="input"
            type="number"
            min="0"
            step="0.01"
            value={form.purchasePrice}
            onChange={(e) => setForm((prev) => ({ ...prev, purchasePrice: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="label">Purchase Date</label>
          <input
            className="input"
            type="date"
            value={form.purchaseDate}
            onChange={(e) => setForm((prev) => ({ ...prev, purchaseDate: e.target.value }))}
          />
        </div>

        <button className="btn btn-primary md:col-span-3">Add Purchase</button>
      </form>

      {error && <div className="card p-4 text-red-600">{error}</div>}

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-700">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p._id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{p.invoiceNumber}</td>
                <td className="px-4 py-3">{p.supplierName}</td>
                <td className="px-4 py-3">{p.productId?.name || "-"}</td>
                <td className="px-4 py-3">{p.quantityPurchased}</td>
                <td className="px-4 py-3">{formatINR(p.purchasePrice)}</td>
                <td className="px-4 py-3">{formatINR(p.totalCost)}</td>
                <td className="px-4 py-3">{new Date(p.purchaseDate).toLocaleDateString()}</td>
              </tr>
            ))}
            {!purchases.length && (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={7}>
                  No purchases found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-2">
        <button className="btn btn-secondary" disabled={pagination.page <= 1} onClick={() => loadPurchases(pagination.page - 1)}>
          Previous
        </button>
        <button
          className="btn btn-secondary"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => loadPurchases(pagination.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
