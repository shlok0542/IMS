import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    supplierName: { type: String, required: true, trim: true },
    invoiceNumber: { type: String, required: true, trim: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    quantityPurchased: { type: Number, required: true, min: 1 },
    purchasePrice: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 },
    purchaseDate: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

purchaseSchema.index({ userId: 1, invoiceNumber: 1 }, { unique: true });

const Purchase = mongoose.model("Purchase", purchaseSchema);
export default Purchase;
