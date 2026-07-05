const express = require("express");
const router = express.Router();
const Project = require("../models/project");
const { isLoggedIn } = require("../middlewares/middleware");
router.get("/", isLoggedIn, function(req, res) {

    res.render("profile", {
        user: req.user
    });

});



module.exports = router;