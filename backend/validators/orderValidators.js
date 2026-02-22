import { body, param, query } from "express-validator";

export const createOrderValidator = [
  body("orderId").trim().notEmpty().withMessage("orderId is required"),
  body("platform").isIn(["Amazon", "Flipkart", "Meesho", "Offline"]),
  body("productId").isMongoId(),
  body("quantity").isInt({ min: 1 }),
  body("sellingPrice").optional().isFloat({ min: 0 }),
  body("orderDate").optional().isISO8601()
];

export const updateOrderStatusValidator = [
  param("id").isMongoId(),
  body("status").isIn(["Pending", "Shipped", "Delivered", "Cancelled", "Returned"])
];

export const orderListValidator = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("platform").optional().isIn(["Amazon", "Flipkart", "Meesho", "Offline"])
];
