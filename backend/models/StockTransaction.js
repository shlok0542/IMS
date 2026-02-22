import mongoose from "mongoose";

const transactionTypes = ["IN", "OUT", "RETURN", "DAMAGE"];
const platforms = ["Amazon", "Flipkart", "Meesho", "Offline", "Supplier", "Initial Entry"];

const stockTransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    type: { type: String, enum: transactionTypes, required: true },
    quantity: { type: Number, required: true, min: 1 },
    platform: { type: String, enum: platforms, required: true },
    referenceId: { type: String, trim: true },
    note: { type: String, trim: true },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

stockTransactionSchema.index({ userId: 1, productId: 1, date: -1 });

const StockTransaction = mongoose.model("StockTransaction", stockTransactionSchema);
export default StockTransaction;
