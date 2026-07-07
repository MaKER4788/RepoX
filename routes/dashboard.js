const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const { isLoggedIn } = require("../middlewares/middleware");
const upload = require("../config/multer");
const projectController = require("../controllers/projectController");
router.get("/", isLoggedIn, dashboardController.getDashboard);
router.get("/edit/:id", isLoggedIn, dashboardController.editProjectPage);
router.post("/:id/edit",
    isLoggedIn,
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "screenshots", maxCount: 10 },
        { name: "projectZip", maxCount: 1 },
        { name: "documentation", maxCount: 1 }
    ]),
    projectController.updateProject
);
module.exports = router;