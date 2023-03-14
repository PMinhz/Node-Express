const express = require('express')

const indexRouter = require('./routers')
const authRouter = require('./routers/auth')
const adminRouter = require('./routers/admin')
const app = express()
const mainRouter = require('./routers/auth')
const bodyParser = require('body-parser')


var con = require('./lib/db')
var createError = require('http-errors');
var session = require('express-session');
var flash = require('express-flash');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressValidator = require('express-validator');
var mysql = require('mysql');

app.use(session({
    secret: 'swssszzzfesa',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))
app.use(flash());


app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', indexRouter)
app.use('/auth', authRouter)
app.use('/admin', adminRouter)
app.use('/main', mainRouter)





const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`http://localhost:${PORT}`))