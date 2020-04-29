const express = require('express');
const router = express.Router();
const i18n = require("i18n");
const csrf = require('csurf');

// Middlewares
const redirectIfAuthenticated = require('app/http/middleware/redirectIfAuthenticated');
const redirectIfNotAdmin = require('app/http/middleware/redirectIfNotAdmin');
const errorHandler = require('app/http/middleware/errorHandler');
const csrfErrorHandler = require('app/http/middleware/csrfErrorHandler');

// i18n multi language
router.use((req , res , next) => {
    try {
        // read cookie
        let lang = req.signedCookies.lang;
        if(i18n.getLocales().includes(lang)) {
            req.setLocale(lang);
        } else {
            req.setLocale(i18n.getLocale());
        }
        next();
    } catch (err) {
        next(err);
    }
});

router.get('/lang/:lang' , (req , res) => {
    // change language with set cookie , create cookie
    let lang = req.params.lang;
    if(i18n.getLocales().includes(lang)) {
        res.cookie('lang' , lang , { maxAge: 1000 * 60 * 60 * 24 * 90 , signed: true });
    }
    res.redirect(req.header('Referer') || '/');
});

// Admin router
const adminRouter = require('./admin');
router.use('/admin' , redirectIfNotAdmin.handle , adminRouter);

router.use(csrfErrorHandler.handler); // for handeling csrf errors

// Home router
const homeRouter = require('./home');
router.use('/' , csrf({ cookie: true }) , homeRouter);

// Auth router
const authRouter = require('./auth');
router.use('/auth' , csrf({ cookie: true }) ,redirectIfAuthenticated.handle , authRouter);

// Error handeling (last route to collecting all erros for routes before)
router.all('*' , errorHandler.error404);
router.use(errorHandler.handler)

module.exports = router;