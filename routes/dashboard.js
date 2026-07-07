const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const { isLoggedIn } = require("../middlewares/middleware");
const upload = require("../config/multer");
const projectController = require("../controllers/projectController");
router.get("/", isLoggedIn, dashboardController.getDashboard);

module.exports = router;