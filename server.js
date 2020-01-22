const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const config = require('./config/config');
const error = require('./utils/error');
const multer = require('multer');

const errorController = require('./controllers/error');

const User = require('./models/user');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const csrfProtection = csrf({});
const app = express();

const mongoDBStore = new MongoDBStore({
  uri: config.MONGODB_URI,
  collection: 'sessions'
});

/**
 * VIEW SETUP
 */
app.set('view engine', 'ejs');
app.set('views', 'views');

/**
 * PARSE REQUEST BODY
 */
app.use(bodyParser.urlencoded({ extended: false }));

/**
 *  FILE UPLOADING
 */
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

/**
 * PUBLIC RESOURCES
 */
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

/**
 * SESSION AND PROTECTION
 */
app.use(
  session({
    store: mongoDBStore,
    secret: 'my secret',
    resave: false,
    saveUninitialized: false
    //cookie: { maxAge: 3600 }
  })
);
app.use(csrfProtection);
app.use(flash());

/**
 * SET UP USER IN SESSION
 */
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }

      req.user = user;
      next();
    })
    .catch((err) => {
      return error.throwError(err, next);
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

/**
 * ROUTING
 */
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get('/500', errorController.get500);
app.use('/', errorController.get404);

/**
 * 500 ERROR HANDLING
 */
app.use((error, req, res, next) => {
  //res.status(error.httpStatusCode).render(...)
  console.log(error);
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
});

/**
 * START APPLICATION
 */
mongoose
  .connect(config.MONGODB_URI)
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
