'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('express-handlebars'); /*VISTAS*/
const expressValidator = require('express-validator');
const app = express();
const config = require('./config');
const api = require('./routes/apiroutes');
const index_routes = require('./routes/index');
const admin_routes = require('./routes/admin');
const cookieParser = require('cookie-parser');
const morgan      = require('morgan');
const exchange_routes = require('./routes/exchange');

const path = require('path'),
      fs = require('fs');
var session = require('express-session');

const MongoDBStore = require('connect-mongodb-session')(session);

var passport = require('passport');
var flash 		= require('connect-flash');

app.use(cookieParser());
app.use(flash());
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(expressValidator());

app.use(session({
	secret : "secq%&(w-e@rwqe-rAs@&dfasdfr%^&*)et",
	store: new MongoDBStore({
		uri: config.db,
		collection: 'session'
	}),
	cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 0.5 // 0.5 day
    },
	saveUninitialized: true,
	resave: true
}))

//app.use(morgan('dev'));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

app.engine('.hbs',hbs({ /*decirle a express que use hbs*/
	defaultLayout: 'default',
	extname: '.hbs',
	helpers: require('./services/helpers').helpers
}))

/*set view*/
app.set('view engine', '.hbs')

app.use('/api',api)
app.use('/Market',exchange_routes)
app.use('/',index_routes)
app.use('/qwertyuiop',admin_routes)
app.get('/whitepaper', function (req, res) {
    var filePath = "/public/file/whitepaper.pdf";
    fs.readFile(__dirname + filePath , function (err,data){
        res.contentType("application/pdf");
        res.send(data);
    });
});

// app.get('/how-to-buy', function (req, res) {
//     var filePath = "/public/file/howtobuy.pdf";
//     fs.readFile(__dirname + filePath , function (err,data){
//         res.contentType("application/pdf");
//         res.send(data);
//     });
// });
// app.get('/whitepaper.pdf', function (req, res) {
//     return false;
// });
app.use(function(req, res, next) {
	
  res.status(301).sendFile(process.cwd() + '/views/error/404.htm');
});

module.exports = app