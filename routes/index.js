var express = require('express');
var router = express.Router();
const passport = require("passport");          // ✅ ADD THIS
const LocalStrategy = require("passport-local").Strategy;
const userModel = require("../models/user");
passport.use(new LocalStrategy(userModel.authenticate()));
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get("/profile",isLoggedIn, function(req,res){
  res.render("profile");
});
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
router.get("/upload", isLoggedIn, (req, res) => {
    res.render("upload");
});
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}
module.exports = router;
