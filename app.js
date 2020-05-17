var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyparser = require('body-parser');
var http = require('http');

// connect to database
mongoose.connect("mongodb+srv://" + secrets.dbUser + ":" + secrets.dbPassword + "@woidbook-iwwlt.mongodb.net/" + secrets.dbName + "?retryWrites=true&w=majority");

// router
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user');

var express = require('express');
var app = express();

// set up http server
var httpServer = http.createServer(app);

app.use(logger('dev'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/user', usersRouter);

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
httpServer.listen(8000, () => console.log("Started userservice on port 8000"));

module.exports = app;
