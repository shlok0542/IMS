import { body, param, query } from "express-validator";

export const createProductValidator = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("category").trim().notEmpty().withMessage("category is required"),
  body("sellingPrice").isFloat({ min: 0 }).withMessage("sellingPrice must be >= 0"),
  body("costPrice").isFloat({ min: 0 }).withMessage("costPrice must be >= 0"),
  body("initialStockQuantity").optional().isInt({ min: 0 }),
  body("minimumStockLevel").optional().isInt({ min: 0 }),
  body("marketplaceStock.amazonStock").optional().isInt({ min: 0 }),
  body("marketplaceStock.flipkartStock").optional().isInt({ min: 0 }),
  body("marketplaceStock.meeshoStock").optional().isInt({ min: 0 })
];

export const updateProductValidator = [
  param("id").isMongoId().withMessage("invalid product id"),
  body("name").optional().trim().notEmpty(),
  body("category").optional().trim().notEmpty(),
  body("sellingPrice").optional().isFloat({ min: 0 }),
  body("costPrice").optional().isFloat({ min: 0 }),
  body("minimumStockLevel").optional().isInt({ min: 0 }),
  body("supplierId").optional({ nullable: true }).isMongoId()
];

export const productListValidator = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("search").optional().isString(),
  query("category").optional().isString()
];

export const idParamValidator = [param("id").isMongoId().withMessage("invalid id")];
