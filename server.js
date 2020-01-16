const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const config = require("./config/config");

const errorController = require("./controllers/error");

const User = require("./models/user");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const csrfProtection = csrf({});
const app = express();

const mongoDBStore = new MongoDBStore({
  uri: config.MONGODB_URI,
  collection: "sessions"
});

app.set("view engine", "ejs");
app.set("views", "views");

/**
 * MIDDLEWARE
 */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    store: mongoDBStore,
    secret: "my secret",
    resave: false,
    saveUninitialized: false
    //cookie: { maxAge: 3600 }
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => {
      console.log(err);
    });
});

//general vars
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

/**
 * ROUTING
 */
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use("/", errorController.get404);

/**
 * START APPLICATION
 */
mongoose
  .connect(config.MONGODB_URI)
  .then(result => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
