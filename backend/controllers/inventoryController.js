import Inventory from "../models/Inventory.js";

export async function createItem(req, res, next) {
  try {
    const {
      productName,
      sku,
      category,
      quantity,
      price,
      supplierName,
      dateAdded
    } = req.body;

    if (!productName || !sku || !category || quantity === undefined || price === undefined || !supplierName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const item = await Inventory.create({
      userId: req.user.id,
      productName,
      sku,
      category,
      quantity,
      price,
      supplierName,
      dateAdded: dateAdded ? new Date(dateAdded) : undefined,
      lastUpdated: new Date()
    });

    res.status(201).json(item);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "SKU must be unique per user" });
    }
    next(err);
  }
}

export async function getItems(req, res, next) {
  try {
    const items = await Inventory.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function getItemById(req, res, next) {
  try {
    const item = await Inventory.findOne({ _id: req.params.id, userId: req.user.id });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function updateItem(req, res, next) {
  try {
    const updates = { ...req.body, lastUpdated: new Date() };

    const item = await Inventory.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "SKU must be unique per user" });
    }
    next(err);
  }
}

export async function deleteItem(req, res, next) {
  try {
    const item = await Inventory.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json({ message: "Item deleted" });
  } catch (err) {
    next(err);
  }
}

export async function getStats(req, res, next) {
  try {
    const userId = req.user.id;
    const items = await Inventory.find({ userId });

    const totalProducts = items.length;
    const totalStockValue = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const lowStockItems = items.filter((item) => item.quantity < 5);

    res.json({ totalProducts, totalStockValue, lowStockItems });
  } catch (err) {
    next(err);
  }
}
