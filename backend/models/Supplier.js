import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

supplierSchema.index({ userId: 1, name: 1 }, { unique: true });

const Supplier = mongoose.model("Supplier", supplierSchema);
export default Supplier;
