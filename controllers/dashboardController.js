const path = require("path");
const Project = require("../models/project");

exports.getDashboard = async (req, res) => {

    const projects = await Project.find({
        owner: req.user._id
    }).sort({ createdAt: -1 });

    res.sendFile(path.join(__dirname, "..", "html", "dashboard.html"));

};

