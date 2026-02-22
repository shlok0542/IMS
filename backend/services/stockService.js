import mongoose from "mongoose";
import Product from "../models/Product.js";
import StockTransaction from "../models/StockTransaction.js";
import Order from "../models/Order.js";

function toObjectId(value) {
  return value instanceof mongoose.Types.ObjectId ? value : new mongoose.Types.ObjectId(value);
}

export async function recalculateProductStock({ userId, productId }) {
  const userObjectId = toObjectId(userId);
  const productObjectId = toObjectId(productId);

  const totals = await StockTransaction.aggregate([
    {
      $match: {
        userId: userObjectId,
        productId: productObjectId
      }
    },
    {
      $group: {
        _id: "$type",
        quantity: { $sum: "$quantity" }
      }
    }
  ]);

  const ledger = totals.reduce(
    (acc, cur) => {
      acc[cur._id] = cur.quantity;
      return acc;
    },
    { IN: 0, OUT: 0, RETURN: 0, DAMAGE: 0 }
  );

  const reserved = await Order.aggregate([
    {
      $match: {
        userId: userObjectId,
        productId: productObjectId,
        isDeleted: false,
        status: { $in: ["Pending", "Shipped"] }
      }
    },
    {
      $group: {
        _id: null,
        quantity: { $sum: "$quantity" }
      }
    }
  ]);

  const reservedStock = reserved[0]?.quantity || 0;
  const quantityAvailable = Math.max(ledger.IN - ledger.OUT - ledger.DAMAGE + ledger.RETURN, 0);

  await Product.findOneAndUpdate(
    { _id: productObjectId, userId: userObjectId, isDeleted: false },
    {
      quantityAvailable,
      reservedStock
    },
    { new: true }
  );

  return { quantityAvailable, reservedStock, ledger };
}

export async function createStockTransaction({
  userId,
  productId,
  type,
  quantity,
  platform,
  referenceId,
  note,
  date
}) {
  const userObjectId = toObjectId(userId);
  const productObjectId = toObjectId(productId);

  const transaction = await StockTransaction.create({
    userId: userObjectId,
    productId: productObjectId,
    type,
    quantity,
    platform,
    referenceId,
    note,
    date: date || new Date()
  });

  const stock = await recalculateProductStock({ userId: userObjectId, productId: productObjectId });
  return { transaction, stock };
}
