const Review = require("../models/review");
const Project = require("../models/project");

exports.createReview = async (req, res) => {

    try {

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).send("Project not found");
        }

        const review = await Review.create({

            user: req.user._id,

            project: project._id,

            rating: Number(req.body.rating),

            comment: req.body.comment

        });

        project.reviews.push(review._id);

        await project.save();

        res.redirect("/projects/" + project._id);

    } catch (err) {

        console.error(err);
        res.status(500).send(err.message);

    }

};