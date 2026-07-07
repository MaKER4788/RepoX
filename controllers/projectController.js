

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
        ? req.files.screenshots.map(file =>
        file.path.replace(/\\/g, "/")
               )
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

            published: req.body.action === "publish",
            features: req.body.features,

installation: req.body.installation,

requirements: req.body.requirements,

included: req.body.included,

refundPolicy: req.body.refundPolicy

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
exports.updateProject = async (req, res) => {

    try {

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).send("Project not found");
        }

        if (project.owner.toString() !== req.user._id.toString()) {
            return res.status(403).send("Unauthorized");
        }

        project.title = req.body.title;
        project.shortDescription = req.body.shortDescription;
        project.description = req.body.description;
        project.category = req.body.category;

        project.techStack = req.body.techStack
            ? req.body.techStack.split(",").map(item => item.trim())
            : [];

        project.tags = req.body.tags
            ? req.body.tags.split(",").map(item => item.trim())
            : [];

        project.price = Number(req.body.price);
        project.discount = Number(req.body.discount);

        project.liveDemo = req.body.liveDemo;
        project.github = req.body.github;
        project.supportEmail = req.body.supportEmail;

        project.license = req.body.license;
        project.support = req.body.support;
        project.version = req.body.version;
        project.lastUpdated = req.body.lastUpdated;
        project.changelog = req.body.changelog;

        await project.save();

        res.redirect("/dashboard");

    } catch (err) {

        console.error(err);
        res.status(500).send(err.message);

    }

};