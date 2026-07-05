const User = require("../models/user");
const passport = require("passport");

exports.registerPage = (req, res) => {
    res.render("register");
};

exports.loginPage = (req, res) => {
    res.render("login");
};

exports.register = async (req, res, next) => {
    try {
        const user = new User({
            fullname: req.body.fullname,
            username: req.body.username,
            email: req.body.email,
            age: req.body.age
        });

        await User.register(user, req.body.password);

        passport.authenticate("local")(req, res, () => {
            res.redirect("/profile");
        });

    } catch (err) {
        next(err);
    }
};

exports.logout = (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect("/");
    });
};