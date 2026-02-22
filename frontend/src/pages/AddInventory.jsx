import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";

const initialForm = {
  productName: "",
  sku: "",
  category: "",
  quantity: "",
  price: "",
  supplierName: "",
  dateAdded: ""
};

export default function AddInventory() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        price: Number(form.price)
      };
      await api.post("/api/inventory", payload);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card p-6">
        <h2 className="text-2xl font-semibold">Add Inventory</h2>
        <p className="mt-1 text-sm text-slate-600">Fill in the product details.</p>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div>
            <label className="label">Product Name</label>
            <input className="input" name="productName" value={form.productName} onChange={handleChange} required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">SKU</label>
              <input className="input" name="sku" value={form.sku} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Category</label>
              <input className="input" name="category" value={form.category} onChange={handleChange} required />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Quantity</label>
              <input
                className="input"
                type="number"
                min="0"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="label">Price</label>
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Supplier Name</label>
              <input className="input" name="supplierName" value={form.supplierName} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Date Added</label>
              <input className="input" type="date" name="dateAdded" value={form.dateAdded} onChange={handleChange} />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Add Item"}
          </button>
        </form>
      </div>
    </div>
  );
}
