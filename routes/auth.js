const path = require("path");
const express = require("express");
const { check, body } = require("express-validator/check");

const authController = require("../controllers/auth");
const User = require("../models/user");

const router = express.Router();

router.get("/login", authController.getLogin);
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email address."),
    body("password", "Password has to be valid.")
      .trim()
      .isLength({ min: 5 })
      .isAlphanumeric()
  ],
  authController.postLogin
);

router.post("/logout", authController.postLogout);
router.get("/signup", authController.getSignup);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject(
              "Email already exists. Please choose another email."
            );
          }
        });
      }),
    body(
      "password",
      "Please enter a password with only number and text and at least 5 characters."
    )
      .trim()
      .isLength({ min: 5 })
      .isAlphanumeric(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords have to match!");
        }
        return true;
      })
  ],
  authController.postSignup
);
router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);
router.get("/reset/:token", authController.getChangePassword);
router.post("/change-password", authController.postChangePassword);

module.exports = router;
