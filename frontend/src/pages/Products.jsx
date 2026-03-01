import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import DeleteModal from "../components/DeleteModal.jsx";
import { formatINR } from "../utils/currency.js";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [filters, setFilters] = useState({ search: "", category: "", sortBy: "updatedAt:desc" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const fetchProducts = useCallback(
    async (page = 1, customFilters = {}) => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: pagination.limit,
          sortBy: customFilters.sortBy || "updatedAt:desc"
        };
        if (customFilters.search) params.search = customFilters.search;
        if (customFilters.category) params.category = customFilters.category;

        const { data } = await api.get("/api/products", { params });
        setProducts(data.data);
        setPagination(data.pagination);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit]
  );

  useEffect(() => {
    fetchProducts(1, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchProducts(1, filters);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await api.delete(`/api/products/${deleteItem._id}`);
      setDeleteItem(null);
      fetchProducts(pagination.page, filters);
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Products</h2>
        <Link to="/products/new" className="btn btn-primary">
          Add Product
        </Link>
      </div>

      <form className="card grid gap-3 p-4 md:grid-cols-5" onSubmit={handleFilterSubmit}>
        <input
          className="input md:col-span-2"
          placeholder="Search name / SKU"
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
        />
        <input
          className="input"
          placeholder="Category"
          value={filters.category}
          onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
        />
        <select
          className="input"
          value={filters.sortBy}
          onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
        >
          <option value="updatedAt:desc">Latest Updated</option>
          <option value="name:asc">Name A-Z</option>
          <option value="sellingPrice:desc">Selling Price High-Low</option>
          <option value="quantityAvailable:asc">Low Quantity</option>
        </select>
        <button className="btn btn-secondary" type="submit">
          Apply
        </button>
      </form>

      {error && <div className="card p-4 text-red-600">{error}</div>}

      <div className="card overflow-x-auto" aria-busy={loading}>
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-100 text-left text-slate-700">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Selling Price</th>
              <th className="px-4 py-3">Cost Price</th>
              <th className="px-4 py-3">Available</th>
              <th className="px-4 py-3">Reserved</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">{p.sku}</td>
                <td className="px-4 py-3">{p.category}</td>
                <td className="px-4 py-3">{formatINR(p.sellingPrice)}</td>
                <td className="px-4 py-3">{formatINR(p.costPrice)}</td>
                <td className={`px-4 py-3 ${p.quantityAvailable <= p.minimumStockLevel ? "text-red-600" : ""}`}>
                  {p.quantityAvailable}
                </td>
                <td className="px-4 py-3">{p.reservedStock}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link className="btn btn-secondary" to={`/products/${p._id}/edit`}>
                      Edit
                    </Link>
                    <button className="btn btn-primary" onClick={() => setDeleteItem(p)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && !products.length && (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={8}>
                  No products found.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={8}>
                  Loading products...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <span>
          Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
        </span>
        <div className="flex gap-2">
          <button
            className="btn btn-secondary"
            disabled={pagination.page <= 1 || loading}
            onClick={() => fetchProducts(pagination.page - 1, filters)}
          >
            Previous
          </button>
          <button
            className="btn btn-secondary"
            disabled={pagination.page >= pagination.totalPages || loading}
            onClick={() => fetchProducts(pagination.page + 1, filters)}
          >
            Next
          </button>
        </div>
      </div>

      <DeleteModal
        open={Boolean(deleteItem)}
        item={{ productName: deleteItem?.name }}
        onCancel={() => setDeleteItem(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
