import Order from "../models/Order.js";
import Product from "../models/Product.js";
import StockTransaction from "../models/StockTransaction.js";
import { sendCsv } from "../utils/csv.js";

function shouldExportCsv(req) {
  return String(req.query.export || "").toLowerCase() === "csv";
}

function dateBounds(query, fallbackDays = 30) {
  const to = query.dateTo ? new Date(query.dateTo) : new Date();
  const from = query.dateFrom ? new Date(query.dateFrom) : new Date(to.getTime() - fallbackDays * 24 * 60 * 60 * 1000);
  return { from, to };
}

export async function getDailySalesReport(req, res, next) {
  try {
    const userId = req.user.id;
    const { from, to } = dateBounds(req.query, 7);

    const rows = await Order.aggregate([
      {
        $match: {
          userId,
          isDeleted: false,
          status: { $in: ["Pending", "Shipped", "Delivered"] },
          orderDate: { $gte: from, $lte: to }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$orderDate" }
          },
          orders: { $sum: 1 },
          sales: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    if (shouldExportCsv(req)) {
      return sendCsv(res, rows, ["_id", "orders", "sales"], "daily-sales-report.csv");
    }

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getMonthlySalesReport(req, res, next) {
  try {
    const userId = req.user.id;

    const rows = await Order.aggregate([
      {
        $match: {
          userId,
          isDeleted: false,
          status: { $in: ["Pending", "Shipped", "Delivered"] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$orderDate" }
          },
          orders: { $sum: 1 },
          sales: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    if (shouldExportCsv(req)) {
      return sendCsv(res, rows, ["_id", "orders", "sales"], "monthly-sales-report.csv");
    }

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getPlatformSalesReport(req, res, next) {
  try {
    const userId = req.user.id;

    const rows = await Order.aggregate([
      {
        $match: {
          userId,
          isDeleted: false,
          status: { $in: ["Pending", "Shipped", "Delivered"] }
        }
      },
      {
        $group: {
          _id: "$platform",
          orders: { $sum: 1 },
          quantity: { $sum: "$quantity" },
          sales: { $sum: "$totalAmount" }
        }
      },
      { $sort: { sales: -1 } }
    ]);

    if (shouldExportCsv(req)) {
      return sendCsv(res, rows, ["_id", "orders", "quantity", "sales"], "platform-sales-report.csv");
    }

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getDeadStockReport(req, res, next) {
  try {
    const userId = req.user.id;
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const soldProductIds = await StockTransaction.distinct("productId", {
      userId,
      type: "OUT",
      date: { $gte: since }
    });

    const rows = await Product.find({
      userId,
      isDeleted: false,
      _id: { $nin: soldProductIds }
    }).select("name sku category quantityAvailable sellingPrice costPrice updatedAt");

    if (shouldExportCsv(req)) {
      return sendCsv(res, rows, ["name", "sku", "category", "quantityAvailable", "sellingPrice", "costPrice"], "dead-stock-report.csv");
    }

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getFastMovingProductsReport(req, res, next) {
  try {
    const userId = req.user.id;
    const { from, to } = dateBounds(req.query, 30);

    const rows = await StockTransaction.aggregate([
      {
        $match: {
          userId,
          type: "OUT",
          date: { $gte: from, $lte: to }
        }
      },
      {
        $group: {
          _id: "$productId",
          soldQty: { $sum: "$quantity" }
        }
      },
      { $sort: { soldQty: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 0,
          productId: "$product._id",
          name: "$product.name",
          sku: "$product.sku",
          soldQty: 1
        }
      }
    ]);

    if (shouldExportCsv(req)) {
      return sendCsv(res, rows, ["productId", "name", "sku", "soldQty"], "fast-moving-products-report.csv");
    }

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getProfitReport(req, res, next) {
  try {
    const userId = req.user.id;
    const { from, to } = dateBounds(req.query, 30);

    const rows = await Order.aggregate([
      {
        $match: {
          userId,
          isDeleted: false,
          status: { $in: ["Pending", "Shipped", "Delivered"] },
          orderDate: { $gte: from, $lte: to }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          orderId: 1,
          platform: 1,
          quantity: 1,
          sellingPrice: 1,
          costPrice: "$product.costPrice",
          totalAmount: 1,
          profit: {
            $multiply: [{ $subtract: ["$sellingPrice", "$product.costPrice"] }, "$quantity"]
          },
          orderDate: 1
        }
      },
      { $sort: { orderDate: -1 } }
    ]);

    const totalProfit = rows.reduce((sum, row) => sum + row.profit, 0);

    if (shouldExportCsv(req)) {
      return sendCsv(
        res,
        rows,
        ["orderId", "platform", "quantity", "sellingPrice", "costPrice", "totalAmount", "profit", "orderDate"],
        "profit-report.csv"
      );
    }

    res.json({ totalProfit, rows });
  } catch (err) {
    next(err);
  }
}
