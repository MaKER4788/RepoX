var express = require("express");
var router = express.Router();
const Project = require("../models/project");

// TODO: Wire this up when the Razorpay checkout flow is implemented.
// This is the success handler that renders the Thank You page after a purchase.
router.post("/success", async function (req, res, next) {
  try {
    let project = null;
    if (req.body.projectId) {
      project = await Project.findById(req.body.projectId);
    }
    res.render("thankyou", { project: project || null });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
