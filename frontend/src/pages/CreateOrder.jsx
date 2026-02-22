import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";

const platforms = ["Amazon", "Flipkart", "Meesho", "Offline"];

export default function CreateOrder() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    orderId: "",
    platform: "Amazon",
    productId: "",
    quantity: "1",
    sellingPrice: "",
    orderDate: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProducts() {
      try {
        const { data } = await api.get("/api/products", { params: { page: 1, limit: 100, sortBy: "name:asc" } });
        setProducts(data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load products");
      }
    }

    loadProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/api/orders", {
        ...form,
        quantity: Number(form.quantity),
        sellingPrice: form.sellingPrice ? Number(form.sellingPrice) : undefined,
        orderDate: form.orderDate || undefined
      });
      navigate("/orders");
    } catch (err) {
      setError(err.response?.data?.message || "Order create failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card p-6">
        <h2 className="text-2xl font-semibold">Create Order</h2>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="label">Order ID</label>
            <input
              className="input"
              value={form.orderId}
              onChange={(e) => setForm((prev) => ({ ...prev, orderId: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Platform</label>
              <select
                className="input"
                value={form.platform}
                onChange={(e) => setForm((prev) => ({ ...prev, platform: e.target.value }))}
              >
                {platforms.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
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
                    {p.name} ({p.sku}) - Stock {p.quantityAvailable}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
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
              <label className="label">Selling Price (INR)</label>
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={form.sellingPrice}
                onChange={(e) => setForm((prev) => ({ ...prev, sellingPrice: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Order Date</label>
              <input
                className="input"
                type="date"
                value={form.orderDate}
                onChange={(e) => setForm((prev) => ({ ...prev, orderDate: e.target.value }))}
              />
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Create Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
