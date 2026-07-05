const Project = require("../models/project");

exports.getMarketplace = async (req, res) => {

    const search = req.query.search || "";
    const category = req.query.category || "";

    let filter = {
        published: true
    };

    if (search) {

        filter.title = {
            $regex: search,
            $options: "i"
        };

    }

    if (category && category !== "All") {

        filter.category = category;

    }

    const projects = await Project.find(filter)
        .populate("owner")
        .sort({ createdAt: -1 });

    res.render("marketplace", {

        projects,
        user: req.user,
        search,
        category

    });

};