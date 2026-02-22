import Product from "../models/Product.js";
import StockTransaction from "../models/StockTransaction.js";
import { createStockTransaction } from "../services/stockService.js";
import { parsePagination, parseSort } from "../utils/helpers.js";

export async function createManualTransaction(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId, type, quantity, platform, referenceId, note, date } = req.body;

    const product = await Product.findOne({ _id: productId, userId, isDeleted: false });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (type === "OUT" || type === "DAMAGE") {
      if (product.quantityAvailable < Number(quantity)) {
        return res.status(400).json({ message: "Insufficient stock for this transaction" });
      }
    }

    const result = await createStockTransaction({
      userId,
      productId,
      type,
      quantity,
      platform,
      referenceId,
      note,
      date
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function listTransactions(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId, type, platform, dateFrom, dateTo } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const sort = parseSort(req.query.sortBy, "date");

    const filter = { userId };
    if (productId) filter.productId = productId;
    if (type) filter.type = type;
    if (platform) filter.platform = platform;
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const [data, total] = await Promise.all([
      StockTransaction.find(filter).populate("productId", "name sku").sort(sort).skip(skip).limit(limit),
      StockTransaction.countDocuments(filter)
    ]);

    res.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
}
