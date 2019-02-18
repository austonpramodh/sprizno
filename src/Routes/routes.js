const express = require("express");
const sellerRoutes = require("./seller/index");
const userRoutes = require("./user/index");

const router = express.Router();

router.use("/seller", sellerRoutes);
router.use("/user", userRoutes);

module.exports = router;
