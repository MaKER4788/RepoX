const express = require("express");
const router = express.Router();
const marketplaceController = require("../controllers/marketplaceController");
const Project = require("../models/project");
router.get("/", marketplaceController.getMarketplace);
router.get("/marketplace", async (req, res) => {

    const projects = await Project.find()
        .populate("owner")
        .sort({ createdAt: -1 });

    res.render("marketplace", {
        projects,
        user: req.user
    });

});
module.exports = router;