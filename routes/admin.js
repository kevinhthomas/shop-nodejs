const express = require("express");
const { body } = require("express-validator/check");

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/add-product", isAuth, adminController.getAddProduct);
router.get("/products", isAuth, adminController.getProducts);
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);
router.post("/delete-product", isAuth, adminController.postDeleteProduct);

router.post(
  "/add-product",
  [
    body("title")
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body("imageUrl").isURL(),
    body("price").isFloat(),
    body("description")
      .trim()
      .isLength({ min: 5, max: 400 })
  ],
  isAuth,
  adminController.postAddProduct
);

router.post(
  "/edit-product",
  [
    body("title")
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body("imageUrl").isURL(),
    body("price").isFloat(),
    body("description")
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  adminController.postEditProduct
);

module.exports = router;
