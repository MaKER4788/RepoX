var express = require('express');
var router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const userModel = require("../models/user");
const projectController = require("../controllers/projectController");
const upload = require("../config/multer");
const Project = require("../models/project");

passport.use(new LocalStrategy(userModel.authenticate()));

router.get('/', async function(req, res, next) {
  try {
    const featuredProjects = await Project.find({ published: true })
      .populate("owner")
      .sort({ createdAt: -1 })
      .limit(3);

    const trendingProjects = await Project.find({ published: true })
      .populate("owner")
      .sort({ createdAt: -1 })
      .limit(3);

    const newProjects = await Project.find({ published: true })
      .populate("owner")
      .sort({ createdAt: -1 })
      .limit(3);

    res.render('index', { featuredProjects, trendingProjects, newProjects });
  } catch(err) {
    next(err);
  }
});

router.get("/upload", function(req, res) {
  res.render("upload", { project: null });
});

module.exports = router;
