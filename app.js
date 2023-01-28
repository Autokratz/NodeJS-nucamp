var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const session = require('express-session');
const FileStore = require('session-file-store')(session); // TODO review first class functions
const passport = require('passport');
const authenticate = require('./authenticate');
const mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');
const url = "mongodb://127.0.0.1:27017/nucampsite"; // Recent updates, localhost does not work
const connect = mongoose.connect(url, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
});
connect.then(() => console.log('Connected correctly to server'),
    err => console.log(err) // Another way to handle promise rejection
);
var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(session({
    name: 'session-id',
    secret: 'ophelia-82-89-339922-1583',
    saveUninitialized: false,
    resave: false,
    store: new FileStore()
}));

// Auth
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', usersRouter);

function auth(req, res, next) {
    console.log(req.user);

    if (!req.user) {
        console.log(req.session); // Log the current session details
        // False if the cookies is not assigned
        const err = new Error('You are not authenticated!');
        err.status = 401;
        return next(err);
    } else {
       return next(); // Pass to next middleware
    }
}

app.use(auth); // Note that middleware is cascading
app.use(express.static(path.join(__dirname, 'public')));
app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);
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