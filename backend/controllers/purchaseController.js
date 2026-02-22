import Purchase from "../models/Purchase.js";
import Product from "../models/Product.js";
import { createStockTransaction } from "../services/stockService.js";
import { parsePagination, parseSort } from "../utils/helpers.js";

export async function createPurchase(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      supplierName,
      invoiceNumber,
      productId,
      quantityPurchased,
      purchasePrice,
      purchaseDate
    } = req.body;

    const product = await Product.findOne({ _id: productId, userId, isDeleted: false });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const totalCost = Number(quantityPurchased) * Number(purchasePrice);

    const purchase = await Purchase.create({
      userId,
      supplierName,
      invoiceNumber,
      productId,
      quantityPurchased,
      purchasePrice,
      totalCost,
      purchaseDate
    });

    await createStockTransaction({
      userId,
      productId,
      type: "IN",
      quantity: quantityPurchased,
      platform: "Supplier",
      referenceId: invoiceNumber,
      note: "Purchase stock added",
      date: purchaseDate
    });

    const saved = await Purchase.findById(purchase._id).populate("productId", "name sku");
    res.status(201).json(saved);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "invoiceNumber must be unique per user" });
    }
    next(err);
  }
}

export async function listPurchases(req, res, next) {
  try {
    const userId = req.user.id;
    const { search, dateFrom, dateTo } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const sort = parseSort(req.query.sortBy, "purchaseDate");

    const filter = { userId, isDeleted: false };
    if (search) {
      filter.$or = [
        { supplierName: { $regex: search, $options: "i" } },
        { invoiceNumber: { $regex: search, $options: "i" } }
      ];
    }
    if (dateFrom || dateTo) {
      filter.purchaseDate = {};
      if (dateFrom) filter.purchaseDate.$gte = new Date(dateFrom);
      if (dateTo) filter.purchaseDate.$lte = new Date(dateTo);
    }

    const [data, total] = await Promise.all([
      Purchase.find(filter).populate("productId", "name sku").sort(sort).skip(skip).limit(limit),
      Purchase.countDocuments(filter)
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

export async function softDeletePurchase(req, res, next) {
  try {
    const purchase = await Purchase.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    res.json({ message: "Purchase deleted" });
  } catch (err) {
    next(err);
  }
}
