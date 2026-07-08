const express = require("express");
const router = express.Router();
const Project = require("../models/project");
const upload = require("../config/multer");
const projectController = require("../controllers/projectController");

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect("/login");
}

router.post(
    "/create",

    isLoggedIn,
    
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "screenshots", maxCount: 10 },
        { name: "projectZip", maxCount: 1 },
        { name: "documentation", maxCount: 1 }
    ]),

    projectController.createProject
);
router.get("/:id", projectController.getProject);
router.get(
    "/:id/edit",
    isLoggedIn,
    projectController.editProjectPage
);

router.post(
    "/:id/edit",
    isLoggedIn,
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "screenshots", maxCount: 10 },
        { name: "projectZip", maxCount: 1 },
        { name: "documentation", maxCount: 1 }
    ]),
    projectController.updateProject
);
router.post(
    "/:id/delete",
    isLoggedIn,
    projectController.deleteProject
);
module.exports = router;