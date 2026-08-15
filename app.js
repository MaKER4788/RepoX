require("dotenv").config();
const User = require("./models/user");
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const passport = require('passport');
const expressSession = require("express-session");
const MongoStore = require("connect-mongo").MongoStore;
const flash = require("connect-flash");
const projectRoutes = require("./routes/projects");
const marketplaceRoutes = require("./routes/marketplace");
const profileroutes = require("./routes/profile");
const authRoutes = require("./routes/auth");
const wishlistRoutes = require("./routes/wishlist");
const dashboardRoutes = require("./routes/dashboard");
const reviewRoutes = require("./routes/review");
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.locals.mediaUrl = function (mediaPath) {
    if (!mediaPath) return "";
    return /^https?:\/\//.test(mediaPath) ? mediaPath : "/" + mediaPath;
};
app.use(expressSession({
    secret: process.env.SESSION_SECRET || "hell",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/resting"
    })
}));

app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static("uploads"));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/projects', projectRoutes);
app.use('/marketplace', marketplaceRoutes);
app.use('/profile', profileroutes);
app.use('/', authRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/dashboard', dashboardRoutes);
app.use("/reviews", reviewRoutes);

// Chrome DevTools well-known probe — respond with empty settings so it doesn't 404
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.json({});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
