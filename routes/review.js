const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/reviewController");
const { isLoggedIn } = require("../middlewares/middleware");

router.post(
    "/:id",
    isLoggedIn,
    reviewController.createReview
);

module.exports = router;