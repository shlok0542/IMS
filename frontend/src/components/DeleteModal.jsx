export default function DeleteModal({ open, onCancel, onConfirm, item }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 px-4">
      <div className="card w-full max-w-md p-6">
        <h3 className="text-lg font-semibold">Delete Item</h3>
        <p className="mt-2 text-sm text-slate-600">
          Are you sure you want to delete <span className="font-medium">{item?.productName}</span>?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
