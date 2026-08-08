const express = require("express");
const router = express.Router();
const wishlistcontroller = require("../controllers/wishlistcontroller");
const { isLoggedIn } = require("../middlewares/middleware");

router.post(
    "/:id",
    isLoggedIn,
    wishlistcontroller.toggleWishlist
);
module.exports = router;