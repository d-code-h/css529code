// Packages
const createError = require('http-errors'),
  path = require('path'),
  logger = require('morgan'),
  mongoose = require('mongoose'),
  express = require('express'),
  bodyParser = require('body-parser'),
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  session = require('express-session'),
  // expressSanitizer = require('express-sanitizer'),
  flash = require('connect-flash'),
  // cookieParser = require('cookie-parser'),
  // MongoDBStore = require('connect-mongodb-session')(session),
  app = express();

// Routes
const indexRouter = require('./routes/index'),
  studentsRouter = require('./routes/students'),
  instructorsRouter = require('./routes/instructors');

// Models
const User = require('./models/user');

// Configuration
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log('Connection to DB Successful!');
  })
  .catch((err) => {
    console.log(err);
  });

// view engine setup
app.use(logger('dev'));
// app.use(express.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(expressSanitizer());
app.use(flash());

// express-session
app.use(
  session({
    secret: process.env.SECRET,
    // store: store,
    resave: true,
    saveUninitialized: true,
  })
);

// Middlewares
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Passport
app.use(passport.initialize());
app.use(passport.session());
// passport.use(User.createStrategy());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Use Routes
app.use('/', indexRouter);
app.use('/student', studentsRouter);
app.use('/instructor', instructorsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
