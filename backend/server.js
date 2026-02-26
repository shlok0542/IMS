import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

await connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "E-commerce Stock and Order Management API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/stock-transactions", stockRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/suppliers", supplierRoutes);

app.use(notFound);
app.use(errorHandler);

function resolvePort(rawPort) {
  const parsed = Number(rawPort);
  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }

  const fallback = process.env.RENDER ? 10000 : 5000;
  if (rawPort) {
    console.warn(`Invalid PORT value "${rawPort}". Falling back to ${fallback}.`);
  }
  return fallback;
}

const PORT = resolvePort(process.env.PORT);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
