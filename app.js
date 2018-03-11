// run command:
// DEBUG=pm-app:* npm start

// auto re-run on save command:
// DEBUG=pm-app:* npm run devstart

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// default routes
var index = require('./routes/index');
var users = require('./routes/users');

// added routes
var dashboard = require('./routes/dashboard');

var app = express();

// Set up mongoose connection
var mongoose = require('mongoose');
var mongoDB = 'mongodb://group8:seng513@seng513-shard-00-00-zscro.mongodb.net:27017,seng513-shard-00-01-zscro.mongodb.net:27017,seng513-shard-00-02-zscro.mongodb.net:27017/test?ssl=true&replicaSet=seng513-shard-0&authSource=admin';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// Open event is fired when mongoose successfully connects to the db
db.on('open', function () {
   console.log("Succesfully connected to seng513 mongoDB");
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/dashboard', dashboard);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
