const express = require("express");
const router = express.Router();

const passport = require("passport");
const authController = require("../controllers/authController");
const userModel = require("../models/user");
const { isLoggedIn } = require("../middlewares/middleware");

// Register
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

module.exports = router;