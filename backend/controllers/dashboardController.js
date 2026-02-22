import Product from "../models/Product.js";
import Order from "../models/Order.js";

function dateRangeForToday() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

function dateRangeForMonth() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

export async function getDashboardSummary(req, res, next) {
  try {
    const userId = req.user.id;
    const { start: todayStart, end: todayEnd } = dateRangeForToday();
    const { start: monthStart, end: monthEnd } = dateRangeForMonth();

    const [products, salesTodayAgg, monthlySalesAgg, platformSales, pendingOrdersCount] = await Promise.all([
      Product.find({ userId, isDeleted: false }),
      Order.aggregate([
        {
          $match: {
            userId,
            isDeleted: false,
            status: { $in: ["Pending", "Shipped", "Delivered"] },
            orderDate: { $gte: todayStart, $lt: todayEnd }
          }
        },
        { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }
      ]),
      Order.aggregate([
        {
          $match: {
            userId,
            isDeleted: false,
            status: { $in: ["Pending", "Shipped", "Delivered"] },
            orderDate: { $gte: monthStart, $lt: monthEnd }
          }
        },
        { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }
      ]),
      Order.aggregate([
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
            sales: { $sum: "$totalAmount" },
            orders: { $sum: 1 }
          }
        }
      ]),
      Order.countDocuments({ userId, isDeleted: false, status: "Pending" })
    ]);

    const totalProducts = products.length;
    const totalStockValue = products.reduce((sum, p) => sum + p.quantityAvailable * p.costPrice, 0);
    const lowStockItems = products.filter((p) => p.quantityAvailable <= p.minimumStockLevel);

    const salesToday = salesTodayAgg[0]?.totalSales || 0;
    const monthlySales = monthlySalesAgg[0]?.totalSales || 0;

    const totalProfit = products.reduce((sum, p) => {
      const margin = p.sellingPrice - p.costPrice;
      return sum + margin * p.quantityAvailable;
    }, 0);

    res.json({
      totalProducts,
      totalStockValue,
      totalSalesToday: salesToday,
      monthlySales,
      lowStockItems,
      platformSalesSummary: platformSales,
      pendingOrdersCount,
      estimatedProfit: totalProfit
    });
  } catch (err) {
    next(err);
  }
}
