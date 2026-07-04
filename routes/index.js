var express = require('express');
var router = express.Router();
const passport = require("passport");          // ✅ ADD THIS
const LocalStrategy = require("passport-local").Strategy;
const userModel = require("../models/user");
const projectController = require("../controllers/projectController");
const upload = require("../config/multer");
const Project = require("../models/project");
passport.use(new LocalStrategy(userModel.authenticate()));
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get("/upload",function(req,res){
  res.render("upload")
})
router.get("/register", function(req, res) {
    res.render("register");
});
router.post("/register", async function (req, res, next) {
  try {
    const userdata = new userModel({
      fullname: req.body.fullname,
    username: req.body.username,
    email: req.body.email,
    age: req.body.age
    });

    await userModel.register(userdata, req.body.password);

    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  } catch (err) {
    next(err);
  }
});
router.get("/login", function(req, res) {
    res.render("login");
});

router.post("/login", passport.authenticate("local",{
  successRedirect: "/profile",
  failureRedirect: "/"
}), function(req,res){ })


router.get("/logout", function(req,res,next){
  req.logout(function(err) {
        if(err) { return next(err); }
        res.redirect('/');
  });
});
router.get("/profile", isLoggedIn, function(req, res) {

    res.render("profile", {
        user: req.user
    });

});
router.get("/marketplace", async (req, res) => {

    const projects = await Project.find()
        .populate("owner")
        .sort({ createdAt: -1 });

    res.render("marketplace", {
        projects,
        user: req.user
    });

});
router.get("/projects/:id", async (req, res) => {

    const project = await Project.findById(req.params.id)
        .populate("owner");

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

});
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}
module.exports = router;
