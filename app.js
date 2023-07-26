
const errorController = require('./controllers/error');


const express = require('express');
const path = require('path');
const session = require("express-session");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');


const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// load the routes
const l = require('./routes/admin');
const r = require('./routes/home-page');


// plug in the body parser middleware and static middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//prevent default caching
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
});

app.use(cookieParser());


app.use(session({
    secret: "keyboard cat",
    resave: false, // Force save of session for each request
    saveUninitialized: true,
    cookie: {maxAge: 3*60*60*1000}//session ends after 3 hours
}))



app.use('/admin', l);
app.use(r);


// plug in the error controller
app.use(errorController.getErrors);
let port = process.env.PORT || 3000;
app.listen(port);





