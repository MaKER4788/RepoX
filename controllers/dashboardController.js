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

