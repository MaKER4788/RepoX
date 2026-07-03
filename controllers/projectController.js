

const Project = require("../models/project");

exports.createProject = async (req, res) => {
        console.log(req.body.price);
console.log(typeof req.body.price);
console.log(Array.isArray(req.body.price));
    try {

        const project = await Project.create({

            owner: req.user._id,

            title: req.body.title,

            shortDescription: req.body.shortDescription,

            description: req.body.description,

            category: req.body.category,

            techStack: req.body.techStack
                ? req.body.techStack.split(",").map(item => item.trim())
                : [],

            tags: req.body.tags
                ? req.body.tags.split(",").map(item => item.trim())
                : [],

            thumbnail: req.files.thumbnail[0].path.replace(/\\/g, "/"),

            screenshots: req.files.screenshots
                ? req.files.screenshots.map(file => file.filename)
                : [],

            zipFile: req.files.projectZip
                ? req.files.projectZip[0].filename
                : "",

            documentation: req.files.documentation
                ? req.files.documentation[0].filename
                : "",

            liveDemo: req.body.liveDemo,

            github: req.body.github,

            supportEmail: req.body.supportEmail,

            price: Number(req.body.price),

            discount: Number(req.body.discount),

            license: req.body.license,

            support: req.body.support,

            version: req.body.version,

            lastUpdated: req.body.lastUpdated,

            changelog: req.body.changelog,

            published: req.body.action === "publish"

        });
        console.log("Saved Project =", project);

        console.log(project);

        res.redirect("/profile");

    } catch (err) {

       console.error("❌ ERROR:");
    console.error(err);
    console.error(err.stack);
    res.status(500).send(err.message);

    }
};