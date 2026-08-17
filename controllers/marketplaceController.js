const Project = require("../models/project");

exports.getMarketplace = async (req, res) => {

    const search = req.query.search || "";
    const category = req.query.category || "";
    const tech = req.query.tech || "";
    const min = req.query.min || "";
    const max = req.query.max || "";
    const sort = req.query.sort || "newest";
     const page = parseInt(req.query.page) || 1;
     const limit = 12;
     
     
    
    
    let filter = {
        published: true
    };
     if (min || max) {

    filter.price = {};

    if (min) {
        filter.price.$gte = Number(min);
    }

    if (max) {
        filter.price.$lte = Number(max);
    }

}
    if (search) {

        filter.title = {
            $regex: search,
            $options: "i"
        };

    }

    if (category && category !== "All") {

        filter.category = category;

    }

    if (tech) {

        filter.techStack = { $regex: tech, $options: "i" };

    }
    let sortOption = {
    createdAt: -1
};

if (sort === "oldest") {
    sortOption = { createdAt: 1 };
}

if (sort === "low") {
    sortOption = { price: 1 };
}

if (sort === "high") {
    sortOption = { price: -1 };
}
const totalProjects = await Project.countDocuments(filter);
    const projects = await Project.find(filter)
        .populate("owner")
        .sort(sortOption)
        .skip((page-1)*limit)
        .limit(limit);
const totalPages = Math.ceil(totalProjects/limit);
    res.render("marketplace", {

        projects,
        user: req.user,
        search,
        category,
        tech,
        max,
        min,
        sort,
        page,
        totalPages

    });

};