var express = require("express");
var router = express.Router();
const Project = require("../models/project");
const { isLoggedIn } = require("../middlewares/middleware");

// Success handler that renders the Thank You page after a purchase.
// Requires authentication and a valid, published project id.
//
// NOTE: When the Razorpay checkout flow is implemented, verify the Razorpay
// payment signature here (or in a webhook) BEFORE rendering this page. Do not
// trust req.body alone to indicate a completed payment.
router.post("/success", isLoggedIn, async function (req, res, next) {
  try {
    let project = null;
    if (req.body.projectId && /^[0-9a-fA-F]{24}$/.test(req.body.projectId)) {
      project = await Project.findOne({ _id: req.body.projectId, published: true });
    }
    res.render("thankyou", { project: project || null });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
