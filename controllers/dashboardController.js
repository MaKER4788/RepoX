const Project = require("../models/project");

exports.getDashboard = async (req, res) => {

    const projects = await Project.find({
        owner: req.user._id
    }).sort({ createdAt: -1 });

    res.render("dashboard", {
        user: req.user,
        projects
    });

};

exports.editProjectPage = async (req, res) => {

    const project = await Project.findById(req.params.id);

    if (!project) {
        return res.status(404).send("Project not found");
    }

    if (project.owner.toString() !== req.user._id.toString()) {
        return res.status(403).send("Unauthorized");
    }

    res.render("editProject", {
        project
    });

};