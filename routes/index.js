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
  res.render("upload",{project:null})
})




module.exports = router;
