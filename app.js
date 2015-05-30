var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
// accesslog and errorlog
var fs = require('fs');
var accessLogfile = fs.createWriteStream('./logs/access.log', {flags:'a'});
var errorLogfile = fs.createWriteStream('./logs/error.log', {flags: 'a'});
app.use(logger('combined', {stream: accessLogfile}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// session
var settings = require('./settings');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
app.use(session({
  secret: settings.cookie.secret,
  store: new MongoStore({
    db: settings.db.name,
    host: settings.db.host,
    port: settings.db.port
  }),
  resave: true,
  saveUninitialized: true,
  cookie: {maxAge: settings.cookie.maxage * 60 * 1000, httpOnly: true, secure: false, path: '/'}
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// log the error. note that '404' is not error
app.use(function(err, req, res, next) {
  errorLogfile.write('[' + new Date() + ']' + req.url + '\n' + err.stack + 'n');
  next(err);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

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
