

const Project = require("../models/project");
const { uploadBuffer } = require("../config/cloudinary");

exports.createProject = async (req, res) => {
    try {

        const thumbnail = req.files?.thumbnail?.[0]?.buffer
            ? await uploadBuffer(req.files.thumbnail[0].buffer, "repox/thumbnails")
            : "";

        const screenshots = [];
        for (const file of req.files?.screenshots || []) {
            screenshots.push(await uploadBuffer(file.buffer, "repox/screenshots"));
        }

        const zipFile = req.files?.projectZip?.[0]?.buffer
            ? await uploadBuffer(req.files.projectZip[0].buffer, "repox/zips")
            : "";

        const documentation = req.files?.documentation?.[0]?.buffer
            ? await uploadBuffer(req.files.documentation[0].buffer, "repox/docs")
            : "";

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

            thumbnail,
            screenshots,

            zipFile,

            documentation,

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
exports.updateProject = async (req, res) => {

    try {

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).send("Project not found");
        }

        if (project.owner.toString() !== req.user._id.toString()) {
            return res.status(403).send("Unauthorized");
        }
        if (req.files?.thumbnail?.[0]?.buffer) {
    project.thumbnail = await uploadBuffer(req.files.thumbnail[0].buffer, "repox/thumbnails");
}
        if (req.files?.screenshots?.length) {
    project.screenshots = [];
    for (const file of req.files.screenshots) {
        project.screenshots.push(await uploadBuffer(file.buffer, "repox/screenshots"));
    }
}
        if (req.files?.projectZip?.[0]?.buffer) {
    project.zipFile = await uploadBuffer(req.files.projectZip[0].buffer, "repox/zips");
}
        if (req.files?.documentation?.[0]?.buffer) {
    project.documentation = await uploadBuffer(req.files.documentation[0].buffer, "repox/docs");
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
        project.features = req.body.features;
        project.installation = req.body.installation;
        project.requirements = req.body.requirements;
        project.included = req.body.included;
        project.refundPolicy = req.body.refundPolicy;
        await project.save();

        res.redirect("/dashboard");

    } catch (err) {

        console.error(err);
        res.status(500).send(err.message);

    }

};
exports.deleteProject = async (req, res) => {

    try {

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).send("Project not found");
        }

        if (project.owner.toString() !== req.user._id.toString()) {
            return res.status(403).send("Unauthorized");
        }

        await Project.findByIdAndDelete(req.params.id);

        res.redirect("/dashboard");

    } catch (err) {

        console.error(err);
        res.status(500).send(err.message);

    }

};
exports.getProject = async (req, res) => {

    try {

        const project = await Project.findById(req.params.id)
            .populate("owner")
            .populate({
                path: "reviews",
                populate: {
                    path: "user"
                }
            });

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

    } catch (err) {

        console.error(err);
        res.status(500).send(err.message);

    }

};