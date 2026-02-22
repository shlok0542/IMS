import { body, query } from "express-validator";

export const createTransactionValidator = [
  body("productId").isMongoId(),
  body("type").isIn(["IN", "OUT", "RETURN", "DAMAGE"]),
  body("quantity").isInt({ min: 1 }),
  body("platform").isIn(["Amazon", "Flipkart", "Meesho", "Offline", "Supplier"]),
  body("date").optional().isISO8601()
];

export const listTransactionValidator = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("productId").optional().isMongoId(),
  query("type").optional().isIn(["IN", "OUT", "RETURN", "DAMAGE"]),
  query("platform").optional().isIn(["Amazon", "Flipkart", "Meesho", "Offline", "Supplier"])
];
