import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { createStockTransaction, recalculateProductStock } from "../services/stockService.js";
import { parsePagination, parseSort } from "../utils/helpers.js";

function canUpdateToStatus(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) return false;
  if (["Cancelled", "Returned"].includes(currentStatus)) return false;
  return true;
}

export async function createOrder(req, res, next) {
  try {
    const userId = req.user.id;
    const { orderId, platform, productId, quantity, sellingPrice, orderDate } = req.body;

    const product = await Product.findOne({ _id: productId, userId, isDeleted: false });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.quantityAvailable < quantity) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${product.quantityAvailable}, Requested: ${quantity}`
      });
    }

    const price = sellingPrice !== undefined ? Number(sellingPrice) : product.sellingPrice;
    const totalAmount = price * Number(quantity);

    const order = await Order.create({
      userId,
      orderId,
      platform,
      productId,
      quantity,
      sellingPrice: price,
      totalAmount,
      status: "Pending",
      orderDate
    });

    await createStockTransaction({
      userId,
      productId,
      type: "OUT",
      quantity,
      platform,
      referenceId: orderId,
      note: "Order created",
      date: orderDate
    });

    const fresh = await Order.findById(order._id).populate("productId", "name sku sellingPrice costPrice");
    res.status(201).json(fresh);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "orderId must be unique per user" });
    }
    next(err);
  }
}

export async function listOrders(req, res, next) {
  try {
    const userId = req.user.id;
    const { platform, status, dateFrom, dateTo, search } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const sort = parseSort(req.query.sortBy, "orderDate");

    const filter = { userId, isDeleted: false };
    if (platform) filter.platform = platform;
    if (status) filter.status = status;
    if (dateFrom || dateTo) {
      filter.orderDate = {};
      if (dateFrom) filter.orderDate.$gte = new Date(dateFrom);
      if (dateTo) filter.orderDate.$lte = new Date(dateTo);
    }
    if (search) {
      filter.orderId = { $regex: search, $options: "i" };
    }

    const [data, total] = await Promise.all([
      Order.find(filter).populate("productId", "name sku").sort(sort).skip(skip).limit(limit),
      Order.countDocuments(filter)
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

export async function updateOrderStatus(req, res, next) {
  try {
    const userId = req.user.id;
    const { status } = req.body;

    const order = await Order.findOne({ _id: req.params.id, userId, isDeleted: false });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!canUpdateToStatus(order.status, status)) {
      return res.status(400).json({ message: "Invalid status transition" });
    }

    if (status === "Cancelled" || status === "Returned") {
      await createStockTransaction({
        userId,
        productId: order.productId,
        type: "RETURN",
        quantity: order.quantity,
        platform: order.platform,
        referenceId: order.orderId,
        note: `Order ${status.toLowerCase()}`
      });
    }

    order.status = status;
    await order.save();

    await recalculateProductStock({ userId, productId: order.productId });

    const result = await Order.findById(order._id).populate("productId", "name sku");
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function softDeleteOrder(req, res, next) {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted" });
  } catch (err) {
    next(err);
  }
}
