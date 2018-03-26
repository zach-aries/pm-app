// run command:
// DEBUG=pm-app:* npm start

// auto re-run on save command:
// DEBUG=pm-app:* npm run devstart

// Imports ==============================================================
// application
var express = require('express');
var mongoose = require('mongoose');
var path = require('path');

// http-helpers
// uncomment to log requests to console
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var validator = require('express-validator');

// authentication
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy

// helpers
var favicon = require('serve-favicon');
var debug = require('debug')('pm-app:server');
var configDB = require('./config/database');

var app = express();

// Config ===============================================================
// db connection
mongoose.Promise = global.Promise;
mongoose.connect(configDB.url);
var db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// Open event is fired when mongoose successfully connects to the db
db.on('open', function () {
    debug("Succesfully connected to:", db.host);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// uncomment to log requests to console
//app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(validator());
app.use(express.static(path.join(__dirname, 'public')));

// default routes
var index = require('./routes/index');
var dashboard = require('./routes/dashboard');

app.use('/', index);
app.use('/dashboard', dashboard);

// passport config
var User = require('./models/user');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {

        message: err.message,
        error: {}
    });
});

module.exports = app;
