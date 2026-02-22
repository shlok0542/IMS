import { body, query } from "express-validator";

export const createPurchaseValidator = [
  body("supplierName").trim().notEmpty(),
  body("invoiceNumber").trim().notEmpty(),
  body("productId").isMongoId(),
  body("quantityPurchased").isInt({ min: 1 }),
  body("purchasePrice").isFloat({ min: 0 }),
  body("purchaseDate").optional().isISO8601()
];

export const purchaseListValidator = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 })
];
