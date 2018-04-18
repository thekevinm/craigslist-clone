var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mustacheExpress = require('mustache-express');
// var auth = require('./middlewares/auth')
var config = require('./config/default.json')
var session = require('express-session')
var authRoutes = require('./routes/auth')


var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.engine('mustache', mustacheExpress())
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('view engine', 'mustache')
app.set('views', __dirname + '/views')



// app.post('/images', upload.single('picture'), (req, res, next) => {
// 	res.redirect('/')
// })

//res.alert() then load home on refresh



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
	secret: config.session.secret,
	resave: true,
	saveUninitialized: false,
	cookie: {secure: false}
}))



// app.use((req, res, next) => {
// 	if (req.session.authenticated) {
// 		next()
// 	} else {
// 		res.redirect('/login')
// 	}
// })

app.use(authRoutes)

app.use(indexRouter);
// app.use('/users', usersRouter);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;
