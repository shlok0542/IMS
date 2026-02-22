import Supplier from "../models/Supplier.js";
import { parsePagination } from "../utils/helpers.js";

export async function createSupplier(req, res, next) {
  try {
    const supplier = await Supplier.create({ userId: req.user.id, ...req.body });
    res.status(201).json(supplier);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Supplier with same name already exists" });
    }
    next(err);
  }
}

export async function listSuppliers(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = { userId: req.user.id, isDeleted: false };
    const [data, total] = await Promise.all([
      Supplier.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Supplier.countDocuments(filter)
    ]);

    res.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
}
