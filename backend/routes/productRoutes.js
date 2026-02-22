import express from "express";
import protect from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  softDeleteProduct,
  bulkUploadProducts
} from "../controllers/productController.js";
import {
  createProductValidator,
  idParamValidator,
  productListValidator,
  updateProductValidator
} from "../validators/productValidators.js";

const router = express.Router();

router.use(protect);

router.get("/", productListValidator, validateRequest, listProducts);
router.post("/", createProductValidator, validateRequest, createProduct);
router.post("/bulk-upload", bulkUploadProducts);
router.get("/:id", idParamValidator, validateRequest, getProductById);
router.put("/:id", updateProductValidator, validateRequest, updateProduct);
router.delete("/:id", idParamValidator, validateRequest, softDeleteProduct);

export default router;
