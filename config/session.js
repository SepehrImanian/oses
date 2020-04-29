const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');

module.exports = {
    name: 'session_nine',
    secret: process.env.SESSION_SECRET_KEY,
    resave: true,
    saveUninitialized: true,
    cookie: { expires: new Date(Date.now() + 1000 * 60 * 6 )}, // when expire login session mili second (6h)
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    }) //save session in mongodb
}