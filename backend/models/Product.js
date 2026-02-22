import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    sellingPrice: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, required: true, min: 0 },
    quantityAvailable: { type: Number, default: 0, min: 0 },
    minimumStockLevel: { type: Number, default: 5, min: 0 },
    reservedStock: { type: Number, default: 0, min: 0 },
    marketplaceStock: {
      amazonStock: { type: Number, default: 0, min: 0 },
      flipkartStock: { type: Number, default: 0, min: 0 },
      meeshoStock: { type: Number, default: 0, min: 0 }
    },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

productSchema.index({ userId: 1, sku: 1 }, { unique: true });
productSchema.index({ userId: 1, name: "text", sku: "text", category: "text" });

const Product = mongoose.model("Product", productSchema);
export default Product;
