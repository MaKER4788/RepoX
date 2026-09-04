require("dotenv").config();
const User = require("./models/user");
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { doubleCsrf } = require("csrf-csrf");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const crypto = require("crypto");
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
const sitemapRoutes = require("./routes/sitemap");
const paymentRoutes = require("./routes/payments");
var app = express();

const isProd = process.env.NODE_ENV === "production";

// Session secret: fail fast in production, otherwise generate a random one
// (never fall back to a hardcoded guessable value).
let sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  if (isProd) {
    console.error("SESSION_SECRET must be set in production. Aborting.");
    process.exit(1);
  }
  sessionSecret = crypto.randomBytes(64).toString("hex");
  console.warn("SESSION_SECRET not set; using a random per-boot secret (sessions reset on restart).");
}

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.locals.mediaUrl = function (mediaPath) {
    if (!mediaPath) return "";
    return /^https?:\/\//.test(mediaPath) ? mediaPath : "/" + mediaPath;
};
app.use(expressSession({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: isProd,
        maxAge: 7 * 24 * 60 * 60 * 1000
    },
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

// Security headers (CSP, X-Frame-Options, HSTS, etc.)
// Note: 'unsafe-inline' for scripts/styles is required by the existing templates
// (inline onclick/onsubmit handlers and inline <script> blocks); the rest of the
// CSP defaults (frame-ancestors 'self', object-src 'none', upgrade-insecure-requests)
// still apply.
app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            "script-src": ["'self'", "'unsafe-inline'"],
            "script-src-attr": ["'unsafe-inline'"],
            "style-src": ["'self'", "https:", "'unsafe-inline'"]
        }
    }
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// CSRF protection
const csrfSecret = process.env.CSRF_SECRET || sessionSecret;
const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
    getSecret: () => csrfSecret,
    getSessionIdentifier: (req) => req.session.id,
    getCsrfTokenFromRequest: (req) => req.body._csrf,
    cookieName: isProd ? "__Host-repox-xsrf-token" : "repox-xsrf-token",
    cookieOptions: { httpOnly: true, sameSite: "lax", secure: isProd, path: "/" },
    size: 64,
    ignoredMethods: ["GET", "HEAD", "OPTIONS"]
});
app.use((req, res, next) => {
    res.locals.csrfToken = generateCsrfToken(req, res);
    next();
});
app.use(doubleCsrfProtection);

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
app.use("/payments", paymentRoutes);
app.use('/', sitemapRoutes);

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

  // render custom 404 page, or generic error page for other statuses
  res.status(err.status || 500);
  if (err.status === 404) {
    res.render('404');
  } else {
    res.render('error');
  }
});

module.exports = app;
