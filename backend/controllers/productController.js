import mongoose from "mongoose";
import Product from "../models/Product.js";
import Supplier from "../models/Supplier.js";
import { createStockTransaction } from "../services/stockService.js";
import { generateSku, parsePagination, parseSort } from "../utils/helpers.js";

export async function createProduct(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      name,
      sku,
      category,
      description,
      sellingPrice,
      costPrice,
      minimumStockLevel,
      marketplaceStock,
      supplierId,
      autoGenerateSku,
      initialStockQuantity
    } = req.body;

    const marketplaceInitial =
      Number(marketplaceStock?.amazonStock || 0) +
      Number(marketplaceStock?.flipkartStock || 0) +
      Number(marketplaceStock?.meeshoStock || 0);

    const hasExplicitInitialStock =
      initialStockQuantity !== undefined && initialStockQuantity !== null && initialStockQuantity !== "";
    const initialStock = hasExplicitInitialStock ? Number(initialStockQuantity) : marketplaceInitial;

    if (initialStock < 0 || !Number.isFinite(initialStock)) {
      return res.status(400).json({ message: "Initial stock cannot be negative" });
    }

    let finalSku = sku;
    if (!finalSku && autoGenerateSku) {
      const existingCount = await Product.countDocuments({ userId });
      finalSku = generateSku({ name, category, existingCount });
    }

    if (!finalSku) {
      return res.status(400).json({ message: "SKU is required (or use autoGenerateSku=true)" });
    }

    if (supplierId) {
      const supplier = await Supplier.findOne({ _id: supplierId, userId, isDeleted: false });
      if (!supplier) {
        return res.status(400).json({ message: "supplierId is invalid" });
      }
    }

    const product = await Product.create({
      userId,
      name,
      sku: finalSku,
      category,
      description,
      sellingPrice,
      costPrice,
      minimumStockLevel,
      marketplaceStock,
      supplierId
    });

    if (initialStock > 0) {
      await createStockTransaction({
        userId,
        productId: product._id,
        type: "IN",
        quantity: initialStock,
        platform: "Initial Entry",
        referenceId: finalSku,
        note: "Initial stock while product creation"
      });
    }

    const saved = await Product.findById(product._id).populate("supplierId", "name");
    res.status(201).json(saved);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "SKU must be unique per user" });
    }
    next(err);
  }
}

export async function listProducts(req, res, next) {
  try {
    const userId = req.user.id;
    const { search, category, lowStock } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const sort = parseSort(req.query.sortBy, "updatedAt");

    const filter = { userId, isDeleted: false };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } }
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (lowStock === "true") {
      filter.$expr = { $lte: ["$quantityAvailable", "$minimumStockLevel"] };
    }

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).populate("supplierId", "name"),
      Product.countDocuments(filter)
    ]);

    res.json({
      data: items,
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

export async function getProductById(req, res, next) {
  try {
    const product = await Product.findOne({ _id: req.params.id, userId: req.user.id, isDeleted: false }).populate(
      "supplierId",
      "name"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const blockedFields = ["quantityAvailable", "reservedStock", "initialStockQuantity"];
    for (const field of blockedFields) {
      if (field in req.body) {
        return res.status(400).json({ message: `${field} cannot be manually edited` });
      }
    }

    const allowedFields = [
      "name",
      "sku",
      "category",
      "description",
      "sellingPrice",
      "costPrice",
      "minimumStockLevel",
      "marketplaceStock",
      "supplierId"
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (key in req.body) {
        updates[key] = req.body[key];
      }
    }

    if (updates.supplierId !== undefined && updates.supplierId !== null) {
      if (!mongoose.Types.ObjectId.isValid(updates.supplierId)) {
        return res.status(400).json({ message: "supplierId is invalid" });
      }

      const supplier = await Supplier.findOne({
        _id: updates.supplierId,
        userId: req.user.id,
        isDeleted: false
      });
      if (!supplier) {
        return res.status(400).json({ message: "supplierId is invalid" });
      }
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, isDeleted: false },
      updates,
      { new: true, runValidators: true }
    ).populate("supplierId", "name");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "SKU must be unique per user" });
    }
    next(err);
  }
}

export async function softDeleteProduct(req, res, next) {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
}

export async function bulkUploadProducts(req, res, next) {
  try {
    const userId = req.user.id;
    const products = req.body.products;

    if (!Array.isArray(products) || !products.length) {
      return res.status(400).json({ message: "products array is required" });
    }

    const prepared = [];
    for (const [index, product] of products.entries()) {
      if (!product.name || !product.category || product.sellingPrice === undefined || product.costPrice === undefined) {
        return res.status(400).json({ message: `Missing required fields at row ${index + 1}` });
      }

      let sku = product.sku;
      if (!sku) {
        const existingCount = await Product.countDocuments({ userId });
        sku = generateSku({ name: product.name, category: product.category, existingCount: existingCount + index });
      }

      prepared.push({
        userId,
        name: product.name,
        sku,
        category: product.category,
        description: product.description,
        sellingPrice: Number(product.sellingPrice),
        costPrice: Number(product.costPrice),
        minimumStockLevel: Number(product.minimumStockLevel || 5),
        marketplaceStock: {
          amazonStock: Number(product.amazonStock || 0),
          flipkartStock: Number(product.flipkartStock || 0),
          meeshoStock: Number(product.meeshoStock || 0)
        }
      });
    }

    const inserted = await Product.insertMany(prepared, { ordered: false });
    res.status(201).json({ insertedCount: inserted.length, inserted });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Duplicate SKU found in upload" });
    }
    next(err);
  }
}
