import mongoose from "mongoose";

const orderStatuses = ["Pending", "Shipped", "Delivered", "Cancelled", "Returned"];
const platforms = ["Amazon", "Flipkart", "Meesho", "Offline"];

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orderId: { type: String, required: true, trim: true },
    platform: { type: String, enum: platforms, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    quantity: { type: Number, required: true, min: 1 },
    sellingPrice: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: orderStatuses, default: "Pending" },
    orderDate: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, orderId: 1 }, { unique: true });
orderSchema.index({ userId: 1, platform: 1, orderDate: -1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;
