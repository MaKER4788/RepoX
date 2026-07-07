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
router.get("/:id", async (req, res) => {

    const project = await Project.findById(req.params.id)
        .populate("owner");

    if (!project) {
        return res.status(404).send("Project not found");
    }

    const relatedProjects = await Project.find({
        category: project.category,
        _id: { $ne: project._id }
    })
    .populate("owner")
    .limit(3);

    res.render("project", {
        project,
        relatedProjects
    });

});
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