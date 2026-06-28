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
router.post("/register", async function (req, res, next) {
  try {
    const userdata = new userModel({
      username: req.body.username,
      secret: req.body.secret,
    });

    await userModel.register(userdata, req.body.password);

    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  } catch (err) {
    next(err);
  }
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
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}
module.exports = router;
