const path = require("path");
const express = require("express");
const router = express.Router();
const Project = require("../models/project");
const { isLoggedIn } = require("../middlewares/middleware");
router.get("/", isLoggedIn, function(req, res) {

    res.sendFile(path.join(__dirname, '..', 'html', 'profile.html'));

});



module.exports = router;