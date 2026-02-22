import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function LowStock() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get("/api/products", {
          params: { page: 1, limit: 100, lowStock: true, sortBy: "quantityAvailable:asc" }
        });
        setItems(data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load low stock items");
      }
    }

    load();
  }, []);

  return (
    <div className="grid gap-4">
      <h2 className="text-2xl font-semibold">Low Stock Alerts</h2>
      {error && <div className="card p-4 text-red-600">{error}</div>}
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-700">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Available</th>
              <th className="px-4 py-3">Minimum Level</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{item.name}</td>
                <td className="px-4 py-3">{item.sku}</td>
                <td className="px-4 py-3">{item.category}</td>
                <td className="px-4 py-3 text-red-600">{item.quantityAvailable}</td>
                <td className="px-4 py-3">{item.minimumStockLevel}</td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={5}>
                  No low stock items.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
