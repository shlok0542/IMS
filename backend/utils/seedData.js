import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Purchase from "../models/Purchase.js";
import StockTransaction from "../models/StockTransaction.js";
import Supplier from "../models/Supplier.js";
import { createStockTransaction } from "../services/stockService.js";

dotenv.config();

async function seed() {
  await connectDB();

  await Promise.all([
    StockTransaction.deleteMany({}),
    Order.deleteMany({}),
    Purchase.deleteMany({}),
    Product.deleteMany({}),
    Supplier.deleteMany({}),
    User.deleteMany({ email: "admin@example.com" })
  ]);

  const user = await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: await bcrypt.hash("Admin@123", 10),
    role: "admin"
  });

  const supplier = await Supplier.create({
    userId: user._id,
    name: "Delhi Wholesale Traders",
    phone: "+91-9876543210"
  });

  const products = await Product.insertMany([
    {
      userId: user._id,
      name: "Wireless Mouse",
      sku: "ELE-MOU-0001",
      category: "Electronics",
      description: "2.4G ergonomic mouse",
      sellingPrice: 799,
      costPrice: 520,
      minimumStockLevel: 10,
      supplierId: supplier._id
    },
    {
      userId: user._id,
      name: "Notebook A5",
      sku: "STA-NOT-0001",
      category: "Stationery",
      description: "A5 ruled notebook",
      sellingPrice: 120,
      costPrice: 72,
      minimumStockLevel: 30,
      supplierId: supplier._id
    }
  ]);

  await createStockTransaction({
    userId: user._id,
    productId: products[0]._id,
    type: "IN",
    quantity: 100,
    platform: "Supplier",
    referenceId: "INV-1001",
    note: "Initial stock"
  });

  await createStockTransaction({
    userId: user._id,
    productId: products[1]._id,
    type: "IN",
    quantity: 300,
    platform: "Supplier",
    referenceId: "INV-1002",
    note: "Initial stock"
  });

  await Order.create({
    userId: user._id,
    orderId: "AMZ-5001",
    platform: "Amazon",
    productId: products[0]._id,
    quantity: 2,
    sellingPrice: 799,
    totalAmount: 1598,
    status: "Pending"
  });

  await createStockTransaction({
    userId: user._id,
    productId: products[0]._id,
    type: "OUT",
    quantity: 2,
    platform: "Amazon",
    referenceId: "AMZ-5001",
    note: "Seed order"
  });

  console.log("Seed complete");
  console.log("Login: admin@example.com / Admin@123");

  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error("Seed failed", err);
  await mongoose.disconnect();
  process.exit(1);
});
