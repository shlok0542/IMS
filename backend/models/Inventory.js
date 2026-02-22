import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    productName: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    supplierName: { type: String, required: true, trim: true },
    dateAdded: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

inventorySchema.index({ userId: 1, sku: 1 }, { unique: true });

const Inventory = mongoose.model("Inventory", inventorySchema);
export default Inventory;
