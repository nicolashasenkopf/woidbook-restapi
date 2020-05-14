var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyparser = require('body-parser');
var http = require('http');

// firebase admin
var admin = require('firebase-admin');
var serviceAccount = require('./firebase_admin/woidbook-b76ba-firebase-adminsdk-a2do8-83f6884202.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

// router
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var express = require('express');
var app = express();

// set up http server
var httpServer = http.createServer(app);

app.use(logger('dev'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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

// start http server on port 8000
httpServer.listen(8000, () => onStartup());


function onStartup() {
  admin.auth().getUserByEmail("nicolas@nicolas.com").then((users) => console.log(users));
}

module.exports = app;
