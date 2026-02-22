import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios.js";

const initialForm = {
  name: "",
  sku: "",
  category: "",
  description: "",
  sellingPrice: "",
  costPrice: "",
  initialStockQuantity: "0",
  minimumStockLevel: "5",
  autoGenerateSku: true,
  marketplaceStock: {
    amazonStock: "0",
    flipkartStock: "0",
    meeshoStock: "0"
  }
};

export default function ProductForm({ mode }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (mode !== "edit" || !id) return;

    async function loadProduct() {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        setForm({
          name: data.name,
          sku: data.sku,
          category: data.category,
          description: data.description || "",
          sellingPrice: data.sellingPrice,
          costPrice: data.costPrice,
          initialStockQuantity: data.initialStockQuantity,
          minimumStockLevel: data.minimumStockLevel,
          autoGenerateSku: false,
          marketplaceStock: {
            amazonStock: data.marketplaceStock?.amazonStock || 0,
            flipkartStock: data.marketplaceStock?.flipkartStock || 0,
            meeshoStock: data.marketplaceStock?.meeshoStock || 0
          }
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load product");
      }
    }

    loadProduct();
  }, [id, mode]);

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (Number(form.initialStockQuantity) < 0) {
      setLoading(false);
      setError("Initial stock cannot be negative");
      return;
    }

    const payload = {
      ...form,
      sellingPrice: Number(form.sellingPrice),
      costPrice: Number(form.costPrice),
      initialStockQuantity: Number(form.initialStockQuantity),
      minimumStockLevel: Number(form.minimumStockLevel),
      marketplaceStock: {
        amazonStock: Number(form.marketplaceStock.amazonStock),
        flipkartStock: Number(form.marketplaceStock.flipkartStock),
        meeshoStock: Number(form.marketplaceStock.meeshoStock)
      }
    };

    if (!payload.sku && payload.autoGenerateSku) {
      delete payload.sku;
    }

    if (mode === "edit") {
      delete payload.initialStockQuantity;
    }

    try {
      if (mode === "edit") {
        await api.put(`/api/products/${id}`, payload);
      } else {
        await api.post("/api/products", payload);
      }
      navigate("/products");
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="card p-6">
        <h2 className="text-2xl font-semibold">{mode === "edit" ? "Edit Product" : "Add Product"}</h2>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="label">Product Name</label>
            <input className="input" value={form.name} onChange={(e) => setField("name", e.target.value)} required />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">SKU</label>
              <input
                className="input"
                value={form.sku}
                onChange={(e) => setField("sku", e.target.value)}
                disabled={mode === "create" && form.autoGenerateSku}
                required={!form.autoGenerateSku}
              />
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.autoGenerateSku}
                  onChange={(e) => setField("autoGenerateSku", e.target.checked)}
                  disabled={mode === "edit"}
                />
                Auto-generate SKU
              </label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Category</label>
              <input className="input" value={form.category} onChange={(e) => setField("category", e.target.value)} required />
            </div>
            {mode === "create" && (
              <div>
                <label className="label">Initial Stock Quantity (Available Stock)</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={form.initialStockQuantity}
                  onChange={(e) => setField("initialStockQuantity", e.target.value)}
                />
                <p className="mt-1 text-xs text-slate-500">
                  If left as 0, available stock will be initialized from Amazon + Flipkart + Meesho stock.
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="label">Description</label>
            <textarea className="input" value={form.description} onChange={(e) => setField("description", e.target.value)} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="label">Selling Price (INR)</label>
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={form.sellingPrice}
                onChange={(e) => setField("sellingPrice", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Cost Price (INR)</label>
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={form.costPrice}
                onChange={(e) => setField("costPrice", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Minimum Stock Level</label>
              <input
                className="input"
                type="number"
                min="0"
                value={form.minimumStockLevel}
                onChange={(e) => setField("minimumStockLevel", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="label">Amazon Stock</label>
              <input
                className="input"
                type="number"
                min="0"
                value={form.marketplaceStock.amazonStock}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    marketplaceStock: { ...prev.marketplaceStock, amazonStock: e.target.value }
                  }))
                }
              />
            </div>
            <div>
              <label className="label">Flipkart Stock</label>
              <input
                className="input"
                type="number"
                min="0"
                value={form.marketplaceStock.flipkartStock}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    marketplaceStock: { ...prev.marketplaceStock, flipkartStock: e.target.value }
                  }))
                }
              />
            </div>
            <div>
              <label className="label">Meesho Stock</label>
              <input
                className="input"
                type="number"
                min="0"
                value={form.marketplaceStock.meeshoStock}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    marketplaceStock: { ...prev.marketplaceStock, meeshoStock: e.target.value }
                  }))
                }
              />
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : "Save Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
