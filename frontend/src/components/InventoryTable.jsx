import { Link } from "react-router-dom";

export default function InventoryTable({ items, onDelete }) {
  if (!items.length) {
    return <div className="card p-6 text-slate-600">No inventory items yet.</div>;
  }

  return (
    <div className="card overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">SKU</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Qty</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Supplier</th>
            <th className="px-4 py-3">Updated</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id} className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium text-ink">{item.productName}</td>
              <td className="px-4 py-3 text-slate-600">{item.sku}</td>
              <td className="px-4 py-3 text-slate-600">{item.category}</td>
              <td className={`px-4 py-3 ${item.quantity < 5 ? "text-red-600" : "text-slate-700"}`}>
                {item.quantity}
              </td>
              <td className="px-4 py-3 text-slate-600">${item.price.toFixed(2)}</td>
              <td className="px-4 py-3 text-slate-600">{item.supplierName}</td>
              <td className="px-4 py-3 text-slate-600">
                {new Date(item.lastUpdated).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Link className="btn btn-secondary" to={`/inventory/${item._id}/edit`}>
                    Edit
                  </Link>
                  <button className="btn btn-primary" onClick={() => onDelete(item)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
