const express = require("express");
const router = express.Router();

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

module.exports = router;